# Sirv Image Transformation - JavaScript

A fluent URL builder for [Sirv](https://sirv.com) dynamic image transformations. Build transformed image URLs with an intuitive, chainable API — no API credentials required.

## Installation

```bash
npm install sirv-image
```

## Quick Start

```javascript
const SirvImage = require('sirv-image');

const url = new SirvImage('https://demo.sirv.com/image.jpg')
  .resize({ width: 300, height: 200 })
  .format('webp')
  .quality(80)
  .toUrl();

// https://demo.sirv.com/image.jpg?w=300&h=200&format=webp&q=80
```

## Constructor

```javascript
// Full image URL
new SirvImage('https://demo.sirv.com/image.jpg')

// Base URL + path
new SirvImage('https://demo.sirv.com', '/image.jpg')
```

## API Reference

All methods return `this` for chaining. Call `.toUrl()` to get the final URL.

### Resize

| Method | Parameters | Description |
|--------|-----------|-------------|
| `resize(options)` | `{ width?, height?, option? }` | Set dimensions. Option: `fit`, `fill`, `ignore`, `noup` |
| `width(w)` | `number` | Set width in pixels |
| `height(h)` | `number` | Set height in pixels |
| `scaleByLongest(s)` | `number` | Resize by longest dimension |
| `thumbnail(size?)` | `number` (default 256) | Create square thumbnail |

### Crop

| Method | Parameters | Description |
|--------|-----------|-------------|
| `crop(options)` | `{ width?, height?, x?, y?, type?, padWidth?, padHeight? }` | Crop image. Type: `trim`, `poi`, `face` |
| `clipPath(name)` | `string` | Apply Photoshop clipping path |

### Rotation

| Method | Parameters | Description |
|--------|-----------|-------------|
| `rotate(degrees)` | `number` (-180 to 180) | Rotate image |
| `flip()` | — | Flip vertically |
| `flop()` | — | Flip horizontally |

### Format & Quality

| Method | Parameters | Description |
|--------|-----------|-------------|
| `format(fmt)` | `'jpg'`, `'png'`, `'webp'`, `'optimal'`, `'original'` | Output format |
| `quality(q)` | `number` (0-100) | JPEG quality |
| `webpFallback(fmt)` | `'jpg'`, `'png'` | Fallback for non-WebP browsers |
| `subsampling(value)` | `'4:4:4'`, `'4:2:2'`, `'4:2:0'` | Chroma subsampling |
| `pngOptimize(enabled?)` | `boolean` | Enable PNG optimization |
| `gifLossy(level)` | `number` (0-100) | GIF lossy compression |

### Color Adjustments

| Method | Parameters | Description |
|--------|-----------|-------------|
| `brightness(v)` | `number` (-100 to 100) | Adjust brightness |
| `contrast(v)` | `number` (-100 to 100) | Adjust contrast |
| `exposure(v)` | `number` (-100 to 100) | Adjust exposure |
| `hue(v)` | `number` (-100 to 100) | Adjust hue |
| `saturation(v)` | `number` (-100 to 100) | Adjust saturation |
| `lightness(v)` | `number` (-100 to 100) | Adjust lightness |
| `shadows(v)` | `number` (-100 to 100) | Adjust shadows |
| `highlights(v)` | `number` (-100 to 100) | Adjust highlights |
| `grayscale()` | — | Convert to grayscale |
| `colorLevel(options)` | `{ black?, white? }` | Set color levels |
| `histogram(channel)` | `'r'`, `'g'`, `'b'` | Show histogram |

### Color Effects

| Method | Parameters | Description |
|--------|-----------|-------------|
| `colorize(options)` | `{ color, opacity? }` | Apply color overlay |
| `colortone(preset)` | `string` | Apply preset: `sepia`, `warm`, `cold`, etc. |
| `colortone(options)` | `{ color?, level?, mode? }` | Custom colortone |

### Effects

| Method | Parameters | Description |
|--------|-----------|-------------|
| `blur(v)` | `number` (0-100) | Apply blur |
| `sharpen(v)` | `number` (0-100) | Apply sharpening |
| `vignette(options)` | `{ value, color? }` | Apply vignette |
| `opacity(v)` | `number` (0-100) | Set opacity (PNG) |

### Text Overlay

```javascript
.text(content, {
  size,              // Text area width (%)
  fontSize,          // Fixed size (px)
  fontFamily,        // Google Fonts name
  fontStyle,         // 'normal' | 'italic'
  fontWeight,        // 300-800
  color,             // Hex or color name
  opacity,           // 0-100
  outlineWidth,      // px
  outlineColor,      // Hex or name
  outlineOpacity,    // 0-100
  outlineBlur,       // px
  backgroundColor,   // Hex or name
  backgroundOpacity, // 0-100
  align,             // 'left' | 'center' | 'right'
  position,          // 'center', 'north', 'southeast', etc.
  positionX,         // Offset from left
  positionY,         // Offset from top
  positionGravity,   // Gravity reference
})
```

Call `.text()` multiple times for multiple text layers.

### Watermark

```javascript
.watermark(path, {
  position,          // 'center', 'north', 'tile', etc.
  positionX,         // X offset
  positionY,         // Y offset
  positionGravity,   // Gravity reference
  scaleWidth,        // Width (px or %)
  scaleHeight,       // Height (px or %)
  scaleOption,       // 'noup' | 'fit' | 'fill' | 'ignore'
  rotate,            // -180 to 180
  opacity,           // 0-100
  layer,             // 'front' | 'back'
  canvasColor,       // Background color
  canvasOpacity,     // 0-100
  canvasWidth,       // Canvas width
  canvasHeight,      // Canvas height
  cropX, cropY,      // Crop offsets
  cropWidth, cropHeight, // Crop dimensions
})
```

Call `.watermark()` multiple times for multiple watermarks.

### Canvas

```javascript
.canvas({
  width, height,     // Dimensions (px or %)
  color,             // Background color
  position,          // Image position
  opacity,           // 0-100
  aspectRatio,       // e.g. '16:9'
  borderWidth,       // Border width
  borderHeight,      // Border height
  borderColor,       // Border color
  borderOpacity,     // 0-100
})
```

### Frame

```javascript
.frame({
  style,    // 'solid' | 'mirror' | 'edge' | 'dither' | 'none'
  color,    // Frame color
  width,    // Frame width
  rimColor, // Rim color
  rimWidth, // Rim width (px)
})
```

### Other

| Method | Parameters | Description |
|--------|-----------|-------------|
| `page(num)` | `number` | PDF page to render |
| `profile(name)` | `string` | Apply saved profile |

## Examples

### E-commerce Product Image

```javascript
const product = new SirvImage('https://demo.sirv.com/products/shoe.jpg')
  .resize({ width: 800, height: 600, option: 'fill' })
  .format('webp')
  .quality(85)
  .sharpen(15)
  .watermark('/brand-logo.png', { position: 'southeast', opacity: 30 })
  .toUrl();
```

### Social Media Thumbnail

```javascript
const thumb = new SirvImage('https://demo.sirv.com/photo.jpg')
  .resize({ width: 1200, height: 630, option: 'fill' })
  .crop({ type: 'face' })
  .text('Breaking News', { fontSize: 48, color: 'white', position: 'south' })
  .toUrl();
```

### Vintage Photo Effect

```javascript
const vintage = new SirvImage('https://demo.sirv.com/photo.jpg')
  .colortone('sepia')
  .vignette({ value: 40 })
  .contrast(10)
  .frame({ style: 'solid', color: 'f5e6d3', width: 20 })
  .toUrl();
```

## TypeScript

TypeScript definitions are included. Import with:

```typescript
import SirvImage = require('sirv-image');
```

## Testing

```bash
npm test
```

## License

MIT
