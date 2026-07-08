"use client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import InputLabel from "@/components/ui/InputLabel";
import InputError from "@/components/ui/InputError";
import { FormErrors, FormState, IMe } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

interface FormData {
  username: string;
  email: string;
  phone: string;
}

export default function UpdateAccountForm({ authUser }: { authUser: IMe }) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: authUser.username ?? "",
    email: authUser.email ?? "",
    phone: authUser.phone ?? "",
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
        router.refresh();
      }
      if (responseData?.errors) {
        setErrors(responseData.errors);
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
      <h4 className="font-medium">Данные аккаунта</h4>
      <p className="text-neutral-500">Измените данные своего аккаунта</p>
      <div className="mt space-y-3">
        <div className="flex flex-col gap-[8px]">
          <InputLabel htmlFor="username">Отображаемое имя</InputLabel>
          <Input
            id="username"
            name="username"
            className="w-full rounded-[10px] border px-[14px] py-[10px] focus:outline-blue-500"
            placeholder="Отображаемое имя"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <InputError message={errors?.username} />
        </div>
        <div className="flex flex-col gap-[8px]">
          <InputLabel htmlFor="email">Эл.почта</InputLabel>
          <Input
            id="email"
            name="email"
            className="w-full rounded-[10px] border px-[14px] py-[10px] focus:outline-blue-500"
            placeholder="Электронная почта"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <InputError message={errors?.email} />
        </div>
        <div className="flex flex-col gap-[8px]">
          <InputLabel htmlFor="phone">Номер телефона</InputLabel>
          <Input
            id="phone"
            name="phone"
            className="w-full rounded-[10px] border px-[14px] py-[10px] focus:outline-blue-500"
            placeholder="Номер телефона"
            maxLength={12}
            value={formData.phone}
            onChange={handleChange}
          />
          <InputError message={errors?.phone} />
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
