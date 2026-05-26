// ==================================================
// TIPO USUÁRIO
// ==================================================
export type User = {
  id: string; 
  name: string;
  email: string;
  document?: string;
  role: string; 
  isAdmin: boolean;
  created_at?: string;
};
