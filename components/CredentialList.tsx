
import React from 'react';
import type { Credential } from '../types';
import CredentialItem from './CredentialItem';

interface CredentialListProps {
  credentials: Credential[];
  onEdit: (credential: Credential) => void;
  onDelete: (id: string) => void;
}

const CredentialList: React.FC<CredentialListProps> = ({ credentials, onEdit, onDelete }) => {
  if (credentials.length === 0) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed border-brand-border rounded-lg">
        <h2 className="text-xl font-semibold text-brand-text-primary">No credentials saved yet.</h2>
        <p className="text-brand-text-secondary mt-2">Click "Add New" to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {credentials.map(credential => (
        <CredentialItem
          key={credential.id}
          credential={credential}
          onEdit={() => onEdit(credential)}
          onDelete={() => onDelete(credential.id)}
        />
      ))}
    </div>
  );
};

export default CredentialList;
