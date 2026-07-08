export type FormErrors = { [key: string]: string } | undefined;

export interface FormState {
  message?: string;
  errors?: FormErrors;
}
