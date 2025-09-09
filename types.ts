
export interface Category {
  id: string;
  name: string;
}

export interface Credential {
  id: string;
  site: string;
  username: string;
  password: string;
  categoryId?: string;
}

export type CredentialInput = Omit<Credential, 'id'>;