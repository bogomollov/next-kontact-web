export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string | undefined;
  department_id: number;
  position_id: number;
}

export interface IMe {
  id: number;
  username: string;
  email: string;
  image?: string;
  phone: string;
  role_id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    middleName?: string | undefined;
    department_id: number;
    position_id: number;
  };
}

export type TMe =
  | {
      id: number;
      username: string;
      email: string;
      image?: string;
      phone: string;
      role_id: number;
      user: {
        id: number;
        firstName: string;
        lastName: string;
        middleName?: string | undefined;
        department_id: number;
        position_id: number;
      };
    }
  | undefined;
