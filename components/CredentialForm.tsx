
import React, { useState, useEffect } from 'react';
import type { Credential, CredentialInput, Category } from '../types';

interface CredentialFormProps {
  onSubmit: (data: CredentialInput) => void;
  onCancel: () => void;
  initialData: Credential | null;
  categories: Category[];
}

const CredentialForm: React.FC<CredentialFormProps> = ({ onSubmit, onCancel, initialData, categories }) => {
  const [formData, setFormData] = useState<CredentialInput>({
    site: '',
    username: '',
    password: '',
    categoryId: undefined,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        site: initialData.site,
        username: initialData.username,
        password: initialData.password,
        categoryId: initialData.categoryId,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.site && formData.username && formData.password) {
      const dataToSubmit = {
          ...formData,
          categoryId: formData.categoryId === '' ? undefined : formData.categoryId
      };
      onSubmit(dataToSubmit);
    } else {
      alert('Please fill out all fields.');
    }
  };

  const generatePassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let newPassword = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        newPassword += charset.charAt(Math.floor(Math.random() * n));
    }
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="site" className="block text-sm font-medium text-brand-text-secondary">Website or App</label>
        <input
          type="text"
          name="site"
          id="site"
          value={formData.site}
          onChange={handleChange}
          required
          className="mt-1 block w-full bg-brand-bg border border-brand-border rounded-md shadow-sm py-2 px-3 text-brand-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-brand-text-secondary">Username or Email</label>
        <input
          type="text"
          name="username"
          id="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="mt-1 block w-full bg-brand-bg border border-brand-border rounded-md shadow-sm py-2 px-3 text-brand-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-brand-text-secondary">Category</label>
        <select
          name="categoryId"
          id="categoryId"
          value={formData.categoryId || ''}
          onChange={handleChange}
          className="mt-1 block w-full bg-brand-bg border border-brand-border rounded-md shadow-sm py-2 px-3 text-brand-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
        >
          <option value="">No Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-brand-text-secondary">Password</label>
        <div className="mt-1 flex rounded-md shadow-sm">
            <input
                type="text"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="block w-full rounded-none rounded-l-md bg-brand-bg border border-brand-border py-2 px-3 text-brand-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
            />
            <button type="button" onClick={generatePassword} className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-brand-border bg-brand-secondary px-4 py-2 text-sm font-medium text-brand-text-primary hover:bg-gray-600 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary">
                Generate
            </button>
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-brand-secondary text-brand-text-primary font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary focus:ring-offset-brand-surface transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-brand-surface transition-colors"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default CredentialForm;
