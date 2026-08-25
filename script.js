const DATA = [
  { src:"images/milky way galaxy.jpg", name:"Milky Way Galaxy", cat:"space", catLabel:"Sky & Space" },
  { src:"images/planet saturn.jpg", name:"Planet Saturn", cat:"space", catLabel:"Sky & Space" },
  { src:"images/astronaut-spacewalk.jpg", name:"Spacewalk", cat:"space", catLabel:"Sky & Space" },
  { src:"images/planet-earth.jpg", name:"Planet Earth", cat:"space", catLabel:"Sky & Space" },
  { src:"images/eiffel-tower-night.jpg", name:"Eiffel Tower", cat:"landmark", catLabel:"Landmark" },
  { src:"images/santorini-blue-domes.jpg", name:"Santorini", cat:"landmark", catLabel:"Landmark" },
  { src:"images/taj-mahal-sunrise.jpg", name:"Taj Mahal", cat:"landmark", catLabel:"Landmark" },
  { src:"images/white-horse-running.jpg", name:"White Horse", cat:"animal", catLabel:"Creature" },
  { src:"images/deer-herd.jpg", name:"Deer Herd", cat:"animal", catLabel:"Creature" },
  { src:"images/monarch-butterfly.jpg", name:"Monarch Butterfly", cat:"animal", catLabel:"Creature" },
  { src:"images/forest-stream.jpg", name:"Forest Stream", cat:"nature", catLabel:"Garden" },
  { src:"images/blue-bellflowers.jpg", name:"Bluebells", cat:"nature", catLabel:"Garden" },
  { src:"images/mountain-cliff-sunrise.jpg", name:"Mountain Cliff", cat:"nature", catLabel:"Garden" },
  { src:"images/red-rose.jpg", name:"Red Rose", cat:"nature", catLabel:"Garden" },
];

const TILTS = [0];

const board = document.getElementById('board');
const noResults = document.getElementById('noResults');

function render(){
  board.innerHTML = '';
  DATA.forEach((item, i) => {
    const pin = document.createElement('div');
    pin.className = 'pin';
    pin.style.setProperty('--rot', TILTS[i % TILTS.length] + 'deg');
    pin.style.animationDelay = (i * 0.06) + 's';
    pin.dataset.cat = item.cat;
    pin.dataset.index = i;
    pin.innerHTML = `
      <div class="frame"><img src="${item.src}" alt="${item.name}" loading="lazy"></div>
      <div class="cap">
        <span class="name">${item.name}</span>
        <span class="cat">${item.catLabel}</span>
      </div>
    `;
    pin.addEventListener('click', () => openViewer(i));
    board.appendChild(pin);
  });
  updateCounts();
}
render();

function updateCounts(){
  const cats = ['all','space','landmark','animal','nature'];
  cats.forEach(cat => {
    const el = document.getElementById('cnt-' + cat);
    if(!el) return;
    const n = cat === 'all' ? DATA.length : DATA.filter(d => d.cat === cat).length;
    el.textContent = n;
  });
}

/* ---------- Filtering ---------- */
const navButtons = document.querySelectorAll('.filters button');
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    let visibleCount = 0;
    document.querySelectorAll('.pin').forEach(pin => {
      const show = (filter === 'all' || pin.dataset.cat === filter);
      pin.classList.toggle('hide', !show);
      if(show) visibleCount++;
    });
    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
  });
});

/* ---------- Viewer (lightbox) ---------- */
const viewer = document.getElementById('viewer');
const vImg = document.getElementById('vImg');
const vTag = document.getElementById('vTag');
const vName = document.getElementById('vName');
const vIndex = document.getElementById('vIndex');
let currentIndex = 0;

function visibleIndices(){
  return Array.from(document.querySelectorAll('.pin'))
    .filter(p => !p.classList.contains('hide'))
    .map(p => parseInt(p.dataset.index));
}

function openViewer(index){
  currentIndex = index;
  updateViewer();
  viewer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateViewer(){
  const item = DATA[currentIndex];
  vImg.classList.remove('show');
  setTimeout(() => {
    vImg.src = item.src;
    vImg.alt = item.name;
    vTag.textContent = item.catLabel;
    vName.textContent = item.name;
    const vis = visibleIndices();
    const pos = vis.indexOf(currentIndex) + 1;
    const total = vis.length || DATA.length;
    vIndex.textContent = `${pos} of ${total}`;
    requestAnimationFrame(() => vImg.classList.add('show'));
  }, 100);
}

function step(dir){
  const vis = visibleIndices();
  if(vis.length === 0) return;
  let pos = vis.indexOf(currentIndex);
  pos = (pos + dir + vis.length) % vis.length;
  currentIndex = vis[pos];
  updateViewer();
}

function closeViewer(){
  viewer.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('vNext').addEventListener('click', (e) => { e.stopPropagation(); step(1); });
document.getElementById('vPrev').addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
document.getElementById('vClose').addEventListener('click', closeViewer);
viewer.addEventListener('click', (e) => { if(e.target === viewer) closeViewer(); });

document.addEventListener('keydown', (e) => {
  if(!viewer.classList.contains('open')) return;
  if(e.key === 'Escape') closeViewer();
  if(e.key === 'ArrowRight') step(1);
  if(e.key === 'ArrowLeft') step(-1);
});

/* ---------- Touch swipe for mobile ---------- */
let touchStartX = 0;
viewer.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; });
viewer.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].screenX - touchStartX;
  if(Math.abs(dx) > 50){ step(dx < 0 ? 1 : -1); }
});