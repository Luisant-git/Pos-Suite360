import html2pdf from 'html2pdf.js';

function oklchToRgb(oklchStr: string): string {
  // Try browser Canvas 2D conversion first
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = oklchStr;
      const res = ctx.fillStyle;
      if (res && res !== '#000000' && res !== 'rgb(0, 0, 0)') {
        return res;
      }
    }
  } catch {}

  // Math fallback parser for OKLCH -> sRGB
  try {
    const match = oklchStr.match(/oklch\(\s*([\d.%]+)\s+([\d.%]+)\s+([\d.%]+)(?:\s*\/\s*([\d.%]+))?\s*\)/i);
    if (!match) return 'rgb(100, 116, 139)';
    const [, lStr, cStr, hStr, aStr] = match;
    const L = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
    const C = cStr.endsWith('%') ? parseFloat(cStr) / 100 : parseFloat(cStr);
    const H = parseFloat(hStr);

    const hRad = (H * Math.PI) / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);

    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const rLinear = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const gLinear = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const bLinear = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

    const gamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
    const R = Math.round(Math.min(1, Math.max(0, gamma(rLinear))) * 255);
    const G = Math.round(Math.min(1, Math.max(0, gamma(gLinear))) * 255);
    const B = Math.round(Math.min(1, Math.max(0, gamma(bLinear))) * 255);

    if (aStr !== undefined) {
      const A = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
      return `rgba(${R}, ${G}, ${B}, ${A})`;
    }
    return `rgb(${R}, ${G}, ${B})`;
  } catch {
    return 'rgb(100, 116, 139)';
  }
}

function sanitizeOklchInText(text: string): string {
  if (!text || !text.includes('oklch')) return text;
  return text.replace(/oklch\([^)]+\)/gi, (m) => oklchToRgb(m));
}

export const exportTableToPdf = async (elementId: string, filename: string) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      alert("Element not found: " + elementId);
      return;
    }

    // 1. Backup and sanitize live style tags in document.head
    const styleEls = Array.from(document.querySelectorAll('style'));
    const originalStyleTexts = styleEls.map((el) => el.textContent || '');
    styleEls.forEach((el) => {
      if (el.textContent && el.textContent.includes('oklch')) {
        el.textContent = sanitizeOklchInText(el.textContent);
      }
    });

    // 2. Backup and sanitize inline style attributes on element tree
    const allTargetElements = [element, ...Array.from(element.querySelectorAll('*'))] as HTMLElement[];
    const originalInlineStyles = allTargetElements.map((el) => el.getAttribute('style'));
    allTargetElements.forEach((el) => {
      const styleAttr = el.getAttribute('style');
      if (styleAttr && styleAttr.includes('oklch')) {
        el.setAttribute('style', sanitizeOklchInText(styleAttr));
      }
    });

    const prev = { overflow: element.style.overflow, maxHeight: element.style.maxHeight, height: element.style.height, flex: element.style.flex };
    element.style.overflow = 'visible';
    element.style.maxHeight = 'none';
    element.style.height = 'auto';
    element.style.flex = 'none';

    const innerTable = element.querySelector('table')?.parentElement;
    const prevInner = innerTable ? { overflow: innerTable.style.overflow, maxHeight: innerTable.style.maxHeight, height: innerTable.style.height } : null;
    if (innerTable) {
      innerTable.style.overflow = 'visible';
      innerTable.style.maxHeight = 'none';
      innerTable.style.height = 'auto';
    }

    // Manipulate badges for PDF
    const badges = element.querySelectorAll('.payment-badge') as NodeListOf<HTMLElement>;
    const originalBadges = Array.from(badges).map(b => ({ el: b, cssText: b.style.cssText, className: b.className }));
    badges.forEach((badge) => {
      const color = badge.getAttribute('data-pdf-color') || '#000';
      badge.style.cssText = `color: ${color}; font-weight: bold; font-size: 11px; text-align: center;`;
      badge.className = '';
    });

    // Reveal headers and footers
    const pdfHeaders = element.querySelectorAll('.pdf-header, .pdf-footer') as NodeListOf<HTMLElement>;
    pdfHeaders.forEach(el => {
      el.classList.remove('hidden');
      el.style.display = 'block';
    });

    const colorProps = [
      'color',
      'background-color',
      'border-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'outline-color',
      'box-shadow',
      'text-shadow',
      'fill',
      'stroke'
    ];

    try {
      await html2pdf()
        .set({
          margin: 8,
          filename: `${filename}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            scrollY: 0,
            onclone: (clonedDoc: Document) => {
              // Sanitize style tags in clonedDoc
              const styleTags = clonedDoc.querySelectorAll('style');
              styleTags.forEach((styleTag) => {
                if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
                  styleTag.textContent = sanitizeOklchInText(styleTag.textContent);
                }
              });

              // Sanitize computed colors on cloned elements
              const allEls = Array.from(clonedDoc.querySelectorAll('*')) as HTMLElement[];
              const win = clonedDoc.defaultView || window;
              allEls.forEach((el) => {
                const styleAttr = el.getAttribute('style');
                if (styleAttr && styleAttr.includes('oklch')) {
                  el.setAttribute('style', sanitizeOklchInText(styleAttr));
                }
                try {
                  const comp = win.getComputedStyle(el);
                  colorProps.forEach((prop) => {
                    const val = comp.getPropertyValue(prop);
                    if (val && val.includes('oklch')) {
                      el.style.setProperty(prop, sanitizeOklchInText(val), 'important');
                    }
                  });
                } catch {}
              });
            }
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        } as any)
        .from(element)
        .save();
    } finally {
      // Restore live style tags
      styleEls.forEach((el, i) => {
        el.textContent = originalStyleTexts[i];
      });

      // Restore live inline styles
      allTargetElements.forEach((el, i) => {
        if (originalInlineStyles[i] !== null) {
          el.setAttribute('style', originalInlineStyles[i]!);
        } else {
          el.removeAttribute('style');
        }
      });

      // Restore layout
      element.style.overflow = prev.overflow;
      element.style.maxHeight = prev.maxHeight;
      element.style.height = prev.height;
      element.style.flex = prev.flex;

      if (innerTable && prevInner) {
        innerTable.style.overflow = prevInner.overflow;
        innerTable.style.maxHeight = prevInner.maxHeight;
        innerTable.style.height = prevInner.height;
      }

      // Restore badges
      originalBadges.forEach(({ el, cssText, className }) => {
        el.style.cssText = cssText;
        el.className = className;
      });

      // Restore headers
      pdfHeaders.forEach(el => {
        el.classList.add('hidden');
        el.style.display = '';
      });
    }
  } catch (e: any) {
    alert("Export PDF Error: " + (e?.message || JSON.stringify(e)));
    console.error(e);
  }
};
