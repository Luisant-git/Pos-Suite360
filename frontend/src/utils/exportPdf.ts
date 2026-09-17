import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type PdfColumn = { header: string; dataKey: string };

export const exportTableToPdf = (
  columns: PdfColumn[],
  rows: Record<string, any>[],
  filename: string,
  title?: string,
  shopName?: string
) => {
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    let currentY = 14;

    // Shop Name
    if (shopName) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(shopName, 14, currentY);
      currentY += 8;
    }

    // Title
    if (title) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 14, currentY);
      currentY += 6;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, currentY);
      currentY += 8;
      doc.setTextColor(0);
    }

    autoTable(doc, {
      columns,
      body: rows,
      startY: currentY,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [203, 213, 225],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { top: 10, left: 10, right: 10 },
    });

    doc.save(`${filename}.pdf`);
  } catch (e: any) {
    alert('Export PDF Error: ' + (e?.message || JSON.stringify(e)));
    console.error(e);
  }
};
