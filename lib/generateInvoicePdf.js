import PDFDocument from 'pdfkit';
import path from 'path';

export async function generateInvoicePdf(order, docType = 'invoice') {
  const isQuotation = docType === 'quotation';
  const label = isQuotation ? 'Quotation' : 'Invoice';

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ===== Header — logo + tagline =====
      const logoPath = path.join(process.cwd(), 'public', 'logo-invoice.png');
      try {
        doc.image(logoPath, 40, 45, { width: 160 }); // 160 width, 5:1 ratio -> ~32 height
      } catch (imgErr) {
        // Logo file missing/unreadable — fall back to text so PDF generation never breaks
        doc.fontSize(20).fillColor('#000').text('Suma Automation', 50, 45);
      }
      doc.fontSize(9).fillColor('#777').text('PLC & Automation Components', 50, 82);
      doc.text(process.env.BUSINESS_WEBSITE || '', 50, 94);
      doc.text(process.env.BUSINESS_EMAIL || '', 50, 106);
      doc.fillColor('#000');

      // ===== Header — doc type / order info (top right) =====
      doc.fontSize(16).text(label, 0, 45, { align: 'right' });
      doc.fontSize(10).fillColor('#000');
      doc.text(`Order #: ${order.orderNumber || order._id}`, { align: 'right' });
      doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB')}`, { align: 'right' });

      if (isQuotation) {
        doc.fillColor('#d97706').text('Status: Payment Pending', { align: 'right' });
      } else {
        doc.fillColor('#16a34a').text('Status: Payment Confirmed', { align: 'right' });
      }
      doc.fillColor('#000');

      doc.y = 150;

      // ===== Delivery details =====
      doc.fontSize(12).text('Deliver To:', 50, doc.y, { underline: true });
      doc.fontSize(10);
      doc.text(order.deliveryDetails?.fullName || '');
      doc.text(order.deliveryDetails?.phone || '');
      doc.text(order.deliveryDetails?.address || '');
      doc.text(order.deliveryDetails?.city || '');
      doc.moveDown(2);

      // ===== Items table =====
      const tableTop = doc.y;
      doc.fontSize(10).fillColor('#000');
      doc.text('Item', 50, tableTop, { width: 250 });
      doc.text('Qty', 300, tableTop, { width: 50, align: 'right' });
      doc.text('Price', 360, tableTop, { width: 80, align: 'right' });
      doc.text('Total', 450, tableTop, { width: 80, align: 'right' });
      doc.moveTo(50, tableTop + 15).lineTo(530, tableTop + 15).stroke();

      let y = tableTop + 25;
      order.items.forEach((item) => {
        const rowHeight = doc.heightOfString(item.name, { width: 250 });
        doc.text(item.name, 50, y, { width: 250 });
        doc.text(String(item.qty), 300, y, { width: 50, align: 'right' });
        doc.text(`Rs. ${item.price.toLocaleString()}`, 360, y, { width: 80, align: 'right' });
        doc.text(`Rs. ${(item.price * item.qty).toLocaleString()}`, 450, y, { width: 80, align: 'right' });
        y += Math.max(rowHeight, 18) + 6;
      });

      doc.moveTo(50, y + 5).lineTo(530, y + 5).stroke();
      y += 15;

      // ===== Totals =====
      doc.fontSize(11).font('Helvetica').fillColor('#000');
      doc.text('Subtotal:', 290, y, { width: 150, align: 'right' });
      doc.text(`Rs. ${(order.subtotal || 0).toLocaleString()}`, 450, y, { width: 80, align: 'right' });
      y += 20;

      if (order.deliveryCharge) {
        doc.text('Delivery Charge:', 290, y, { width: 150, align: 'right' });
        doc.text(`Rs. ${order.deliveryCharge.toLocaleString()}`, 450, y, { width: 80, align: 'right' });
        y += 20;
      }

      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Total:', 290, y, { width: 150, align: 'right' });
      doc.text(`Rs. ${(order.total || 0).toLocaleString()}`, 450, y, { width: 80, align: 'right' });
      doc.font('Helvetica');
      y += 35;

      // ===== Quotation note + Bank details (only for quotation) =====
      if (isQuotation) {
        doc.fontSize(9).font('Helvetica').fillColor('#777');
        doc.text(
          'This is a quotation only. Please complete payment via bank transfer to confirm your order.',
          50,
          y,
          { width: 480 }
        );
        y += 25;

        // Bank details box
        const boxHeight = 80;
        doc.rect(50, y, 300, boxHeight).stroke('#ddd');
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#000');
        doc.text('Bank Transfer Details', 60, y + 10);
        doc.fontSize(8).font('Helvetica').fillColor('#333');
        doc.text(`Bank: ${process.env.BANK_NAME || '-'}`, 60, y + 28);
        doc.text(`Account Name: ${process.env.BANK_ACCOUNT_NAME || '-'}`, 60, y + 40);
        doc.text(`Account Number: ${process.env.BANK_ACCOUNT_NUMBER || '-'}`, 60, y + 52);
        doc.text(`Branch: ${process.env.BANK_BRANCH || '-'}`, 60, y + 64);

        doc.fillColor('#000');
        y += boxHeight + 20;
      }

      // ===== Footer — bottom of page =====
      const pageHeight = doc.page.height;
      doc.fontSize(8).fillColor('#999');
      doc.text(
        'Suma Automation — PLC & Automation Components, Sri Lanka',
        50,
        pageHeight - 60,
        { width: 480, align: 'center' }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}