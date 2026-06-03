"use client";
import Input from "@/components/ui/Input";
import InputLabel from "@/components/ui/InputLabel";
import Button from "@/components/ui/Button";
import InputError from "@/components/ui/InputError";
import { FormErrors, FormState, IDepartment, IMe, IPosition } from "@/types";
import imageLoader from "@/lib/imageLoader";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";
import Image from "next/image";
import Select from "@/components/ui/Select";

interface FormData {
  firstName: string;
  lastName: string;
  middleName?: string | undefined;
  position_id: number;
  department_id: number;
  image: string | undefined;
  newImage: File | null;
}

export default function UpdateUserForm({
  authUser,
  departments,
  positions,
}: {
  authUser: IMe;
  departments: IDepartment[];
  positions: IPosition[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: authUser.user.firstName,
    lastName: authUser.user.lastName,
    middleName: authUser.user.middleName || undefined,
    department_id: authUser.user.department_id,
    position_id: authUser.user.position_id,
    image: authUser.image,
    newImage: null,
  });
  const [pending, setPending] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: Number(value) });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, newImage: file });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(undefined);
    setMessage(undefined);
    setPending(true);

    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    if (formData.middleName) {
      data.append("middleName", formData.middleName);
    }
    if (formData.department_id) {
      data.append("department_id", `${formData.department_id}`);
    }
    if (formData.position_id) {
      data.append("position_id", `${formData.position_id}`);
    }
    if (formData.newImage) {
      data.append("image", formData.newImage);
    }

    try {
      const response = await apiFetch(`/users/${authUser.id}`, {
        method: "PATCH",
        body: data,
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
      encType="multipart/form-data"
    >
      <div className="flex flex-col gap-[8px]">
        <h4 className="font-medium">Информация профиля</h4>
        <p className="text-neutral-500">Обновите сведения своего профиля</p>
      </div>
      <div className="flex flex-col gap-2">
        <Image
          loader={imageLoader}
          src={
            formData.newImage
              ? URL.createObjectURL(formData.newImage)
              : `${formData.image}`
          }
          width={55}
          height={55}
          alt={`avatar ${authUser.id}`}
          className="h-[55px] w-[55px] cursor-pointer rounded-full border"
          onClick={handleAvatarClick}
          onError={() =>
            setFormData({ ...formData, image: "/static/null.png" })
          }
        />
        <Input
          id="image"
          type="file"
          name="image"
          accept="image/png, image/jpeg"
          onChange={handleImageChange}
          className="hidden"
          ref={fileInputRef}
        />
      </div>
      <div className="flex flex-col gap-[8px]">
        <InputLabel htmlFor="firstName">Имя</InputLabel>
        <Input
          id="firstName"
          type="text"
          name="firstName"
          onChange={handleChange}
          value={formData.firstName}
          className="inline-flex w-full rounded-[10px] border px-[14px] py-[10px] focus:outline-blue-500"
          required
        />
        <InputError message={errors?.firstName} />
      </div>
      <div className="flex flex-col gap-[8px]">
        <InputLabel htmlFor="lastName">Фамилия</InputLabel>
        <Input
          id="lastName"
          type="text"
          name="lastName"
          onChange={handleChange}
          value={formData.lastName}
          className="inline-flex w-full rounded-[10px] border px-[14px] py-[10px] focus:outline-blue-500"
          required
        />
        <InputError message={errors?.lastName} />
      </div>
      <div className="flex flex-col gap-[8px]">
        <InputLabel htmlFor="middleName">Отчество</InputLabel>
        <Input
          id="middleName"
          type="text"
          name="middleName"
          onChange={handleChange}
          value={formData.middleName}
          className="inline-flex w-full rounded-[10px] border px-[14px] py-[10px] focus:outline-blue-500"
        />
        <InputError message={errors?.middleName} />
      </div>
      <div className="flex flex-col gap-[8px]">
        <InputLabel>Сфера деятельности</InputLabel>
        <Select
          name="department_id"
          value={formData.department_id}
          options={
            departments?.map((d) => ({ value: d.id, label: d.name })) || []
          }
          className="inline-flex w-full rounded-[10px] border px-[14px] py-[10px] focus:outline-blue-500"
          onChange={handleSelectChange}
          required
        />
      </div>
      <div className="flex flex-col gap-[8px]">
        <InputLabel>Должность</InputLabel>
        <Select
          name="position_id"
          value={formData.position_id}
          options={
            positions?.map((p) => ({ value: p.id, label: p.name })) || []
          }
          className="inline-flex w-full rounded-[10px] border px-[14px] py-[10px] focus:outline-blue-500"
          onChange={handleSelectChange}
          required
        />
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
