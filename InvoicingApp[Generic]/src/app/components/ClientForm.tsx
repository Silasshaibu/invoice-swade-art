import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface ClientFormProps {
  clientId: string | null;
  isEdit: boolean;
  onNavigate: (view: string, options?: any) => void;
  onLogout: () => void;
}

export function ClientForm({ clientId, isEdit, onNavigate, onLogout }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: isEdit ? 'Acme Corp' : '',
    email: isEdit ? 'contact@acme.com' : '',
    phone: isEdit ? '(555) 123-4567' : '',
    address: isEdit ? '123 Business St, Suite 100, New York, NY 10001' : '',
    billingAddress: isEdit ? '123 Business St, Suite 100, New York, NY 10001' : '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.phone;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Simulate save
      alert(isEdit ? 'Client updated successfully!' : 'Client created successfully!');
      onNavigate('clients');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <AdminLayout currentPage="clients" onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => onNavigate('clients')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Clients
          </button>
          <h1>{isEdit ? 'Edit Client' : 'Add Client'}</h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update client information' : 'Create a new client record'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-gray-300 rounded p-4 sm:p-6">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter client or company name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="123 Main St, Suite 100, New York, NY 10001"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Billing Address */}
              <div>
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Textarea
                  id="billingAddress"
                  placeholder="Same as address or enter different billing address"
                  value={formData.billingAddress}
                  onChange={(e) => handleChange('billingAddress', e.target.value)}
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">Leave blank to use same as address</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <Button
              type="button"
              onClick={() => onNavigate('clients')}
              className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gray-900 text-white hover:bg-gray-800 w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEdit ? 'Save Changes' : 'Save Client'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}