"use client";
import { useState, useCallback } from "react";
import Table from "@/components/ui/Table";
import { apiFetch } from "@/lib/apiFetch";
import { ApiResponse } from "@/types";
import Button from "@/components/ui/Button";

export default function API() {
  const [response, setResponse] = useState<ApiResponse>({});
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/users/search?query=Виктор", {
        credentials: "include",
      });
      const data = await res.json();
      setResponse({ data, status: res.status });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <section
      id="api"
      className="mx-auto flex w-full flex-col items-center justify-between gap-6 lg:flex-row lg:items-start lg:gap-0"
    >
      <div className="flex w-full flex-col items-start gap-6 lg:w-auto lg:gap-9">
        <div className="flex flex-col gap-3 lg:gap-4">
          <h2>Взаимодействие через сеть</h2>
          <h4 className="text-neutral-500">
            Используйте API для автоматизации задач
          </h4>
        </div>
        <Button
          onClick={fetchData}
          disabled={loading}
          className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50 max-sm:text-sm sm:w-auto"
        >
          {loading ? "Получение ответа..." : "Отправить запрос"}
        </Button>
      </div>
      <div className="w-full lg:w-auto">
        <Table
          method="GET"
          url="/api/users/search"
          description="поиск сотрудника"
          body={
            <div className="space-y-1 text-sm sm:text-base">
              <span className="text-blue-500">
                GET /api/users?query=Виктор HTTP/1.1
              </span>
              <div className="flex flex-wrap gap-1 sm:gap-[8px]">
                Authorization:
                <span className="text-blue-500">Bearer ******************</span>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-[8px]">
                Content-Type:
                <span className="text-blue-500">
                  application/json; charset=utf-8
                </span>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-[8px]">
                Connection: <span className="text-blue-500">close</span>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-[8px]">
                User-Agent:
                <span className="text-blue-500">
                  Mozilla/5.0 (Windows NT 10.0; Win64; x64)
                </span>
              </div>
            </div>
          }
          status_response={response.status}
          type_response="body"
          description_response="ответ сервера"
          body_response={
            response.error ??
            (response.data ? JSON.stringify(response.data, null, 2) : null)
          }
        />
      </div>
    </section>
  );
}
