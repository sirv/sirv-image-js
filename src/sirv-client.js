'use strict';

/**
 * SirvClient - SDK for building Sirv URLs and HTML tags for images, spins, videos, 3D models, and galleries.
 *
 * @example
 * const sirv = new SirvClient({ domain: 'demo.sirv.com', defaults: { q: 80 } });
 * const url = sirv.url('/image.jpg', { w: 300, format: 'webp' });
 * const html = sirv.image('/photo.jpg', { alt: 'A photo' });
 */
class SirvClient {
  /**
   * Create a SirvClient instance.
   * @param {Object} options
   * @param {string} options.domain - Sirv domain (e.g. 'demo.sirv.com')
   * @param {Object} [options.defaults] - Default query parameters merged into every URL
   */
  constructor({ domain, defaults = {} } = {}) {
    if (!domain) throw new Error('domain is required');
    this._domain = domain.replace(/\/+$/, '');
    this._defaults = defaults;
  }

  /**
   * Flatten a nested object into dot-notation key-value pairs.
   * { crop: { type: 'face', pad: { width: 10 } } } => [['crop.type','face'], ['crop.pad.width','10']]
   * @param {Object} obj
   * @param {string} [prefix]
   * @returns {Array<[string, string]>}
   */
  _flatten(obj, prefix = '') {
    const entries = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value)) {
        entries.push(...this._flatten(value, fullKey));
      } else if (value !== null && value !== undefined) {
        entries.push([fullKey, String(value)]);
      }
    }
    return entries;
  }

  /**
   * Build a query string from merged defaults + params.
   * @param {Object} [params]
   * @returns {string}
   */
  _buildQuery(params = {}) {
    const merged = { ...this._defaults, ...params };
    const entries = this._flatten(merged);
    if (entries.length === 0) return '';
    return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  }

  /**
   * Build a full Sirv URL.
   * @param {string} path - Asset path (e.g. '/image.jpg')
   * @param {Object} [params] - Transformation parameters (nested objects are flattened to dot-notation)
   * @returns {string}
   */
  url(path, params = {}) {
    const normalizedPath = path.startsWith('/') ? path : '/' + path;
    return `https://${this._domain}${normalizedPath}${this._buildQuery(params)}`;
  }

  /**
   * Generate a srcset string for responsive images.
   * @param {string} path - Image path
   * @param {Object} [params] - Transformation parameters
   * @param {Object} [options] - srcset options
   * @param {number[]} [options.widths] - Explicit list of widths
   * @param {number} [options.minWidth] - Minimum width for auto-generation
   * @param {number} [options.maxWidth] - Maximum width for auto-generation
   * @param {number} [options.tolerance=0.15] - Tolerance for auto-generating widths (0-1)
   * @param {number[]} [options.devicePixelRatios] - DPR values (e.g. [1, 2, 3])
   * @returns {string}
   */
  srcSet(path, params = {}, options = {}) {
    if (options.widths) {
      return options.widths
        .map(w => `${this.url(path, { ...params, w })} ${w}w`)
        .join(', ');
    }

    if (options.minWidth !== undefined && options.maxWidth !== undefined) {
      const tolerance = options.tolerance || 0.15;
      const widths = this._generateWidths(options.minWidth, options.maxWidth, tolerance);
      return widths
        .map(w => `${this.url(path, { ...params, w })} ${w}w`)
        .join(', ');
    }

    if (options.devicePixelRatios) {
      const baseQ = params.q || this._defaults.q || 80;
      return options.devicePixelRatios
        .map(dpr => {
          const q = this._dprQuality(baseQ, dpr);
          const dprParams = { ...params, q };
          if (params.w) dprParams.w = params.w * dpr;
          if (params.h) dprParams.h = params.h * dpr;
          return `${this.url(path, dprParams)} ${dpr}x`;
        })
        .join(', ');
    }

    return '';
  }

  /**
   * Calculate quality for a given DPR. Higher DPR uses lower quality since pixels are smaller.
   * @param {number} baseQ - Base quality at 1x
   * @param {number} dpr - Device pixel ratio
   * @returns {number}
   */
  _dprQuality(baseQ, dpr) {
    if (dpr <= 1) return baseQ;
    return Math.round(baseQ * Math.pow(0.75, dpr - 1));
  }

  /**
   * Generate widths between min and max using a tolerance step.
   * @param {number} min
   * @param {number} max
   * @param {number} tolerance
   * @returns {number[]}
   */
  _generateWidths(min, max, tolerance) {
    const widths = [];
    let current = min;
    while (current < max) {
      widths.push(Math.round(current));
      current *= 1 + tolerance * 2;
    }
    widths.push(Math.round(max));
    return widths;
  }

  /**
   * Serialize viewer options to semicolon-separated format for data-options.
   * { autostart: 'visible', threshold: 200 } => 'autostart:visible;threshold:200'
   * @param {Object} opts
   * @returns {string}
   */
  _serializeViewerOptions(opts) {
    return Object.entries(opts)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
  }

  /**
   * Escape HTML attribute values.
   * @param {string} str
   * @returns {string}
   */
  _escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * Generate an <img> tag for a Sirv image.
   * @param {string} path - Image path
   * @param {Object} [options]
   * @param {Object} [options.transform] - Transformation parameters for the URL
   * @param {Object} [options.viewer] - Viewer options for data-options attribute
   * @param {string} [options.alt] - Alt text
   * @param {string} [options.className] - Additional CSS class(es)
   * @returns {string}
   */
  image(path, options = {}) {
    const src = this.url(path, options.transform || {});
    const cls = options.className ? `Sirv ${options.className}` : 'Sirv';
    let html = `<img class="${cls}" data-src="${this._escapeAttr(src)}"`;
    if (options.alt !== undefined) html += ` alt="${this._escapeAttr(options.alt)}"`;
    if (options.viewer) html += ` data-options="${this._escapeAttr(this._serializeViewerOptions(options.viewer))}"`;
    html += '>';
    return html;
  }

  /**
   * Generate a <div> tag for a Sirv zoom viewer.
   * @param {string} path - Image path
   * @param {Object} [options]
   * @param {Object} [options.transform] - Transformation parameters
   * @param {Object} [options.viewer] - Viewer options
   * @param {string} [options.className] - Additional CSS class(es)
   * @returns {string}
   */
  zoom(path, options = {}) {
    return this._viewerDiv(path, 'zoom', options);
  }

  /**
   * Generate a <div> tag for a Sirv spin viewer.
   * @param {string} path - Path to .spin file
   * @param {Object} [options]
   * @param {Object} [options.viewer] - Viewer options
   * @param {string} [options.className] - Additional CSS class(es)
   * @returns {string}
   */
  spin(path, options = {}) {
    return this._viewerDiv(path, null, options);
  }

  /**
   * Generate a <div> tag for a Sirv video.
   * @param {string} path - Video path
   * @param {Object} [options]
   * @param {Object} [options.viewer] - Viewer options
   * @param {string} [options.className] - Additional CSS class(es)
   * @returns {string}
   */
  video(path, options = {}) {
    return this._viewerDiv(path, null, options);
  }

  /**
   * Generate a <div> tag for a Sirv 3D model viewer.
   * @param {string} path - Path to .glb file
   * @param {Object} [options]
   * @param {Object} [options.viewer] - Viewer options
   * @param {string} [options.className] - Additional CSS class(es)
   * @returns {string}
   */
  model(path, options = {}) {
    return this._viewerDiv(path, null, options);
  }

  /**
   * Internal helper to generate viewer div tags.
   * @param {string} path
   * @param {string|null} type - data-type value (e.g. 'zoom'), or null to omit
   * @param {Object} options
   * @returns {string}
   */
  _viewerDiv(path, type, options = {}) {
    const src = this.url(path, options.transform || {});
    const cls = options.className ? `Sirv ${options.className}` : 'Sirv';
    let html = `<div class="${cls}" data-src="${this._escapeAttr(src)}"`;
    if (type) html += ` data-type="${type}"`;
    if (options.viewer) html += ` data-options="${this._escapeAttr(this._serializeViewerOptions(options.viewer))}"`;
    html += '></div>';
    return html;
  }

  /**
   * Generate a gallery container with multiple assets.
   * @param {Array<Object>} items - Gallery items, each with:
   *   @param {string} items[].src - Asset path
   *   @param {string} [items[].type] - Asset type override (e.g. 'zoom', 'spin')
   *   @param {Object} [items[].transform] - Per-item transformation params
   *   @param {Object} [items[].viewer] - Per-item viewer options
   * @param {Object} [options]
   * @param {Object} [options.viewer] - Gallery-level viewer options
   * @param {string} [options.className] - Additional CSS class(es) for the gallery container
   * @returns {string}
   */
  gallery(items, options = {}) {
    const cls = options.className ? `Sirv ${options.className}` : 'Sirv';
    let html = `<div class="${cls}"`;
    if (options.viewer) html += ` data-options="${this._escapeAttr(this._serializeViewerOptions(options.viewer))}"`;
    html += '>';

    for (const item of items) {
      const src = this.url(item.src, item.transform || {});
      let child = `<div data-src="${this._escapeAttr(src)}"`;
      if (item.type) child += ` data-type="${item.type}"`;
      if (item.viewer) child += ` data-options="${this._escapeAttr(this._serializeViewerOptions(item.viewer))}"`;
      child += '></div>';
      html += child;
    }

    html += '</div>';
    return html;
  }

  /**
   * Generate a <script> tag to load Sirv JS.
   * @param {Object} [options]
   * @param {string[]} [options.modules] - Specific modules to load (e.g. ['spin', 'zoom'])
   * @param {boolean} [options.async=true] - Whether to add async attribute
   * @returns {string}
   */
  scriptTag(options = {}) {
    const async = options.async !== false;
    let filename = 'sirv';
    if (options.modules && options.modules.length > 0) {
      filename = 'sirv.' + options.modules.join('.');
    }
    let html = `<script src="https://scripts.sirv.com/sirvjs/v3/${filename}.js"`;
    if (async) html += ' async';
    html += '></script>';
    return html;
  }
}

module.exports = { SirvClient };
