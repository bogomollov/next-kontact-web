import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Неправильный формат почты" }).trim(),
  password: z
    .string()
    .min(8, { message: "Минимальная длина пароля 8 символов" })
    .trim(),
});

export const RegisterFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "Минимальная длина имени 2 символа" })
    .trim(),
  lastName: z
    .string()
    .min(2, { message: "Минимальная длина фамилии 2 символа" })
    .trim(),
  middleName: z.string().trim().optional(),
  email: z.string().email({ message: "Неправильный формат почты" }).trim(),
  username: z
    .string()
    .min(3, { message: "Минимальная длина псевдонима 3 символа" })
    .trim(),
  password: z
    .string()
    .min(3, { message: "Минимальная длина пароля 3 символа" })
    .trim(),
});

export const UserFormSchema = z.object({
  account_id: z.string().trim(),
  firstName: z
    .string()
    .min(2, { message: "Минимальная длина имени 2 символа" })
    .trim(),
  lastName: z
    .string()
    .min(2, { message: "Минимальная длина фамилии 2 символа" })
    .trim(),
  middleName: z
    .string()
    .min(2, { message: "Минимальная длина отчества 2 символа" })
    .trim(),
  file: z
    .any()
    .refine((file) => file instanceof File, "Неверный формат файла")
    .optional(),
});

export const AccountFormSchema = z.object({
  account_id: z.string().trim(),
  username: z
    .string()
    .min(3, { message: "Минимальная длина псевдонима 3 символа" })
    .trim(),
  email: z
    .string()
    .email({ message: "Неправильный формат почты" })
    .trim()
    .optional(),
  phone: z.string().optional(),
});

export const ClientErrorReportSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  stack: z.string().max(8000).optional(),
  digest: z.string().max(200).optional(),
  url: z.string().max(2000).optional(),
});

export const PasswordFormSchema = z.object({
  account_id: z.string().trim(),
  currentPassword: z
    .string()
    .min(3, { message: "Минимальная длина пароля 3 символа" })
    .trim(),
  newPassword: z
    .string()
    .min(3, { message: "Минимальная длина пароля 3 символа" })
    .trim(),
  repeatPassword: z
    .string()
    .min(3, { message: "Минимальная длина пароля 3 символа" })
    .trim(),
});
