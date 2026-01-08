const params = new URLSearchParams(window.location.search);
const surahId = parseInt(params.get('id'));
const selectedReciterId = params.get('reciter') || localStorage.getItem('selectedReciter') || 'bader-hafs';

const reciterNameEl = document.getElementById('reciter-name');
const reciterFooterEl = document.getElementById('reciter-footer');
const riwayaSelect = document.getElementById('riwayaSelect');
const themeSelect = document.getElementById('themeSelect');
const audio = document.getElementById('surah-audio');

let allReciters = [];
let currentReciter = null;
let currentSurah = null;

// Theme setup
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.classList.add(`theme-${savedTheme}`);
themeSelect.value = savedTheme;
themeSelect.addEventListener('change', () => {
  document.body.classList.remove(`theme-${localStorage.getItem('theme')}`);
  const newTheme = themeSelect.value;
  document.body.classList.add(`theme-${newTheme}`);
  localStorage.setItem('theme', newTheme);
});

fetch('reciters.json')
  .then(res => res.json())
  .then(data => {
    allReciters = data.reciters;

    const baseReciterName = selectedReciterId.split('-')[0];
    const availableRiwayat = allReciters.filter(r => r.id.startsWith(baseReciterName));

    // Populate riwaya dropdown
    availableRiwayat.forEach(r => {
      const option = document.createElement('option');
      option.value = r.id;
      option.textContent = r.riwaya;
      riwayaSelect.appendChild(option);
    });

    // Set selected riwaya
    const saved = selectedReciterId;
    riwayaSelect.value = saved;

    updateReciterInfo(saved);
    localStorage.setItem('selectedReciter', saved);

    return fetch('data.json');
  })
  .then(res => res.json())
  .then(data => {
    currentSurah = data.surahs.find(s => s.id === surahId);
    if (!currentSurah) {
      document.getElementById('surah-title').textContent = 'السورة غير موجودة';
      return;
    }

    document.title = `سورة ${currentSurah.name}`;
    document.getElementById('surah-title').textContent = `سورة ${currentSurah.name}`;

    const details = document.getElementById('surah-details');
    details.innerHTML = `
      <li class="list-group-item">الترتيب: ${currentSurah.id}</li>
      <li class="list-group-item">عدد الآيات: ${currentSurah.ayahs}</li>
      <li class="list-group-item">نوعها: ${currentSurah.type}</li>
      <li class="list-group-item">أسماء أخرى: ${currentSurah.other_names.join(", ")}</li>
      <li class="list-group-item">الموضوعات: ${currentSurah.topics.join(", ")}</li>
    `;

    updateAudioSource();
  });

function updateReciterInfo(id) {
  currentReciter = allReciters.find(r => r.id === id);
  reciterNameEl.textContent = currentReciter.reciter;
  reciterFooterEl.textContent = currentReciter.reciter;
}

function updateAudioSource() {
  if (!currentReciter || !currentSurah) return;
  const paddedId = String(currentSurah.id).padStart(3, '0');
  audio.src = `${currentReciter.baseURL}${paddedId}.mp3`;
  audio.dataset.surahId = currentSurah.id;
}

riwayaSelect.addEventListener('change', () => {
  const newId = riwayaSelect.value;
  localStorage.setItem('selectedReciter', newId);
  updateReciterInfo(newId);
  updateAudioSource();
});

// Load verses from XML
fetch('quran-uthmani.xml')
  .then(res => res.text())
  .then(xmlText => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "application/xml");
    const surahNode = xml.querySelector(`sura[index="${surahId}"]`);
    if (!surahNode) return;

    const verses = surahNode.querySelectorAll('aya');
    const versesContainer = document.getElementById('verses');
    verses.forEach(aya => {
      const text = aya.getAttribute('text');
      const index = aya.getAttribute('index');
      const p = document.createElement('p');
      p.className = 'ayah';
      p.innerHTML = `<span>(${index})</span> ${text}`;
      versesContainer.appendChild(p);
    });
  });

document.getElementById('year').textContent = new Date().getFullYear();