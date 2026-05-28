import React from 'react';
import { AdminLayout } from './AdminLayout';
import { ArrowLeft, Download, Send, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceDetailsProps {
  invoiceId: string;
  onNavigate: (view: string, options?: any) => void;
  onLogout: () => void;
}

export function InvoiceDetails({ invoiceId, onNavigate, onLogout }: InvoiceDetailsProps) {
  // Mock data - you can change the status here to test different states
  const invoice = {
    id: 'INV-001',
    status: 'Sent', // Change to 'Draft', 'Sent', 'Paid', or 'Void' to test different states
    client: {
      name: 'Acme Corp',
      email: 'contact@acme.com',
      address: '123 Business St, Suite 100',
      city: 'New York, NY 10001',
    },
    issueDate: '2026-02-01',
    dueDate: '2026-02-15',
    sentDate: '2026-02-01',
    viewedDate: '2026-02-02',
    paidDate: null, // Set to a date when status is 'Paid'
    lineItems: [
      { description: 'Web Development Services', quantity: 40, unitPrice: 100, tax: 10, amount: 4400 },
      { description: 'Design Consultation', quantity: 10, unitPrice: 85, tax: 10, amount: 935 },
    ],
    subtotal: 4250,
    tax: 425,
    discount: 100,
    total: 4575,
    notes: 'Payment due within 14 days. Thank you for your business.',
    currency: 'USD',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-gray-800 text-white';
      case 'Sent': return 'bg-gray-300 text-gray-900';
      case 'Overdue': return 'bg-gray-500 text-white';
      case 'Draft': return 'bg-gray-100 text-gray-600 border border-gray-300';
      case 'Void': return 'bg-white text-gray-400 border border-gray-300';
      default: return 'bg-gray-200 text-gray-900';
    }
  };

  // Determine if actions should be disabled
  const isPaidOrVoid = invoice.status === 'Paid' || invoice.status === 'Void';

  const handleMarkAsPaid = () => {
    alert('Invoice marked as paid!');
  };

  const handleVoidInvoice = () => {
    if (window.confirm('Are you sure you want to void this invoice? This action cannot be undone.')) {
      alert('Invoice voided successfully!');
      onNavigate('invoices');
    }
  };

  const handleSendInvoice = () => {
    alert('Invoice sent successfully to ' + invoice.client.email);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Get page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    // Add noise/texture background (light gray rectangle)
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Header Section
    // Company logo placeholder (gray box)
    doc.setFillColor(180, 180, 180);
    doc.rect(margin, 15, 25, 25, 'F');
    
    // Company details next to logo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Company Name', margin + 30, 22);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('contact@company.com', margin + 30, 28);
    doc.text('+1 (555) 123-4567', margin + 30, 33);
    
    // Invoice title and number (right aligned)
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 180, 180);
    doc.text('Invoice', pageWidth - margin, 22, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`#${invoice.id}`, pageWidth - margin, 30, { align: 'right' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Centered date section with border
    const dateBoxY = 50;
    const dateBoxWidth = 60;
    const dateBoxX = (pageWidth - dateBoxWidth) / 2;
    
    // Invoice Date
    doc.setFillColor(245, 245, 245);
    doc.rect(dateBoxX, dateBoxY, dateBoxWidth, 18, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(dateBoxX, dateBoxY, dateBoxWidth, 18, 'S');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('INVOICE DATE', dateBoxX + dateBoxWidth / 2, dateBoxY + 6, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.issueDate, dateBoxX + dateBoxWidth / 2, dateBoxY + 13, { align: 'center' });
    
    // Due Date
    doc.setFillColor(245, 245, 245);
    doc.rect(dateBoxX, dateBoxY + 22, dateBoxWidth, 18, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(dateBoxX, dateBoxY + 22, dateBoxWidth, 18, 'S');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('DUE DATE', dateBoxX + dateBoxWidth / 2, dateBoxY + 28, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.dueDate, dateBoxX + dateBoxWidth / 2, dateBoxY + 35, { align: 'center' });
    
    // Reset font
    doc.setFont('helvetica', 'normal');
    
    // Bill From section (left)
    let currentY = 100;
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('FROM', margin, currentY);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Company Name', margin, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('456 Business Ave', margin, currentY + 12);
    doc.text('San Francisco, CA 94102', margin, currentY + 17);
    
    // Bill To section (right)
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('BILL TO', pageWidth - margin - 80, currentY);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name, pageWidth - margin - 80, currentY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(invoice.client.address, pageWidth - margin - 80, currentY + 12);
    doc.text(invoice.client.city, pageWidth - margin - 80, currentY + 17);
    doc.text(invoice.client.email, pageWidth - margin - 80, currentY + 22);
    
    // Line items table
    currentY = 135;
    const headers = [['Description', 'Qty', 'Unit Price', 'Tax %', 'Amount']];
    const data = invoice.lineItems.map(item => [
      item.description,
      item.quantity.toString(),
      `$${item.unitPrice.toFixed(2)}`,
      `${item.tax}%`,
      `$${item.amount.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      head: headers,
      body: data,
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { 
        fillColor: [240, 240, 240], 
        textColor: [30, 30, 30],
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 30, 30]
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'right', cellWidth: 30 }
      },
      styles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      }
    });
    
    // Totals section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalsX = pageWidth - margin - 60;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    // Subtotal
    doc.text('Subtotal:', totalsX - 20, finalY, { align: 'right' });
    doc.text(`$${invoice.subtotal.toFixed(2)}`, totalsX + 30, finalY, { align: 'right' });
    
    // Tax
    doc.text('Tax:', totalsX - 20, finalY + 6, { align: 'right' });
    doc.text(`$${invoice.tax.toFixed(2)}`, totalsX + 30, finalY + 6, { align: 'right' });
    
    // Discount
    doc.text('Discount:', totalsX - 20, finalY + 12, { align: 'right' });
    doc.text(`-$${invoice.discount.toFixed(2)}`, totalsX + 30, finalY + 12, { align: 'right' });
    
    // Draw line above total
    doc.setDrawColor(200, 200, 200);
    doc.line(totalsX - 35, finalY + 16, pageWidth - margin, finalY + 16);
    
    // Total with highlight background (light gray box)
    doc.setFillColor(220, 220, 220);
    doc.rect(totalsX - 40, finalY + 18, 80, 10, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Total (${invoice.currency}):`, totalsX - 20, finalY + 25, { align: 'right' });
    doc.text(`$${invoice.total.toFixed(2)}`, totalsX + 30, finalY + 25, { align: 'right' });
    
    // Notes section
    if (invoice.notes) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text('Payment Terms:', margin, finalY + 40);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
      doc.text(splitNotes, margin, finalY + 46);
    }
    
    // Footer - Bank Details
    const footerY = pageHeight - 35;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    
    // Account Name
    doc.text('ACCOUNT NAME', margin, footerY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Your Company Name', margin, footerY + 4);
    
    // Bank Name
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('BANK NAME', margin + 50, footerY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Your Bank Name', margin + 50, footerY + 4);
    
    // Routing Number
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('ROUTING #', margin + 100, footerY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('123456789', margin + 100, footerY + 4);
    
    // Account Number
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('ACCOUNT #', margin + 135, footerY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('9876543210', margin + 135, footerY + 4);
    
    // Account Type
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('ACCOUNT TYPE', pageWidth - margin - 25, footerY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Checking', pageWidth - margin - 25, footerY + 4);
    
    // Save the PDF
    doc.save(`Invoice_${invoice.id}.pdf`);
  };

  const handleDownloadCSV = () => {
    // Create CSV header for invoice
    const lines = [];
    lines.push('INVOICE');
    lines.push('');
    lines.push(`Invoice #,${invoice.id}`);
    lines.push(`Issue Date,${invoice.issueDate}`);
    lines.push(`Due Date,${invoice.dueDate}`);
    lines.push(`Status,${invoice.status}`);
    lines.push('');
    lines.push('FROM:,Your Company Name');
    lines.push(',456 Business Ave');
    lines.push(',San Francisco CA 94102');
    lines.push('');
    lines.push('BILL TO:');
    lines.push(`Client,${invoice.client.name}`);
    lines.push(`Address,${invoice.client.address}`);
    lines.push(`City,${invoice.client.city}`);
    lines.push(`Email,${invoice.client.email}`);
    lines.push('');
    lines.push('LINE ITEMS:');
    lines.push('Description,Quantity,Unit Price,Tax %,Amount');
    
    invoice.lineItems.forEach(item => {
      lines.push(`${item.description},${item.quantity},$${item.unitPrice.toFixed(2)},${item.tax}%,$${item.amount.toFixed(2)}`);
    });
    
    lines.push('');
    lines.push(`Subtotal,,,,$${invoice.subtotal.toFixed(2)}`);
    lines.push(`Tax,,,,$${invoice.tax.toFixed(2)}`);
    lines.push(`Discount,,,,-$${invoice.discount.toFixed(2)}`);
    lines.push(`Total (${invoice.currency}),,,,$${invoice.total.toFixed(2)}`);
    lines.push('');
    
    if (invoice.notes) {
      lines.push('NOTES:');
      lines.push(invoice.notes);
    }
    
    const csvContent = lines.join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Invoice_${invoice.id}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout currentPage="invoices" onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => onNavigate('invoices')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </button>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1>{invoice.id}</h1>
                <span className={`inline-flex px-3 py-1 text-sm rounded ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
              <p className="text-gray-600">
                Issued on {invoice.issueDate} • Due {invoice.dueDate}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button
                onClick={() => onNavigate('invoice-form', { invoiceId: invoice.id, edit: true })}
                disabled={isPaidOrVoid}
                className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Edit
              </Button>
              <Button
                onClick={handleSendInvoice}
                disabled={isPaidOrVoid}
                className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Invoice
              </Button>
              <Button
                onClick={handleDownloadPDF}
                className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                onClick={handleDownloadCSV}
                className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
              <Button
                onClick={handleMarkAsPaid}
                disabled={isPaidOrVoid}
                className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Paid
              </Button>
              <Button
                onClick={handleVoidInvoice}
                disabled={isPaidOrVoid}
                className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Void
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Preview Section */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-300 rounded">
              {/* Invoice Header */}
              <div className="p-6 sm:p-8 border-b border-gray-300">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div>
                    <div className="w-16 h-16 bg-gray-400 rounded mb-4"></div>
                    <p className="text-sm text-gray-600">From:</p>
                    <p className="font-semibold text-gray-900">Your Company Name</p>
                    <p className="text-sm text-gray-600">456 Business Ave</p>
                    <p className="text-sm text-gray-600">San Francisco, CA 94102</p>
                  </div>
                  <div className="sm:text-right">
                    <h2 className="text-gray-900 mb-2">INVOICE</h2>
                    <p className="text-sm text-gray-600">Invoice #: {invoice.id}</p>
                    <p className="text-sm text-gray-600">Date: {invoice.issueDate}</p>
                    <p className="text-sm text-gray-600">Due: {invoice.dueDate}</p>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="p-6 sm:p-8 border-b border-gray-300">
                <p className="text-sm text-gray-600 mb-2">Bill To:</p>
                <p className="font-semibold text-gray-900">{invoice.client.name}</p>
                <p className="text-sm text-gray-600">{invoice.client.address}</p>
                <p className="text-sm text-gray-600">{invoice.client.city}</p>
                <p className="text-sm text-gray-600">{invoice.client.email}</p>
              </div>

              {/* Line Items */}
              <div className="p-6 sm:p-8 border-b border-gray-300">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="pb-3 text-left text-sm font-semibold text-gray-900">Description</th>
                        <th className="pb-3 text-right text-sm font-semibold text-gray-900">Qty</th>
                        <th className="pb-3 text-right text-sm font-semibold text-gray-900 hidden sm:table-cell">Unit Price</th>
                        <th className="pb-3 text-right text-sm font-semibold text-gray-900 hidden md:table-cell">Tax %</th>
                        <th className="pb-3 text-right text-sm font-semibold text-gray-900">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-3 text-sm text-gray-900">{item.description}</td>
                          <td className="py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                          <td className="py-3 text-sm text-gray-600 text-right hidden sm:table-cell">${item.unitPrice.toFixed(2)}</td>
                          <td className="py-3 text-sm text-gray-600 text-right hidden md:table-cell">{item.tax}%</td>
                          <td className="py-3 text-sm text-gray-900 text-right">${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-6 flex justify-end">
                  <div className="w-full sm:w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-900">${invoice.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-gray-900">-${invoice.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="font-semibold text-gray-900">Total ({invoice.currency}):</span>
                      <span className="font-semibold text-gray-900 text-xl">${invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="p-6 sm:p-8">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Notes:</p>
                  <p className="text-sm text-gray-600">{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Section */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-300 rounded p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Activity</h3>
              <div className="space-y-4">
                {/* Created */}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-900 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">Created</p>
                    <p className="text-xs text-gray-600">{invoice.issueDate}</p>
                  </div>
                </div>

                {/* Sent */}
                {invoice.sentDate ? (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-900 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">Sent</p>
                      <p className="text-xs text-gray-600">{invoice.sentDate}</p>
                      <p className="text-xs text-gray-500 mt-1">Email sent to {invoice.client.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Not sent yet</p>
                    </div>
                  </div>
                )}

                {/* Viewed */}
                {invoice.viewedDate ? (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-900 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">Viewed by client</p>
                      <p className="text-xs text-gray-600">{invoice.viewedDate}</p>
                    </div>
                  </div>
                ) : invoice.sentDate ? (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Not viewed yet</p>
                    </div>
                  </div>
                ) : null}

                {/* Paid */}
                {invoice.paidDate ? (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-900 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">Paid</p>
                      <p className="text-xs text-gray-600">{invoice.paidDate}</p>
                    </div>
                  </div>
                ) : invoice.status === 'Void' ? (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Invoice voided</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Payment pending</p>
                      <p className="text-xs text-gray-600">Due {invoice.dueDate}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Info */}
            {invoice.status === 'Paid' && (
              <div className="mt-6 bg-white border border-gray-300 rounded p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Payment Received</h3>
                    <p className="text-sm text-gray-600">
                      This invoice has been marked as paid. No further actions needed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {invoice.status === 'Void' && (
              <div className="mt-6 bg-white border border-gray-300 rounded p-6">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Invoice Voided</h3>
                    <p className="text-sm text-gray-600">
                      This invoice has been voided and is no longer active.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}