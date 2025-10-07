const PDFDocument = require('pdfkit');
const path = require('path');

function generateInvoice(order, stream) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.pipe(stream);

    // --- Font Setup ---
    // CORRECTED: We now load the font files directly from the project's assets.
    // This makes the PDF generation independent of system-installed fonts.
    const regularFontPath = path.join(__dirname, '../assets/fonts/NotoSans-Regular.ttf');
    const boldFontPath = path.join(__dirname, '../assets/fonts/NotoSans-Bold.ttf');
    
    // Register the fonts with aliases that we can use throughout the document.
    doc.registerFont('NotoSans-Regular', regularFontPath);
    doc.registerFont('NotoSans-Bold', boldFontPath);

    // --- Colors and Styles ---
    const primaryColor = '#4CAF50';
    const secondaryColor = '#f2f2f2';
    const tableHeaderColor = '#e0e0e0';
    const textColor = '#333';

    // --- Header ---
    const logoPath = path.join(__dirname, '../assets/medichalo-logo.png');
    doc.image(logoPath, 50, 45, { width: 60 });

    doc.fillColor(primaryColor).fontSize(24).font('NotoSans-Bold').text('INVOICE', 275, 50, { align: 'right' });
    doc.fillColor(textColor).fontSize(12).font('NotoSans-Regular').text('MediChalo', 200, 80, { align: 'right' });
    doc.fontSize(10).fillColor('blue').text('www.medichalo.com', 200, 95, { align: 'right', link: 'https://medichalo-frontend.onrender.com' });

    // --- Order Details ---
    doc.moveTo(50, 130).lineTo(550, 130).strokeColor(primaryColor).stroke();

    doc.fillColor(textColor).fontSize(10).font('NotoSans-Regular');
    doc.text(`Order ID: ${order._id}`, 50, 140);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 155);
    doc.text(`Payment Method: ${order.paymentMethod}`, 50, 170);

    doc.text('Bill To:', 400, 140);
    doc.text(order.customer.name, 400, 155);
    if (order.deliveryAddress) {
        doc.text(`${order.deliveryAddress.street}, ${order.deliveryAddress.city}`, 400, 170);
    }

    doc.moveTo(50, 190).lineTo(550, 190).strokeColor(primaryColor).stroke();

    // --- Items Table ---
    const tableTop = 210;
    doc.fontSize(10).fillColor(textColor).font('NotoSans-Bold');
    doc.rect(50, tableTop - 5, 500, 20).fill(tableHeaderColor).strokeColor(primaryColor).stroke();

    doc.fillColor(textColor).text('Item', 55, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Unit Price', 370, tableTop);
    doc.text('Total', 0, tableTop, { align: 'right' });
    doc.font('NotoSans-Regular');

    order.medicines.forEach((item, i) => {
        const y = tableTop + 25 + i * 25;

        // Alternating row background
        doc.rect(50, y - 5, 500, 25).fill(i % 2 === 0 ? secondaryColor : '#fff').strokeColor(primaryColor).stroke();

        doc.fillColor(textColor).text(item.name, 55, y);
        doc.text(item.quantity, 300, y);
        doc.text(`₹${item.price.toFixed(2)}`, 370, y);
        doc.text(`₹${(item.quantity * item.price).toFixed(2)}`, 0, y, { align: 'right' });
    });

    // --- Totals ---
    const summaryTop = tableTop + 25 + (order.medicines.length * 25) + 15;
    doc.moveTo(370, summaryTop).lineTo(550, summaryTop).strokeColor(primaryColor).stroke();

    doc.fontSize(10).font('NotoSans-Regular');
    doc.text(`Subtotal: ₹${order.totalAmount.toFixed(2)}`, 400, summaryTop + 10, { align: 'right' });
    doc.text(`Delivery: ₹25.00`, 400, summaryTop + 25, { align: 'right' }); // Example fee

    doc.font('NotoSans-Bold').text(`Grand Total: ₹${(order.totalAmount + 25).toFixed(2)}`, 400, summaryTop + 45, { align: 'right' });
    doc.moveTo(370, summaryTop + 65).lineTo(550, summaryTop + 65).strokeColor(primaryColor).stroke();
    doc.font('NotoSans-Regular');

    // --- Footer ---
    doc.fontSize(10).fillColor(textColor).text('Thank you for your business.', 50, 750, { align: 'center', width: 500 });

    doc.end();
}

module.exports = { generateInvoice };

