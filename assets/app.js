import { loadManifest, esc, typeLabel, renderHeaderLinks, renderFooter } from './common.js';

const $ = id => document.getElementById(id);
const listEl = $('project-list');
const search = $('search');
const chipsEl = $('type-chips');
const stage = $('stage');

const glyph = { swf: 'SWF', html: '</>', video: '▶', image: '◧', pdf: 'PDF', link: '↗', download: '⤓' };

let site = {}, projects = [], activeType = 'all', currentId = null;

// ---------- Sidebar list ----------

function listItem(p) {
  const thumb = p.thumbnail
    ? `<img src="${esc(p.thumbnail)}" alt="" loading="lazy">`
    : `<span>${esc(glyph[p.type] || '◆')}</span>`;
  const sub = [typeLabel(p.type), p.year].filter(Boolean).join(' · ');
  const attrs = p.type === 'link'
    ? `href="${esc(p.url)}" target="_blank" rel="noopener"`
    : `href="#${encodeURIComponent(p.id)}"`;
  const current = p.id === currentId ? ' aria-current="page"' : '';
  return `<a class="item" ${attrs}${current}>
    <span class="item-thumb">${thumb}</span>
    <span class="item-text">
      <span class="item-title">${esc(p.title)}${p.type === 'link' ? ' ↗' : ''}</span>
      <span class="item-sub">${esc(sub)}</span>
    </span>
  </a>`;
}

function renderList() {
  const q = search.value.trim().toLowerCase();
  const list = projects.filter(p =>
    (activeType === 'all' || p.type === activeType) &&
    (!q || [p.title, p.description, ...p.tags].join(' ').toLowerCase().includes(q)));
  listEl.innerHTML = list.length ? list.map(listItem).join('') : '<p class="empty">No projects match.</p>';
}

function renderChips() {
  const types = ['all', ...new Set(projects.map(p => p.type))];
  chipsEl.innerHTML = types.length > 2 ? types.map(t =>
    `<button class="chip" data-type="${t}" aria-pressed="${t === activeType}">${t === 'all' ? 'All' : esc(typeLabel(t))}</button>`).join('') : '';
}

chipsEl.addEventListener('click', e => {
  const b = e.target.closest('.chip');
  if (!b) return;
  activeType = b.dataset.type;
  renderChips(); renderList();
});
search.addEventListener('input', renderList);

// ---------- Viewer ----------

function notice(html) {
  stage.style.setProperty('--ratio', 16 / 9);
  stage.innerHTML = `<div class="notice">${html}</div>`;
}

function mountSwf(p) {
  const ruffle = window.RufflePlayer?.newest();
  if (!ruffle) return notice('Could not load the Ruffle Flash emulator.');
  const player = ruffle.createPlayer();
  stage.appendChild(player);
  const api = player.ruffle ? player.ruffle() : player;
  api.load({
    url: p.file,
    autoplay: 'on',
    unmuteOverlay: 'visible',
    letterbox: 'on',
    backgroundColor: p.background || null,
    ...(p.ruffle || {}),
  }).catch(err => notice(`Could not load this SWF.<br>${esc(err.message || err)}`));
}

function mount(p) {
  stage.innerHTML = '';  // removing the old element also stops any running player
  stage.style.setProperty('--ratio', (p.width || 800) / (p.height || 600));
  switch (p.type) {
    case 'swf': return mountSwf(p);
    case 'html':
      stage.innerHTML = `<iframe src="${esc(p.file)}" title="${esc(p.title)}" allow="fullscreen; autoplay; gamepad; clipboard-write" allowfullscreen></iframe>`;
      return;
    case 'video':
      stage.innerHTML = `<video src="${esc(p.file)}" controls playsinline ${p.poster ? `poster="${esc(p.poster)}"` : ''}></video>`;
      return;
    case 'image':
      stage.innerHTML = `<img src="${esc(p.file)}" alt="${esc(p.title)}">`;
      return;
    case 'pdf':
      stage.innerHTML = `<iframe src="${esc(p.file)}" title="${esc(p.title)}"></iframe>`;
      return;
    default:
      notice(`This project is a downloadable file.<br><br><a class="btn primary" href="${esc(p.file)}" download>Download ${esc(p.file.split('/').pop())}</a>`);
  }
}

function show(p) {
  currentId = p ? p.id : null;
  document.body.classList.toggle('viewing', !!p);
  $('welcome').hidden = !!p;
  $('project').hidden = !p;
  renderList();

  if (!p) {
    stage.innerHTML = '';
    document.title = site.title || 'Projects';
    return;
  }

  document.title = `${p.title} · ${site.title || 'Projects'}`;
  $('title').textContent = p.title;
  $('meta').innerHTML = [typeLabel(p.type), p.year, ...p.tags].filter(Boolean)
    .map(m => `<span>${esc(m)}</span>`).join('');
  $('description').textContent = p.description || '';
  $('controls').hidden = !p.controls;
  $('controls').innerHTML = p.controls ? `<strong>Controls:</strong> ${esc(p.controls)}` : '';

  const raw = $('open-raw');
  const hasRaw = p.file && !p.file.startsWith('data:');
  raw.hidden = !hasRaw;
  if (hasRaw) {
    raw.href = p.file;
    const external = /^https?:\/\//.test(p.file);
    raw.textContent = p.type === 'swf' ? 'Download .swf'
      : external && /\.netlify\.app$/.test(new URL(p.file).hostname) ? 'Open on Netlify ↗'
      : external ? 'Open in new tab ↗' : 'Open file';
    raw.title = external ? p.file : '';
  }
  mount(p);
  $('viewer').scrollTop = 0;
}

function route() {
  const id = decodeURIComponent(location.hash.slice(1));
  show(projects.find(p => p.id === id && p.type !== 'link') || null);
}

$('fullscreen').addEventListener('click', () => {
  document.fullscreenElement ? document.exitFullscreen() : $('stage-area').requestFullscreen?.();
});
$('back').addEventListener('click', () => { location.hash = ''; });
addEventListener('hashchange', route);

// ---------- Boot ----------

try {
  ({ site, projects } = await loadManifest());
  if (site.title) $('site-title').textContent = site.title;
  $('tagline').textContent = site.tagline || '';
  $('welcome-count').textContent = `${projects.length} project${projects.length === 1 ? '' : 's'} in the collection.`;
  renderHeaderLinks($('header-links'), site);
  renderFooter($('footer'), site);
  renderChips();
  route();
} catch (err) {
  listEl.innerHTML = `<p class="empty">${esc(err.message)}.<br>Open this site through a web server (see README), not by double-clicking the file.</p>`;
}
