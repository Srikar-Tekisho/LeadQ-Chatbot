import React, { useState } from 'react';
import { Card, Button, Input, TextArea, Badge } from '../UIComponents';
import { CompanyProfile } from '../../types';

const CompanySection: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<CompanyProfile>({
    name: 'Nexus Innovations Inc.',
    website: 'https://nexus.example.com',
    address: '123 Tech Blvd, Silicon Valley, CA 94000',
    intro: 'Leading provider of enterprise SaaS solutions.'
  });

  const [errors, setErrors] = useState<{ name?: string; website?: string }>({});

  const services = [
    { id: 1, name: 'Cloud Hosting', category: 'Infrastructure', price: '$199/mo', status: 'Active' },
    { id: 2, name: 'Data Analytics', category: 'Software', price: '$499/mo', status: 'Active' },
    { id: 3, name: 'Consulting', category: 'Service', price: '$150/hr', status: 'Inactive' },
  ];

  const validateField = (field: 'name' | 'website', value: string): string | undefined => {
    if (field === 'name') {
      if (!value || value.trim() === '') {
        return "Company Name is required.";
      }
    }
    if (field === 'website') {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
      if (!value || !urlPattern.test(value)) {
        return "Please enter a valid website URL.";
      }
    }
    return undefined;
  };

  const handleBlur = (field: 'name' | 'website') => {
    const error = validateField(field, field === 'name' ? data.name : data.website);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const isFormValid = () => {
    const nameValid = !validateField('name', data.name);
    const websiteValid = !validateField('website', data.website);
    return nameValid && websiteValid;
  };

  const handleSave = () => {
    if (isFormValid()) {
      setIsEditing(false);
      setErrors({});
      // Simulate save
      console.log("Saved", data);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <Card title="Company Profile" description="Manage your organization's public details.">
        <div className="flex justify-end -mt-16 mb-6">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm">Edit</Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleCancel} variant="ghost" size="sm">Cancel</Button>
                <Button 
                  onClick={handleSave} 
                  variant="primary" 
                  size="sm"
                  disabled={!isFormValid()}
                >
                  Save
                </Button>
              </div>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label={<span>Company Name <span className="text-red-500">*</span></span>}
            value={data.name} 
            disabled={!isEditing} 
            onChange={e => {
              setData({...data, name: e.target.value});
              if (errors.name) setErrors({...errors, name: undefined});
            }}
            onBlur={() => handleBlur('name')}
            error={errors.name}
          />
          <Input 
            label={<span>Website URL <span className="text-red-500">*</span></span>}
            value={data.website} 
            disabled={!isEditing} 
            onChange={e => {
              setData({...data, website: e.target.value});
              if (errors.website) setErrors({...errors, website: undefined});
            }}
            onBlur={() => handleBlur('website')}
            error={errors.website}
          />
          
          <div className="md:col-span-2">
            <TextArea label="Address" value={data.address} disabled={!isEditing} onChange={e => setData({...data, address: e.target.value})} rows={2} />
          </div>
          <div className="md:col-span-2">
            <TextArea label="Introduction" value={data.intro} disabled={!isEditing} onChange={e => setData({...data, intro: e.target.value})} rows={3} maxLength={500} />
            {isEditing && <p className="text-xs text-right text-gray-500 mt-1">{data.intro.length}/500</p>}
          </div>
        </div>
      </Card>

      <Card title="Services / Products Catalog" description="Manage offerings visible to your customers.">
         <div className="flex justify-end mb-4">
             <Button size="sm" variant="primary">Add New Product</Button>
         </div>
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((svc) => (
                  <tr key={svc.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{svc.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{svc.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{svc.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={svc.status === 'Active' ? 'success' : 'neutral'}>{svc.status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
};

export default CompanySection;
