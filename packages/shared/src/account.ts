export interface IAccount {
  id: number;
  username: string;
  password: string;
  email: string;
  phone: string | null;
  role_id: number;
  user_id: number;
}
