import React, { useState, useCallback, useEffect } from 'react';
import type { Credential, CredentialInput } from './types';
import { LockIcon, PlusIcon, WarningIcon, LogoutIcon } from './components/Icons';
import CredentialList from './components/CredentialList';
import CredentialForm from './components/CredentialForm';
import Modal from './components/Modal';
import AuthScreen from './components/AuthScreen';
import { useEncryptedStorage } from './hooks/useEncryptedStorage';

const App: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');
  const [isSetupNeeded, setIsSetupNeeded] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  const [credentials, setCredentials] = useEncryptedStorage<Credential[]>('credentials', [], encryptionKey);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);

  useEffect(() => {
    const salt = window.localStorage.getItem('vault_salt');
    const hash = window.localStorage.getItem('vault_hash');
    if (!salt || !hash) {
      setIsSetupNeeded(true);
    }
    setAuthStatus('unauthenticated');
  }, []);

  const handleAuthSuccess = useCallback((key: CryptoKey) => {
    setEncryptionKey(key);
    setAuthStatus('authenticated');
  }, []);
  
  const handleLogout = useCallback(() => {
    setEncryptionKey(null);
    setAuthStatus('unauthenticated');
  }, []);

  const handleAddCredential = useCallback(() => {
    setEditingCredential(null);
    setIsModalOpen(true);
  }, []);

  const handleEditCredential = useCallback((credential: Credential) => {
    setEditingCredential(credential);
    setIsModalOpen(true);
  }, []);

  const handleDeleteCredential = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this credential? This action cannot be undone.')) {
      setCredentials(prev => prev.filter(c => c.id !== id));
    }
  }, [setCredentials]);

  const handleSaveCredential = useCallback((credentialData: CredentialInput) => {
    if (editingCredential) {
      setCredentials(prev => prev.map(c => c.id === editingCredential.id ? { ...c, ...credentialData } : c));
    } else {
      setCredentials(prev => [...prev, { id: crypto.randomUUID(), ...credentialData }]);
    }
    setIsModalOpen(false);
    setEditingCredential(null);
  }, [editingCredential, setCredentials]);
  
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCredential(null);
  }, []);

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <p className="text-brand-text-secondary">Loading...</p>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return <AuthScreen isSetup={isSetupNeeded} onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-brand-border">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <LockIcon className="w-8 h-8 text-brand-primary" />
            <h1 className="text-3xl font-bold text-brand-text-primary tracking-tight">
              Password Vault
            </h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleAddCredential}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-brand-bg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Add New
            </button>
            <button
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
              className="p-2 text-brand-text-secondary hover:text-brand-text-primary rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-brand-bg transition-colors"
            >
              <LogoutIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md mb-8 flex items-start gap-3 shadow-sm" role="alert">
          <WarningIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Disclaimer</p>
            <p className="text-sm">This is a demonstration app. All data is encrypted and stored in your browser's local storage. It is not suitable for storing highly sensitive information. For maximum security, please use a dedicated, encrypted password manager.</p>
          </div>
        </div>

        <CredentialList
          credentials={credentials}
          onEdit={handleEditCredential}
          onDelete={handleDeleteCredential}
        />

        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCredential ? 'Edit Credential' : 'Add New Credential'}>
            <CredentialForm
              onSubmit={handleSaveCredential}
              onCancel={closeModal}
              initialData={editingCredential}
            />
          </Modal>
        )}
      </main>
       <footer className="text-center py-4 mt-8 text-brand-text-secondary text-sm">
        <p>Built with React & Tailwind CSS. Securely client-side.</p>
      </footer>
    </div>
  );
};

export default App;