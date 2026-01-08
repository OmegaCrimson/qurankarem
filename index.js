const list = document.getElementById('surah-list');
const searchInput = document.getElementById('search');
const reciterSelect = document.getElementById('reciterSelect');
const reciterName = document.getElementById('reciter-name');
const reciterFooter = document.getElementById('reciter-footer');
const themeSelect = document.getElementById('themeSelect');
let allSurahs = [];
let reciters = [];

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
    reciters = data.reciters;
    populateReciterSelect();
    const savedName = localStorage.getItem('selectedReciterName') || reciters[0].reciter;
    reciterSelect.value = savedName;
    updateReciterName(savedName);
    localStorage.setItem('selectedReciterName', savedName);
    return fetch('data.json');
  })
  .then(res => res.json())
  .then(data => {
    allSurahs = data.surahs;
    renderList(allSurahs);
  });

function populateReciterSelect() {
  const uniqueNames = [...new Set(reciters.map(r => r.reciter))];
  uniqueNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    reciterSelect.appendChild(option);
  });
}

function updateReciterName(name) {
  reciterName.textContent = name;
  reciterFooter.textContent = name;
}

reciterSelect.addEventListener('change', () => {
  const selectedName = reciterSelect.value;
  localStorage.setItem('selectedReciterName', selectedName);
  updateReciterName(selectedName);
  renderList(allSurahs);
});

function renderList(surahs) {
  const selectedName = reciterSelect.value;
  const firstRiwaya = reciters.find(r => r.reciter === selectedName);
  const reciterId = firstRiwaya?.id || reciters[0].id;

  list.innerHTML = '';
  surahs.forEach(surah => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `
      <a href="surah.html?id=${surah.id}&reciter=${reciterId}" class="fw-bold">
        سورة ${surah.name} (${surah.ayahs} آية)
      </a>`;
    list.appendChild(li);
  });
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  const filtered = allSurahs.filter(surah =>
    surah.name.includes(query)
  );
  renderList(filtered);
});

document.getElementById('year').textContent = new Date().getFullYear();
