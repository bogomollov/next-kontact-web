"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";

interface FAQ {
  question: string;
  answer: string;
}

const faq: FAQ[] = [
  {
    question: "Как создать новый чат?",
    answer: "Найдите коллегу через поиск и нажмите на него",
  },
  {
    question: "Как редактировать данные профиля?",
    answer:
      "На главной странице чата рядом с кнопкой выхода нажмите на значок шестеренки",
  },
  {
    question: "Можно ли добавлять эмодзи в сообщения?",
    answer: "Да, вы можете использовать смайлики, нажав на значок в поле ввода",
  },
];

export default function FAQ() {
  const [currentIndex, setIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="mx-auto flex w-full flex-col items-center gap-6 rounded-lg px-4 sm:max-w-[585px] sm:gap-[35px] sm:px-0"
    >
      <div className="flex w-full flex-col gap-2 text-center sm:gap-[10px]">
        <h2>Часто задаваемые вопросы</h2>
        <h4 className="text-neutral-500">
          Найдите ответы на интересующие вопросы
        </h4>
      </div>
      <div className="w-full rounded-lg border">
        {faq.map((item, index) => (
          <div key={index}>
            <Button
              className={`w-full justify-start px-3 py-2 text-left text-base text-neutral-950 focus:ring-0 focus:outline-none max-sm:text-sm sm:px-3.5 sm:py-2.5 sm:text-lg ${
                index !== faq.length - 1 || currentIndex === faq.length - 1
                  ? "border-b"
                  : ""
              }`}
              onClick={() => setIndex(currentIndex === index ? null : index)}
            >
              {item.question}
            </Button>
            {currentIndex === index && (
              <p className="px-3 py-2 text-sm text-neutral-500 sm:px-3.5 sm:py-2.5 sm:text-base">
                {item.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
