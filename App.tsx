
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { Credential, CredentialInput, Category } from './types';
import { LockIcon, PlusIcon, WarningIcon, LogoutIcon, TagIcon, EditIcon, TrashIcon } from './components/Icons';
import CredentialList from './components/CredentialList';
import CredentialForm from './components/CredentialForm';
import CategoryForm from './components/CategoryForm';
import Modal from './components/Modal';
import AuthScreen from './components/AuthScreen';
import { useEncryptedStorage } from './hooks/useEncryptedStorage';

const App: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');
  const [isSetupNeeded, setIsSetupNeeded] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  const [credentials, setCredentials] = useEncryptedStorage<Credential[]>('credentials', [], encryptionKey);
  const [categories, setCategories] = useEncryptedStorage<Category[]>('categories', [], encryptionKey);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');


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
    setCredentials([]);
    setCategories([]);
  }, [setCredentials, setCategories]);

  // Credential Modal Handlers
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

  // Category Modal and CRUD Handlers
  const handleAddCategory = useCallback(() => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  }, []);

  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  }, []);

  const handleDeleteCategory = useCallback((categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? Credentials in this category will become uncategorized.')) {
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setCredentials(prev => prev.map(cred => 
        cred.categoryId === categoryId ? { ...cred, categoryId: undefined } : cred
      ));
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId('all');
      }
    }
  }, [setCategories, setCredentials, selectedCategoryId]);

  const handleSaveCategory = useCallback(({ name }: { name: string }) => {
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name } : c));
    } else {
      setCategories(prev => [...prev, { id: crypto.randomUUID(), name }]);
    }
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  }, [editingCategory, setCategories]);

  const closeCategoryModal = useCallback(() => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  }, []);
  
  const filteredCredentials = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return credentials;
    }
    if (selectedCategoryId === 'uncategorized') {
      return credentials.filter(c => !c.categoryId || !categories.some(cat => cat.id === c.categoryId));
    }
    return credentials.filter(c => c.categoryId === selectedCategoryId);
  }, [credentials, categories, selectedCategoryId]);

  const CategoryFilterButton: React.FC<{onClick: () => void; isActive: boolean; children: React.ReactNode}> = ({ onClick, isActive, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
        isActive
          ? 'bg-brand-primary text-white'
          : 'bg-brand-surface hover:bg-brand-border text-brand-text-secondary'
      }`}
    >
      {children}
    </button>
  );

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
        
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <div className="flex items-center gap-2 self-start">
              <TagIcon className="w-6 h-6 text-brand-text-secondary" />
              <h2 className="text-xl font-semibold text-brand-text-primary">Categories</h2>
            </div>
            <button
              onClick={handleAddCategory}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 bg-brand-secondary text-brand-text-primary font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary focus:ring-offset-brand-bg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              New Category
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 py-4 border-t border-b border-brand-border">
            <CategoryFilterButton onClick={() => setSelectedCategoryId('all')} isActive={selectedCategoryId === 'all'}>
              All
            </CategoryFilterButton>
            <CategoryFilterButton onClick={() => setSelectedCategoryId('uncategorized')} isActive={selectedCategoryId === 'uncategorized'}>
              Uncategorized
            </CategoryFilterButton>
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-1 bg-brand-surface rounded-full shadow-sm">
                <button
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-l-full transition-colors ${selectedCategoryId === cat.id ? 'bg-brand-primary text-white' : 'hover:bg-brand-border text-brand-text-secondary'}`}
                >
                  {cat.name}
                </button>
                <button onClick={() => handleEditCategory(cat)} title="Edit Category" className="p-2 text-brand-text-secondary hover:text-brand-text-primary">
                    <EditIcon className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteCategory(cat.id)} title="Delete Category" className="p-2 pr-3 text-brand-text-secondary hover:text-red-500">
                    <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>


        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md mb-8 flex items-start gap-3 shadow-sm" role="alert">
          <WarningIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Disclaimer</p>
            <p className="text-sm">This is a demonstration app. All data is encrypted and stored in your browser's local storage. It is not suitable for storing highly sensitive information. For maximum security, please use a dedicated, encrypted password manager.</p>
          </div>
        </div>

        <CredentialList
          credentials={filteredCredentials}
          categories={categories}
          onEdit={handleEditCredential}
          onDelete={handleDeleteCredential}
        />

        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCredential ? 'Edit Credential' : 'Add New Credential'}>
            <CredentialForm
              onSubmit={handleSaveCredential}
              onCancel={closeModal}
              initialData={editingCredential}
              categories={categories}
            />
          </Modal>
        )}

        {isCategoryModalOpen && (
          <Modal isOpen={isCategoryModalOpen} onClose={closeCategoryModal} title={editingCategory ? 'Edit Category' : 'Add New Category'}>
            <CategoryForm
              onSubmit={handleSaveCategory}
              onCancel={closeCategoryModal}
              initialData={editingCategory}
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
