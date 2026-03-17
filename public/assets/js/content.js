
async function applyContent(data) {
  if (!data) return;

  if (data.text) {
    Object.entries(data.text).forEach(([key, value]) => {
      document.querySelectorAll(`[data-key="${key}"]`).forEach(el => {
        el.textContent = value;
      });
    });
  }

  if (data.attrs) {
    Object.entries(data.attrs).forEach(([key, attrs]) => {
      document.querySelectorAll(`[data-attr-key="${key}"]`).forEach(el => {
        Object.entries(attrs).forEach(([attr, val]) => {
          el.setAttribute(attr, val);
          if (attr === 'href' && el.tagName === 'A' && val.startsWith('mailto:')) {
             el.innerText = val.replace('mailto:', '');
          }
        });
      });
    });
  }

  if (data.html) {
    Object.entries(data.html).forEach(([key, value]) => {
       document.querySelectorAll(`[data-html="${key}"]`).forEach(el => {
         el.innerHTML = value;
       });
    });
  }

  if (data.lists) {
    Object.entries(data.lists).forEach(([key, items]) => {
      document.querySelectorAll(`[data-list="${key}"]`).forEach(el => {
        if (Array.isArray(items)) {
          el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
        }
      });
    });
  }

  const pathParts = window.location.pathname.split('/');
  let currentPage = pathParts[pathParts.length - 1] || 'index.html';
  if (!currentPage.endsWith('.html')) currentPage += '.html';

  if (data.dynamic_overrides && data.dynamic_overrides[currentPage]) {
    Object.entries(data.dynamic_overrides[currentPage]).forEach(([selector, changes]) => {
      try {
        const el = document.querySelector(selector);
        if (el) {
          if (changes.text !== undefined) el.innerText = changes.text;
          if (changes.href !== undefined) el.setAttribute('href', changes.href);
          if (changes.src !== undefined) el.setAttribute('src', changes.src);
          if (changes.style) {
            Object.entries(changes.style).forEach(([prop, val]) => {
              el.style.setProperty(prop, val, 'important');
            });
          }
          if (changes.move === 'up' && el.previousElementSibling) {
            el.parentNode.insertBefore(el, el.previousElementSibling);
          } else if (changes.move === 'down' && el.nextElementSibling) {
            el.parentNode.insertBefore(el.nextElementSibling, el);
          }
        }
      } catch (e) {}
    });
  }

  if (data.settings && window.updateAndys) {
     window.updateAndys({
        count: data.settings.andyCount,
        color: data.settings.andyColor,
        visible: data.settings.andyVisible
     });
  }

  if (data.theme) {
    Object.entries(data.theme).forEach(([prop, val]) => {
      document.documentElement.style.setProperty('--' + prop, val);
    });
  }
}

async function loadContent() {
  const fetchOptions = { cache: 'no-cache' };
  
  const safeFetch = async (url) => {
    try {
      const fullUrl = url + '?t=' + Date.now();
      const res = await fetch(fullUrl, fetchOptions);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Skip: " + url);
    }
    return null;
  };

  const siteData = await safeFetch('/content/site.json');
  if (siteData) await applyContent(siteData);

  if (window.location.pathname.includes('privacy')) {
    const privacyData = await safeFetch('/content/privacy.json');
    if (privacyData) await applyContent(privacyData);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadContent);
} else {
  loadContent();
}