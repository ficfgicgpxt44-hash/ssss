/**
 * Motion OKLab / OKLCH Color Polyfill
 * 
 * Resolves the issue where Motion (framer-motion / motion) throws:
 * "'oklab(...)' is not an animatable color. Use the equivalent color code instead."
 * 
 * Tailwind CSS v4 and modern browsers evaluate color-mix and opacity classes into
 * oklab(...) or oklch(...) color spaces, which Motion's color parser does not natively
 * interpolate. This polyfill transparently converts any oklab/oklch colors returned by
 * getComputedStyle to equivalent standard rgba(...) strings that Motion fully supports.
 */

function parseModernColor(str: string): string {
  if (typeof str !== 'string') return str;
  if (!str.includes('oklab') && !str.includes('oklch')) return str;

  return str.replace(/(?:oklab|oklch)\([^)]+\)/gi, (match) => {
    try {
      const isOklch = match.toLowerCase().startsWith('oklch');
      const inner = match.slice(match.indexOf('(') + 1, -1).trim();
      const [coordsPart, alphaPart] = inner.split('/');
      const coords = coordsPart.trim().split(/[\s,]+/);
      if (coords.length < 3) return match;

      const L = coords[0].endsWith('%') ? parseFloat(coords[0]) / 100 : parseFloat(coords[0]);
      let a = 0;
      let b = 0;

      if (isOklch) {
        const C = coords[1].endsWith('%') ? (parseFloat(coords[1]) / 100) * 0.4 : parseFloat(coords[1]);
        let hDeg = parseFloat(coords[2]);
        if (coords[2].endsWith('rad')) hDeg = (parseFloat(coords[2]) * 180) / Math.PI;
        else if (coords[2].endsWith('turn')) hDeg = parseFloat(coords[2]) * 360;
        const rad = (hDeg * Math.PI) / 180;
        a = C * Math.cos(rad);
        b = C * Math.sin(rad);
      } else {
        a = parseFloat(coords[1]);
        b = parseFloat(coords[2]);
      }

      let alpha = 1;
      if (alphaPart) {
        const aTrim = alphaPart.trim();
        alpha = aTrim.endsWith('%') ? parseFloat(aTrim) / 100 : parseFloat(aTrim);
      }

      const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

      const l = l_ * l_ * l_;
      const m = m_ * m_ * m_;
      const s = s_ * s_ * s_;

      const rLinear = +4.0767434757 * l - 3.3077115913 * m + 0.2309699291 * s;
      const gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      const bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

      const toGamma = (c: number) => {
        const clamped = Math.max(0, Math.min(1, c));
        return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
      };

      const r = Math.round(toGamma(rLinear) * 255);
      const g = Math.round(toGamma(gLinear) * 255);
      const bVal = Math.round(toGamma(bLinear) * 255);
      const roundedAlpha = Math.round(alpha * 1000) / 1000;

      return `rgba(${r}, ${g}, ${bVal}, ${roundedAlpha})`;
    } catch {
      return match;
    }
  });
}

export function installMotionColorPolyfill() {
  if (typeof window === 'undefined') return;

  const originalGetComputedStyle = window.getComputedStyle.bind(window);

  window.getComputedStyle = function (elt: Element, pseudoElt?: string | null): CSSStyleDeclaration {
    const computed = originalGetComputedStyle(elt, pseudoElt);

    return new Proxy(computed, {
      get(target, prop, receiver) {
        if (prop === 'getPropertyValue') {
          return (propertyName: string) => {
            const raw = target.getPropertyValue(propertyName);
            return parseModernColor(raw);
          };
        }

        const value = Reflect.get(target, prop, receiver);
        if (typeof value === 'function') {
          return value.bind(target);
        }
        if (typeof value === 'string') {
          return parseModernColor(value);
        }
        return value;
      }
    });
  };
}

// Auto-run on import
installMotionColorPolyfill();
