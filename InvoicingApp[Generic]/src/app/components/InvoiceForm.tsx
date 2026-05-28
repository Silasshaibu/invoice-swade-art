import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface InvoiceFormProps {
  invoiceId: string | null;
  isEdit: boolean;
  onNavigate: (view: string, options?: any) => void;
  onLogout: () => void;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  lineTotal: number;
}

export function InvoiceForm({ invoiceId, isEdit, onNavigate, onLogout }: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    clientId: isEdit ? '1' : '',
    issueDate: isEdit ? '2026-02-05' : new Date().toISOString().split('T')[0],
    dueDate: isEdit ? '2026-02-19' : '',
    currency: isEdit ? 'usd' : 'usd',
    discount: isEdit ? '100.00' : '0.00',
  });

  const [errors, setErrors] = useState({
    clientId: '',
    issueDate: '',
    dueDate: '',
    lineItems: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>(
    isEdit
      ? [
          { id: '1', description: 'Web Development Services', quantity: 40, unitPrice: 100, taxPercent: 10, lineTotal: 4400 },
          { id: '2', description: 'Design Consultation', quantity: 10, unitPrice: 85, taxPercent: 10, lineTotal: 935 },
        ]
      : [{ id: '1', description: '', quantity: 1, unitPrice: 0, taxPercent: 0, lineTotal: 0 }]
  );

  const clients = [
    { id: '1', name: 'Acme Corp' },
    { id: '2', name: 'TechStart Inc' },
    { id: '3', name: 'Global Solutions' },
    { id: '4', name: 'Local Business' },
    { id: '5', name: 'Enterprise Co' },
  ];

  const currencies = [
    { value: 'usd', label: 'USD - US Dollar' },
    { value: 'eur', label: 'EUR - Euro' },
    { value: 'gbp', label: 'GBP - British Pound' },
  ];

  const calculateLineTotal = (quantity: number, unitPrice: number, taxPercent: number) => {
    const subtotal = quantity * unitPrice;
    const tax = subtotal * (taxPercent / 100);
    return subtotal + tax;
  };

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: String(Date.now()),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxPercent: 0,
      lineTotal: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice' || field === 'taxPercent') {
          updated.lineTotal = calculateLineTotal(
            field === 'quantity' ? Number(value) : updated.quantity,
            field === 'unitPrice' ? Number(value) : updated.unitPrice,
            field === 'taxPercent' ? Number(value) : updated.taxPercent
          );
        }
        return updated;
      }
      return item;
    }));
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    return sum + itemSubtotal;
  }, 0);

  const totalTax = lineItems.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemTax = itemSubtotal * (item.taxPercent / 100);
    return sum + itemTax;
  }, 0);

  const discountAmount = parseFloat(formData.discount) || 0;
  const total = subtotal + totalTax - discountAmount;

  const validateForm = () => {
    const newErrors = {
      clientId: '',
      issueDate: '',
      dueDate: '',
      lineItems: '',
    };

    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (lineItems.every(item => !item.description.trim())) {
      newErrors.lineItems = 'At least one line item is required';
    }

    setErrors(newErrors);
    return !newErrors.clientId && !newErrors.issueDate && !newErrors.dueDate && !newErrors.lineItems;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      alert(isEdit ? 'Invoice updated successfully!' : 'Invoice saved as draft!');
      onNavigate('invoices');
    }
  };

  return (
    <AdminLayout currentPage="invoices" onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('invoices')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </button>
          <h1>{isEdit ? 'Edit Invoice' : 'Create Invoice'}</h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update invoice details' : 'Create a new invoice draft'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-gray-300 rounded p-6">
            {/* Client Selection & Dates */}
            <div className="space-y-4 mb-8">
              <div>
                <Label htmlFor="client">Client *</Label>
                <Select 
                  value={formData.clientId} 
                  onValueChange={(value) => {
                    setFormData({ ...formData, clientId: value });
                    setErrors({ ...errors, clientId: '' });
                  }}
                >
                  <SelectTrigger id="client" className={`mt-1 ${errors.clientId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clientId && (
                  <p className="text-xs text-red-600 mt-1">{errors.clientId}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => {
                      setFormData({ ...formData, issueDate: e.target.value });
                      setErrors({ ...errors, issueDate: '' });
                    }}
                    className={`mt-1 ${errors.issueDate ? 'border-red-500' : ''}`}
                  />
                  {errors.issueDate && (
                    <p className="text-xs text-red-600 mt-1">{errors.issueDate}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => {
                      setFormData({ ...formData, dueDate: e.target.value });
                      setErrors({ ...errors, dueDate: '' });
                    }}
                    className={`mt-1 ${errors.dueDate ? 'border-red-500' : ''}`}
                  />
                  {errors.dueDate && (
                    <p className="text-xs text-red-600 mt-1">{errors.dueDate}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="currency">Currency *</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger id="currency" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(curr => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="discount">Discount (Fixed Amount)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">Enter a fixed dollar amount to discount from the total</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="border-t border-gray-300 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2>Line Items</h2>
                  {errors.lineItems && (
                    <p className="text-xs text-red-600 mt-1">{errors.lineItems}</p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={handleAddLineItem}
                  className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Line Item
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 w-24">Qty</th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 w-32">Unit Price</th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 w-24">Tax %</th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 w-32">Line Total</th>
                      <th className="px-3 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200">
                        <td className="px-3 py-3">
                          <Input
                            type="text"
                            placeholder="Service or product description"
                            value={item.description}
                            onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="1"
                            value={item.quantity || ''}
                            onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={item.unitPrice || ''}
                            onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="0"
                            value={item.taxPercent || ''}
                            onChange={(e) => handleLineItemChange(item.id, 'taxPercent', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="h-10 flex items-center px-3 bg-gray-50 border border-gray-300 rounded text-sm text-gray-900">
                            ${item.lineTotal.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(item.id)}
                            disabled={lineItems.length === 1}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Remove line item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="mt-6 pt-6 border-t border-gray-300">
                <div className="flex justify-end">
                  <div className="w-80 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-900">${totalTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-gray-900">-${discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-300">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-semibold text-gray-900 text-lg">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={() => onNavigate('invoices')}
              className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}