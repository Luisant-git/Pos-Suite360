import html2pdf from 'html2pdf.js';

export const exportTableToPdf = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const prev = { overflow: element.style.overflow, maxHeight: element.style.maxHeight, height: element.style.height };
  element.style.overflow = 'visible';
  element.style.maxHeight = 'none';
  element.style.height = 'auto';

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
    element.style.overflow = prev.overflow;
    element.style.maxHeight = prev.maxHeight;
    element.style.height = prev.height;
  }
};
