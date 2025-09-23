const PDFDocument = require('pdfkit');

function generateInvoice(order, stream) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();

    // Order Details
    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Customer: ${order.customer.name}`);
    doc.moveDown(2);

    // Table Header
    doc.font('Helvetica-Bold');
    doc.text('Item', 100, 200);
    doc.text('Qty', 300, 200);
    doc.text('Price', 370, 200);
    doc.text('Total', 440, 200, { align: 'right' });
    doc.font('Helvetica');
    doc.moveDown();

    // Table Rows
    let y = 220;
    order.medicines.forEach(item => {
        doc.text(item.name, 100, y);
        doc.text(item.quantity, 300, y);
        doc.text(`$${item.price.toFixed(2)}`, 370, y);
        doc.text(`$${(item.quantity * item.price).toFixed(2)}`, 440, y, { align: 'right' });
        y += 20;
    });

    // Total
    doc.font('Helvetica-Bold');
    doc.text(`Total Amount: $${order.totalAmount.toFixed(2)}`, 400, y + 20, { align: 'right' });

    doc.end();
}

module.exports = { generateInvoice };