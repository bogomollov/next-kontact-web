"use client";

import { useState } from "react";
import InputSearch from "@/components/ui/InputSearch";
import { SearchViewData } from "./SearchViewData";

export function Search() {
  const [data, setData] = useState([]);

  const handleData = async (data: any) => {
    setData(data.data);
  };

  return (
    <div className="px-[20px]">
      <InputSearch
        callbackData={handleData}
        className="inline-flex w-full rounded-[10px] border py-[12px] pr-[20px] pl-[55px] focus:outline-blue-500"
        placeholder="Поиск пользователей"
      />
      <SearchViewData data={data} />
    </div>
  );
}
