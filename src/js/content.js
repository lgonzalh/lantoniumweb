async function applyContent(data) {
  for (const [key, value] of Object.entries(data.text || {})) {
    const el = document.querySelector(`[data-key="${key}"]`);
    if (el) el.textContent = value;
  }
  for (const [key, items] of Object.entries(data.lists || {})) {
    const el = document.querySelector(`[data-list="${key}"]`);
    if (el && Array.isArray(items)) {
      el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
    }
  }
  for (const [key, value] of Object.entries(data.attrs || {})) {
    const el = document.querySelector(`[data-attr-key="${key}"]`);
    if (el && value && typeof value === 'object') {
      for (const [attr, val] of Object.entries(value)) {
        el.setAttribute(attr, val);
        if (attr === 'href' && el.tagName === 'A' && val.startsWith('mailto:')) {
          el.textContent = val.replace('mailto:', '');
        }
      }
    }
  }
  for (const [key, value] of Object.entries(data.html || {})) {
    const el = document.querySelector(`[data-html="${key}"]`);
    if (el) el.innerHTML = value;
  }
  if (data.theme) {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(data.theme)) {
      root.style.setProperty(`--${k}`, v);
    }
  }
}

async function loadContent() {
  try {
    const resSite = await fetch('/content/site.json', { cache: 'no-cache' });
    if (resSite.ok) {
      const siteData = await resSite.json();
      await applyContent(siteData);
    }
    const path = location.pathname || '';
    if (path.includes('/privacy')) {
      const resPrivacy = await fetch('/content/privacy.json', { cache: 'no-cache' });
      if (resPrivacy.ok) {
        const privacyData = await resPrivacy.json();
        await applyContent(privacyData);
      }
    }
  } catch (_) {
    // silent
  }
}
document.addEventListener('DOMContentLoaded', loadContent);
