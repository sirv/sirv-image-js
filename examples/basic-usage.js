const { SirvClient } = require('../src/sirv-client');

const sirv = new SirvClient({ domain: 'demo.sirv.com', defaults: { q: 80 } });

// ── Build URLs ──────────────────────────────────────────
console.log('Basic URL:', sirv.url('/image.jpg', { w: 300, h: 200, format: 'webp' }));
// https://demo.sirv.com/image.jpg?q=80&w=300&h=200&format=webp

// ── Nested params (dot-notation flattening) ─────────────
console.log('Nested:', sirv.url('/image.jpg', {
  crop: { type: 'face', pad: { width: 10, height: 10 } }
}));
// https://demo.sirv.com/image.jpg?q=80&crop.type=face&crop.pad.width=10&crop.pad.height=10

// ── srcSet with explicit widths ─────────────────────────
console.log('srcSet widths:', sirv.srcSet('/image.jpg', { format: 'webp' }, {
  widths: [320, 640, 960, 1280, 1920]
}));

// ── srcSet with auto-generated widths ───────────────────
console.log('srcSet auto:', sirv.srcSet('/image.jpg', { format: 'webp' }, {
  minWidth: 200, maxWidth: 2000, tolerance: 0.15
}));

// ── srcSet with device pixel ratios ─────────────────────
console.log('srcSet DPR:', sirv.srcSet('/hero.jpg', { w: 600, h: 400 }, {
  devicePixelRatios: [1, 2, 3]
}));

// ── Image tag ───────────────────────────────────────────
console.log('Image:', sirv.image('/tomatoes.jpg', { alt: 'Fresh tomatoes' }));
// <img class="Sirv" data-src="https://demo.sirv.com/tomatoes.jpg" alt="Fresh tomatoes">

// ── Zoom viewer ─────────────────────────────────────────
console.log('Zoom:', sirv.zoom('/product.jpg', {
  viewer: { mode: 'deep', wheel: false }
}));

// ── Spin viewer ─────────────────────────────────────────
console.log('Spin:', sirv.spin('/product.spin', {
  viewer: { autostart: 'visible', autospin: 'lazy' }
}));

// ── Video ───────────────────────────────────────────────
console.log('Video:', sirv.video('/clip.mp4'));

// ── 3D Model ────────────────────────────────────────────
console.log('Model:', sirv.model('/shoe.glb'));

// ── Gallery ─────────────────────────────────────────────
console.log('Gallery:', sirv.gallery([
  { src: '/product.spin' },
  { src: '/front.jpg', type: 'zoom' },
  { src: '/side.jpg', type: 'zoom' },
  { src: '/video.mp4' }
], {
  viewer: { arrows: true, thumbnails: 'bottom' }
}));

// ── Script tag ──────────────────────────────────────────
console.log('Script:', sirv.scriptTag({ modules: ['spin', 'zoom'] }));
// <script src="https://scripts.sirv.com/sirvjs/v3/sirv.spin.zoom.js" async></script>
