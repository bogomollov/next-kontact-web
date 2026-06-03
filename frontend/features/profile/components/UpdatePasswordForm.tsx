"use client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import InputLabel from "@/components/ui/InputLabel";
import InputError from "@/components/ui/InputError";
import { FormErrors, FormState, IMe } from "@/types";
import { apiFetch } from "@/lib/apiFetch";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FormData {
  password: string;
  newPassword: string;
  repeatPassword: string;
}

export default function UpdatePasswordForm({ authUser }: { authUser: IMe }) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    password: "",
    newPassword: "",
    repeatPassword: "",
  });
  const [pending, setPending] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(undefined);
    setPending(true);
    setMessage(undefined);

    try {
      const response = await apiFetch(`/accounts/${authUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const responseData: FormState = await response.json();
      if (response.ok) {
        setFormData({
          password: "",
          newPassword: "",
          repeatPassword: "",
        });
        router.refresh();
      }
      if (responseData?.message && !response.ok) {
        setMessage(responseData.message);
      }
    } catch {
      setMessage("Ошибка при подключении к серверу");
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-6"
    >
      <h4 className="font-medium">Изменить пароль</h4>
      <p className="text-neutral-500">Используйте длинный пароль</p>
      <div className="mt-2 space-y-3">
        <div className="flex flex-col gap-[8px]">
          <InputLabel htmlFor="password">Текущий пароль</InputLabel>
          <Input
            id="password"
            name="password"
            type="password"
            className="w-full rounded-[10px] border px-[14px] py-[10px] focus:outline-blue-500"
            placeholder="Введите существующий пароль"
            onChange={handleChange}
            required
          />
          <InputError message={errors?.currentPassword} />
        </div>
        <div className="flex flex-col gap-[8px]">
          <InputLabel htmlFor="newPassword">Новый пароль</InputLabel>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            className="w-full rounded-[10px] border px-[14px] py-[10px] focus:outline-blue-500"
            placeholder="Придумайте безопасный пароль"
            onChange={handleChange}
            required
          />
          <InputError message={errors?.newPassword} />
        </div>
        <div className="flex flex-col gap-[8px]">
          <InputLabel htmlFor="repeatPassword">Подтверждение пароля</InputLabel>
          <Input
            id="repeatPassword"
            name="repeatPassword"
            type="password"
            className="w-full rounded-[10px] border px-[14px] py-[10px] focus:outline-blue-500"
            placeholder="Повторите новый пароль"
            onChange={handleChange}
            required
          />
          <InputError message={errors?.repeatPassword} />
        </div>
        <InputError message={message} />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="mt-4 w-full rounded-md bg-blue-500 text-white disabled:bg-blue-500/80"
      >
        Сохранить изменения
      </Button>
    </form>
  );
}
