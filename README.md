# lantoniumweb

Production website for **Lantonium**, a studio specialized in Android application development.

**Live:** https://lantonium.com

---

## Overview

Static multi-page site built without a frontend framework. The build pipeline handles JS obfuscation and CSS minification before deployment. Content is driven by JSON files consumed at runtime, enabling copy updates without redeployment via the admin interface.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | Vanilla CSS + Bootstrap 5.3.3 |
| Scripting | Vanilla JavaScript (ES6+) |
| Build | Node.js — `javascript-obfuscator`, `clean-css` |
| Hosting | Cloud Hosting |
| Version Control | Git / GitHub |

---

## Project Structure

```
lantoniumweb/
├── src/
│   ├── js/
│   │   ├── main.js          # Entry point; security layer injected at build time
│   │   ├── content.js       # Runtime content loader from JSON
│   │   └── security.js      # Anti-debug / obfuscation guards (prepended to main)
│   └── css/
│       └── styles.css       # Source stylesheet (minified on build)
├── public/
│   ├── index.html           # Home
│   ├── about.html           # Developer & brand attribution
│   ├── apps.html            # Product catalog
│   ├── localtranscriptor.html
│   ├── docusheetbot.html
│   ├── privacy.html
│   ├── 404.html
│   ├── lntcnfg.html         # Admin config interface (unlisted, direct URL only)
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── assets/
│   │   ├── css/             # Build output: minified CSS
│   │   ├── js/              # Build output: obfuscated JS
│   │   ├── img/             # Static images and SVGs
│   │   └── mp4/             # Video assets
│   └── content/
│       ├── site.json        # Global content: text, attrs, theme tokens
│       └── privacy.json     # Privacy policy content
├── build.js                 # Build script: obfuscate JS, minify CSS
├── firebase.json            # Hosting config: security headers, clean URLs
├── .firebaserc              # Firebase project binding
├── package.json
└── .gitignore
```

---

## Local Development

**Prerequisites:** Node.js >= 18

```bash
# Install dependencies
npm install

# Run build (obfuscate JS + minify CSS)
node build.js

# Serve locally
npx serve public
```

Source files live in `src/`. Never edit `public/assets/js/` or `public/assets/css/` directly; they are build artifacts.

---

## Build Pipeline

```
src/js/security.js ──┐
src/js/main.js       ├──► javascript-obfuscator ──► public/assets/js/
src/js/content.js ───┘

src/css/styles.css ──────► clean-css ─────────────► public/assets/css/
```

`security.js` is prepended to `main.js` before obfuscation. All other JS modules are obfuscated independently.

---

## Deployment

```bash
# Build artifacts first
node build.js

# Deploy
npm run deploy
```

---

## Security Headers

Applied globally at the hosting layer:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Content-Security-Policy` | Restricts sources to `self` + CDN whitelist |

---

## Content Management

Site copy is stored in `public/content/site.json`. `content.js` reads this file at runtime and patches `data-key` and `data-attr-key` attributes across all pages.

To update content without a full redeploy, use the admin interface at `/lntcnfg` (direct URL, not linked from navigation or sitemap).

---

## Git Workflow

```bash
# After modifying source files
git add .
git commit -m "feat: <description>"
git push
```

Branch: `main` tracks `origin/main` at `https://github.com/lgonzalh/lantoniumweb`.

---

## Author

**Luis Gonzalez** — Android Developer / Full Stack Developer / Big Data Analyst  
Bogota, Colombia  
[lgonzalh@outlook.com](mailto:lgonzalh@outlook.com) · [LinkedIn](https://www.linkedin.com/in/lantonium/)

---

## License

Copyright 2021–2026 Lantonium. All rights reserved.
