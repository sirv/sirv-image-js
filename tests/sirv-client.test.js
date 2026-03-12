const { SirvClient } = require('../src/sirv-client');

describe('SirvClient', () => {
  const domain = 'demo.sirv.com';

  // ── Constructor ─────────────────────────────────────────

  test('constructor requires domain', () => {
    expect(() => new SirvClient()).toThrow('domain is required');
    expect(() => new SirvClient({})).toThrow('domain is required');
  });

  test('constructor with domain only', () => {
    const sirv = new SirvClient({ domain });
    expect(sirv.url('/image.jpg')).toBe('https://demo.sirv.com/image.jpg');
  });

  test('constructor strips trailing slash from domain', () => {
    const sirv = new SirvClient({ domain: 'demo.sirv.com/' });
    expect(sirv.url('/image.jpg')).toBe('https://demo.sirv.com/image.jpg');
  });

  test('constructor with defaults', () => {
    const sirv = new SirvClient({ domain, defaults: { q: 80 } });
    expect(sirv.url('/image.jpg')).toBe('https://demo.sirv.com/image.jpg?q=80');
  });

  // ── url() ──────────────────────────────────────────────

  test('url with simple params', () => {
    const sirv = new SirvClient({ domain });
    const url = sirv.url('/image.jpg', { w: 300, h: 200, format: 'webp' });
    expect(url).toBe('https://demo.sirv.com/image.jpg?w=300&h=200&format=webp');
  });

  test('url merges defaults with params', () => {
    const sirv = new SirvClient({ domain, defaults: { q: 80 } });
    const url = sirv.url('/image.jpg', { w: 300, h: 200, format: 'webp' });
    expect(url).toBe('https://demo.sirv.com/image.jpg?q=80&w=300&h=200&format=webp');
  });

  test('params override defaults', () => {
    const sirv = new SirvClient({ domain, defaults: { q: 80 } });
    const url = sirv.url('/image.jpg', { q: 90 });
    expect(url).toBe('https://demo.sirv.com/image.jpg?q=90');
  });

  test('url with nested params flattens to dot notation', () => {
    const sirv = new SirvClient({ domain });
    const url = sirv.url('/image.jpg', {
      crop: { type: 'face', pad: { width: 10, height: 10 } }
    });
    expect(url).toContain('crop.type=face');
    expect(url).toContain('crop.pad.width=10');
    expect(url).toContain('crop.pad.height=10');
  });

  test('url with deeply nested params', () => {
    const sirv = new SirvClient({ domain });
    const url = sirv.url('/image.jpg', {
      text: { font: { family: 'Arial', size: 24 }, color: 'white' }
    });
    expect(url).toContain('text.font.family=Arial');
    expect(url).toContain('text.font.size=24');
    expect(url).toContain('text.color=white');
  });

  test('url adds leading slash if missing', () => {
    const sirv = new SirvClient({ domain });
    expect(sirv.url('image.jpg')).toBe('https://demo.sirv.com/image.jpg');
  });

  test('url with no params returns clean URL', () => {
    const sirv = new SirvClient({ domain });
    expect(sirv.url('/image.jpg')).toBe('https://demo.sirv.com/image.jpg');
  });

  test('url encodes special characters', () => {
    const sirv = new SirvClient({ domain });
    const url = sirv.url('/image.jpg', { subsampling: '4:2:0' });
    expect(url).toContain('subsampling=4%3A2%3A0');
  });

  // ── srcSet() ───────────────────────────────────────────

  test('srcSet with explicit widths', () => {
    const sirv = new SirvClient({ domain });
    const srcset = sirv.srcSet('/image.jpg', { format: 'webp' }, { widths: [320, 640, 960] });
    expect(srcset).toContain('w=320 320w');
    expect(srcset).toContain('w=640 640w');
    expect(srcset).toContain('w=960 960w');
    expect(srcset).toContain('format=webp');
  });

  test('srcSet with minWidth/maxWidth/tolerance', () => {
    const sirv = new SirvClient({ domain });
    const srcset = sirv.srcSet('/image.jpg', { format: 'webp' }, {
      minWidth: 200, maxWidth: 2000, tolerance: 0.15
    });
    const entries = srcset.split(', ');
    expect(entries.length).toBeGreaterThan(2);
    // First width should be ~200, last should be ~2000
    expect(entries[0]).toContain('w=200');
    expect(entries[entries.length - 1]).toContain('w=2000');
  });

  test('srcSet with devicePixelRatios', () => {
    const sirv = new SirvClient({ domain, defaults: { q: 80 } });
    const srcset = sirv.srcSet('/hero.jpg', { w: 600, h: 400 }, {
      devicePixelRatios: [1, 2, 3]
    });
    expect(srcset).toContain('1x');
    expect(srcset).toContain('2x');
    expect(srcset).toContain('3x');
    // 1x should have q=80
    expect(srcset).toContain('q=80');
    // 2x should have w=1200
    expect(srcset).toContain('w=1200');
    // 3x should have w=1800
    expect(srcset).toContain('w=1800');
  });

  test('srcSet with DPR uses variable quality', () => {
    const sirv = new SirvClient({ domain, defaults: { q: 80 } });
    const srcset = sirv.srcSet('/hero.jpg', { w: 600 }, {
      devicePixelRatios: [1, 2, 3]
    });
    // q=80 at 1x, q=60 at 2x, q=45 at 3x (80 * 0.75^(dpr-1))
    const entries = srcset.split(', ');
    expect(entries[0]).toContain('q=80');
    expect(entries[1]).toContain('q=60');
  });

  test('srcSet returns empty string with no options', () => {
    const sirv = new SirvClient({ domain });
    expect(sirv.srcSet('/image.jpg')).toBe('');
  });

  // ── image() ────────────────────────────────────────────

  test('image generates img tag', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.image('/tomatoes.jpg', { alt: 'Fresh tomatoes' });
    expect(html).toBe('<img class="Sirv" data-src="https://demo.sirv.com/tomatoes.jpg" alt="Fresh tomatoes">');
  });

  test('image with transform params', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.image('/photo.jpg', { transform: { w: 300, format: 'webp' } });
    expect(html).toContain('data-src="https://demo.sirv.com/photo.jpg?w=300&amp;format=webp"');
  });

  test('image with viewer options', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.image('/photo.jpg', {
      viewer: { autostart: 'visible', threshold: 200 }
    });
    expect(html).toContain('data-options="autostart:visible;threshold:200"');
  });

  test('image with custom className', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.image('/photo.jpg', { className: 'hero-image' });
    expect(html).toContain('class="Sirv hero-image"');
  });

  test('image with empty alt', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.image('/photo.jpg', { alt: '' });
    expect(html).toContain('alt=""');
  });

  // ── zoom() ─────────────────────────────────────────────

  test('zoom generates div with data-type zoom', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.zoom('/product.jpg');
    expect(html).toBe('<div class="Sirv" data-src="https://demo.sirv.com/product.jpg" data-type="zoom"></div>');
  });

  test('zoom with viewer options', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.zoom('/product.jpg', {
      viewer: { mode: 'deep', wheel: false }
    });
    expect(html).toContain('data-type="zoom"');
    expect(html).toContain('data-options="mode:deep;wheel:false"');
  });

  // ── spin() ─────────────────────────────────────────────

  test('spin generates div without data-type', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.spin('/product.spin');
    expect(html).toBe('<div class="Sirv" data-src="https://demo.sirv.com/product.spin"></div>');
    expect(html).not.toContain('data-type');
  });

  test('spin with viewer options', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.spin('/product.spin', {
      viewer: { autostart: 'visible', autospin: 'lazy' }
    });
    expect(html).toContain('data-options="autostart:visible;autospin:lazy"');
  });

  // ── video() ────────────────────────────────────────────

  test('video generates div without data-type', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.video('/clip.mp4');
    expect(html).toBe('<div class="Sirv" data-src="https://demo.sirv.com/clip.mp4"></div>');
  });

  // ── model() ────────────────────────────────────────────

  test('model generates div without data-type', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.model('/shoe.glb');
    expect(html).toBe('<div class="Sirv" data-src="https://demo.sirv.com/shoe.glb"></div>');
  });

  // ── gallery() ──────────────────────────────────────────

  test('gallery generates nested divs', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.gallery([
      { src: '/product.spin' },
      { src: '/front.jpg', type: 'zoom' }
    ]);
    expect(html).toContain('<div class="Sirv">');
    expect(html).toContain('data-src="https://demo.sirv.com/product.spin"');
    expect(html).toContain('data-src="https://demo.sirv.com/front.jpg" data-type="zoom"');
    expect(html).toMatch(/<\/div><\/div>$/);
  });

  test('gallery with gallery-level viewer options', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.gallery(
      [{ src: '/image1.jpg' }],
      { viewer: { arrows: true, thumbnails: 'bottom' } }
    );
    expect(html).toContain('data-options="arrows:true;thumbnails:bottom"');
  });

  test('gallery with per-item viewer options', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.gallery([
      { src: '/product.jpg', type: 'zoom', viewer: { mode: 'deep' } }
    ]);
    expect(html).toContain('data-type="zoom"');
    expect(html).toContain('data-options="mode:deep"');
  });

  test('gallery with per-item transforms', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.gallery([
      { src: '/photo.jpg', transform: { w: 800, format: 'webp' } }
    ]);
    expect(html).toContain('w=800');
    expect(html).toContain('format=webp');
  });

  test('gallery with custom className', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.gallery([{ src: '/img.jpg' }], { className: 'product-gallery' });
    expect(html).toContain('class="Sirv product-gallery"');
  });

  // ── scriptTag() ────────────────────────────────────────

  test('scriptTag with no modules', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.scriptTag();
    expect(html).toBe('<script src="https://scripts.sirv.com/sirvjs/v3/sirv.js" async></script>');
  });

  test('scriptTag with modules', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.scriptTag({ modules: ['spin', 'zoom'] });
    expect(html).toBe('<script src="https://scripts.sirv.com/sirvjs/v3/sirv.spin.zoom.js" async></script>');
  });

  test('scriptTag without async', () => {
    const sirv = new SirvClient({ domain });
    const html = sirv.scriptTag({ async: false });
    expect(html).toBe('<script src="https://scripts.sirv.com/sirvjs/v3/sirv.js"></script>');
  });
});
