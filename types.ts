
export interface Credential {
  id: string;
  site: string;
  username: string;
  password: string;
}

export type CredentialInput = Omit<Credential, 'id'>;
