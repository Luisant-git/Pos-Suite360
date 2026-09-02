import html2pdf from 'html2pdf.js';

export const exportTableToPdf = async (elementId: string, filename: string) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      alert("Element not found: " + elementId);
      return;
    }

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

    try {
      await html2pdf()
        .set({
          margin: 8,
          filename: `${filename}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        } as any)
        .from(element)
        .save();
    } finally {
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
