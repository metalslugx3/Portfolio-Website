// Shared helpers for the gallery and the player page.

const TYPE_BY_EXT = {
  swf: 'swf',
  html: 'html', htm: 'html',
  mp4: 'video', webm: 'video', ogv: 'video', mov: 'video',
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', svg: 'image',
  pdf: 'pdf',
};

const TYPE_LABEL = {
  swf: 'Flash', html: 'HTML', video: 'Video', image: 'Image', pdf: 'PDF', link: 'Link', download: 'File',
};

export function projectType(p) {
  if (p.type) return p.type;
  if (p.url && !p.file) return 'link';
  const ext = (p.file || '').split('?')[0].split('.').pop().toLowerCase();
  return TYPE_BY_EXT[ext] || 'download';
}

export const typeLabel = t => TYPE_LABEL[t] || t;

export async function loadManifest() {
  const res = await fetch('projects.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load projects.json (${res.status})`);
  const data = await res.json();
  data.site ??= {};
  data.projects = (data.projects || []).map(p => ({ ...p, type: projectType(p), tags: p.tags || [] }));
  return data;
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function renderHeaderLinks(el, site) {
  el.innerHTML = (site.links || [])
    .map(l => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`)
    .join('');
}

export function renderFooter(el, site) {
  const year = new Date().getFullYear();
  el.textContent = `© ${year} ${site.author || ''}`.trim();
}
