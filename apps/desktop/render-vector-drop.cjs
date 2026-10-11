const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 512,
    height: 512,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: { offscreen: true }
  });

  // Pure mathematical organic teardrop curve
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
      <defs>
        <!-- Droplet Outer Path -->
        <path id="dropShape" d="
          M 256 36 
          C 256 36 430 260 430 360 
          A 174 174 0 1 1 82 360 
          C 82 260 256 36 256 36 Z
        " />

        <clipPath id="dropClip">
          <use href="#dropShape" />
        </clipPath>

        <!-- Rich Oceanic Gradient -->
        <linearGradient id="oceanGradient" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color="#93e6fc" />
          <stop offset="20%" stop-color="#38bdf8" />
          <stop offset="60%" stop-color="#0284c7" />
          <stop offset="100%" stop-color="#0369a1" />
        </linearGradient>

        <!-- Spherical 3D Volume Light -->
        <radialGradient id="sphere3D" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
          <stop offset="35%" stop-color="#38bdf8" stop-opacity="0.1" />
          <stop offset="70%" stop-color="#0284c7" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#0c4a6e" stop-opacity="0.9" />
        </radialGradient>

        <!-- Bottom Caustic Water Pool -->
        <radialGradient id="causticPool" cx="50%" cy="85%" r="45%">
          <stop offset="0%" stop-color="#bae6fd" stop-opacity="0.9" />
          <stop offset="45%" stop-color="#38bdf8" stop-opacity="0.5" />
          <stop offset="85%" stop-color="#0284c7" stop-opacity="0" />
        </radialGradient>

        <!-- Left Glossy Crescent Glare -->
        <linearGradient id="crescentGloss" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
          <stop offset="45%" stop-color="#ffffff" stop-opacity="0.55" />
          <stop offset="80%" stop-color="#bae6fd" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>

        <!-- Soft Shadow for Contrast on Light / Dark Taskbars -->
        <filter id="taskbarShadow" x="-20%" y="-20%" width="140%" height="145%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#0284c7" flood-opacity="0.5" />
          <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#0369a1" flood-opacity="0.35" />
        </filter>
      </defs>

      <!-- 1. Droplet Base with Shadow -->
      <use href="#dropShape" fill="url(#oceanGradient)" filter="url(#taskbarShadow)" />

      <!-- 2. Inside Optics -->
      <g clip-path="url(#dropClip)">
        <!-- 3D Shading -->
        <use href="#dropShape" fill="url(#sphere3D)" />

        <!-- Bottom Caustic Refraction -->
        <ellipse cx="256" cy="460" rx="140" ry="48" fill="url(#causticPool)" />

        <!-- Internal Wave Ripples -->
        <path d="
          M 70 340 
          Q 160 380 260 335 
          T 440 350 
          L 440 540 L 70 540 Z
        " fill="#38bdf8" opacity="0.3" />

        <path d="
          M 70 375 
          Q 180 415 280 370 
          T 440 385 
          L 440 540 L 70 540 Z
        " fill="#7dd3fc" opacity="0.2" />

        <!-- Floating Micro Air Bubbles -->
        <circle cx="205" cy="390" r="15" fill="#38bdf8" opacity="0.35" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.6" />
        <circle cx="200" cy="385" r="4.5" fill="#ffffff" opacity="0.95" />

        <circle cx="295" cy="335" r="12" fill="#38bdf8" opacity="0.35" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.6" />
        <circle cx="291" cy="331" r="3.5" fill="#ffffff" opacity="0.95" />

        <circle cx="260" cy="430" r="9" fill="#38bdf8" opacity="0.35" stroke="#ffffff" stroke-width="1" stroke-opacity="0.6" />
        <circle cx="257" cy="427" r="2.5" fill="#ffffff" opacity="0.9" />

        <!-- Tiny light sparkles -->
        <circle cx="340" cy="395" r="5" fill="#ffffff" opacity="0.65" />
        <circle cx="165" cy="415" r="4.5" fill="#ffffff" opacity="0.55" />
        <circle cx="225" cy="305" r="4" fill="#ffffff" opacity="0.6" />

        <!-- Left Specular Glare (Smooth glass crescent curvature) -->
        <path d="
          M 245 60 
          C 175 145 110 250 110 365 
          C 110 310 145 200 230 75 Z
        " fill="url(#crescentGloss)" />

        <!-- Right Rim Highlight -->
        <path d="
          M 268 75 
          C 335 160 405 260 405 365 
          C 405 320 375 220 285 90 Z
        " fill="#ffffff" opacity="0.3" />

        <!-- Top Apex Tip Soft Highlight -->
        <ellipse cx="256" cy="50" rx="12" ry="7" fill="#ffffff" opacity="0.75" />
        <circle cx="256" cy="48" r="4" fill="#ffffff" opacity="0.9" />
      </g>

      <!-- 3. Polished Crystal Rim Highlight -->
      <use href="#dropShape" fill="none" stroke="#ffffff" stroke-width="3" stroke-opacity="0.7" />
      <use href="#dropShape" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.8" />
    </svg>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; }
          html, body { width: 512px; height: 512px; background: transparent; overflow: hidden; }
          svg { width: 512px; height: 512px; display: block; }
        </style>
      </head>
      <body>${svg}</body>
    </html>
  `;

  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  await new Promise(r => setTimeout(r, 600));

  const image = await win.webContents.capturePage();
  const pngBuffer = image.toPNG();

  const publicIcon = path.join(__dirname, 'public/icon.png');
  const buildIcon = path.join(__dirname, 'build/icon.png');
  const publicFavicon = path.join(__dirname, 'public/favicon.png');

  fs.writeFileSync(publicIcon, pngBuffer);
  fs.writeFileSync(buildIcon, pngBuffer);
  fs.writeFileSync(publicFavicon, pngBuffer);

  console.log('SUCCESS: Rendered premium 512x512 transparent water drop icon!');
  app.quit();
});
