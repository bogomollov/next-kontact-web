"use client";
import { FormState, IMe } from "@/types";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import { useState } from "react";

export default function DeleteAccountForm({ authUser }: { authUser: IMe }) {
  const router = useRouter();
  const [pending, setPending] = useState<boolean>(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);

    try {
      const response = await apiFetch(`/accounts/${authUser.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const responseData: FormState = await response.json();

      if (response.ok) {
        router.refresh();
      }
      if (responseData && !response.ok) {
        setMessage(responseData.message);
      }
    } catch (error) {
      setPending(false);
      console.log("Ошибка при удалении аккаунта:", error);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-6">
      <div className="flex flex-col gap-[8px]">
        <h4 className="font-medium">Удаление аккаунта</h4>
        <p className="text-neutral-500">Безвозвратное удаление</p>
      </div>
      <Button
        onClick={handleClick}
        className="mt-4 w-full rounded-md bg-red-500 text-white"
        disabled={pending}
      >
        Удалить аккаунт
      </Button>
    </div>
  );
}
