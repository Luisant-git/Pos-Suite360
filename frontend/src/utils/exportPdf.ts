import html2pdf from 'html2pdf.js';

function oklchToRgb(oklchStr: string): string {
  // 1. Try browser Canvas 2D conversion first
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillStyle = oklchStr;
      const res = ctx.fillStyle;
      if (res && res !== '#000000' && res !== 'rgb(0, 0, 0)' && !res.includes('oklch')) {
        return res;
      }
    }
  } catch {}

  // 2. Math fallback parser for OKLCH -> sRGB
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
    const liveElement = document.getElementById(elementId);
    if (!liveElement) {
      alert("Element not found: " + elementId);
      return;
    }

    // 1. Temporarily sanitize live <style> tags in document.head
    const liveStyleEls = Array.from(document.querySelectorAll('style'));
    const styleReplacements: { original: HTMLStyleElement; temp: HTMLStyleElement }[] = [];
    liveStyleEls.forEach((styleEl) => {
      if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
        const tempStyle = document.createElement('style');
        tempStyle.textContent = sanitizeOklchInText(styleEl.textContent);
        Array.from(styleEl.attributes).forEach((attr) => tempStyle.setAttribute(attr.name, attr.value));
        styleEl.replaceWith(tempStyle);
        styleReplacements.push({ original: styleEl, temp: tempStyle });
      }
    });

    // 2. Temporarily sanitize live <link rel="stylesheet"> tags containing oklch
    const linkEls = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
    const linkReplacements: { link: HTMLLinkElement; tempStyle: HTMLStyleElement }[] = [];
    linkEls.forEach((link) => {
      try {
        const sheet = link.sheet;
        if (sheet && sheet.cssRules) {
          let cssText = '';
          const rules = Array.from(sheet.cssRules);
          for (const r of rules) {
            cssText += r.cssText + '\n';
          }
          if (cssText.includes('oklch')) {
            const tempStyle = document.createElement('style');
            tempStyle.textContent = sanitizeOklchInText(cssText);
            link.replaceWith(tempStyle);
            linkReplacements.push({ link, tempStyle });
          }
        }
      } catch {}
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

              // Perform visual layout adjustments strictly inside target cloned element
              const clonedElement = clonedDoc.getElementById(elementId);
              if (clonedElement) {
                // Reveal headers and footers ONLY inside target container
                const pdfHeaders = clonedElement.querySelectorAll('.pdf-header, .pdf-footer') as NodeListOf<HTMLElement>;
                pdfHeaders.forEach((el) => {
                  el.classList.remove('hidden');
                  el.style.display = 'block';
                });

                // Format payment badges ONLY inside target container
                const badges = clonedElement.querySelectorAll('.payment-badge') as NodeListOf<HTMLElement>;
                badges.forEach((badge) => {
                  const color = badge.getAttribute('data-pdf-color') || '#000';
                  badge.style.cssText = `color: ${color}; font-weight: bold; font-size: 11px; text-align: center;`;
                  badge.className = '';
                });

                // Expand container overflow & height ONLY inside target container
                clonedElement.style.overflow = 'visible';
                clonedElement.style.maxHeight = 'none';
                clonedElement.style.height = 'auto';
                clonedElement.style.flex = 'none';

                const innerTable = clonedElement.querySelector('table')?.parentElement;
                if (innerTable) {
                  innerTable.style.overflow = 'visible';
                  innerTable.style.maxHeight = 'none';
                  innerTable.style.height = 'auto';
                }

                // Sanitize computed colors ONLY on target element and its children (ignore navbar, sidebars, dropdowns)
                const targetEls = [clonedElement, ...Array.from(clonedElement.querySelectorAll('*'))] as HTMLElement[];
                const win = clonedDoc.defaultView || window;
                targetEls.forEach((el) => {
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
            }
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        } as any)
        .from(liveElement)
        .save();
    } finally {
      // Restore live style tags
      styleReplacements.forEach(({ original, temp }) => {
        if (temp.parentNode) {
          temp.replaceWith(original);
        }
      });

      // Restore live link tags
      linkReplacements.forEach(({ link, tempStyle }) => {
        if (tempStyle.parentNode) {
          tempStyle.replaceWith(link);
        }
      });
    }
  } catch (e: any) {
    alert("Export PDF Error: " + (e?.message || JSON.stringify(e)));
    console.error(e);
  }
};
