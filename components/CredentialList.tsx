
import React from 'react';
import type { Credential, Category } from '../types';
import CredentialItem from './CredentialItem';

interface CredentialListProps {
  credentials: Credential[];
  categories: Category[];
  onEdit: (credential: Credential) => void;
  onDelete: (id: string) => void;
}

const CredentialList: React.FC<CredentialListProps> = ({ credentials, categories, onEdit, onDelete }) => {
  if (credentials.length === 0) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed border-brand-border rounded-lg">
        <h2 className="text-xl font-semibold text-brand-text-primary">No credentials found.</h2>
        <p className="text-brand-text-secondary mt-2">Try adjusting your category filter or click "Add New" to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {credentials.map(credential => {
        const category = categories.find(cat => cat.id === credential.categoryId);
        return (
          <CredentialItem
            key={credential.id}
            credential={credential}
            onEdit={() => onEdit(credential)}
            onDelete={() => onDelete(credential.id)}
            categoryName={category?.name}
          />
        );
        })}
    </div>
  );
};

export default CredentialList;
