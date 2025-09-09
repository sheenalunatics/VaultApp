
import React, { useState, useCallback } from 'react';
import type { Credential } from '../types';
import { EyeIcon, EyeOffIcon, EditIcon, TrashIcon, CopyIcon, CheckIcon, TagIcon } from './Icons';

interface CredentialItemProps {
  credential: Credential;
  onEdit: () => void;
  onDelete: () => void;
  categoryName?: string;
}

const CredentialItem: React.FC<CredentialItemProps> = ({ credential, onEdit, onDelete, categoryName }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(prev => !prev);
  }, []);

  const copyPassword = useCallback(() => {
    navigator.clipboard.writeText(credential.password).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [credential.password]);

  const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; label: string }> = ({ onClick, children, label }) => (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="p-2 text-brand-text-secondary hover:text-brand-text-primary rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-brand-surface transition-colors"
    >
      {children}
    </button>
  );

  return (
    <div className="bg-brand-surface rounded-lg shadow-lg p-4 transition-shadow hover:shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-brand-border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <p className="text-lg font-bold text-brand-text-primary truncate">{credential.site}</p>
           {categoryName && (
                <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-brand-primary/20 text-brand-primary text-xs font-medium px-2 py-1 rounded-full">
                    <TagIcon className="w-3.5 h-3.5" />
                    {categoryName}
                </span>
            )}
        </div>
        <p className="text-sm text-brand-text-secondary truncate mt-1">{credential.username}</p>
        <div className="flex items-center mt-2">
            <input
                type={isPasswordVisible ? 'text' : 'password'}
                value={credential.password}
                readOnly
                className="text-sm text-brand-text-secondary bg-transparent border-none p-0 w-32 focus:ring-0"
            />
            <ActionButton onClick={togglePasswordVisibility} label={isPasswordVisible ? 'Hide password' : 'Show password'}>
                {isPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </ActionButton>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 border-t border-brand-border sm:border-t-0 pt-3 sm:pt-0">
         <ActionButton onClick={copyPassword} label="Copy password">
            {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
         </ActionButton>
        <ActionButton onClick={onEdit} label="Edit credential">
          <EditIcon className="w-5 h-5" />
        </ActionButton>
        <ActionButton onClick={onDelete} label="Delete credential">
          <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-400" />
        </ActionButton>
      </div>
    </div>
  );
};

export default CredentialItem;
