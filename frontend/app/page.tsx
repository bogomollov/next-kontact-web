import Image from "next/image";
import Link from "next/link";
import FAQ from "@/features/home/components/FAQ";
import API from "@/features/home/components/API";
import imageLoader from "@/lib/imageLoader";
import FEATURES from "@/features/home/components/FEATURES";

export default function Home() {
  return (
    <>
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-2.5 sm:px-5">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="text-2xl md:text-[24px]">контакт</div>
            <div className="rounded-[5px] bg-neutral-200 px-[6px] text-sm text-neutral-500 md:text-base">
              веб
            </div>
          </Link>
          <nav className="hidden items-center space-x-4 text-neutral-500 *:hover:text-neutral-950 sm:flex sm:space-x-6">
            <Link href="#features">Функции</Link>
            <Link href="#faq">Вопросы и ответы</Link>
            <Link href="#api">API</Link>
          </nav>
          <Link
            href="/login"
            className="inline-flex rounded-md bg-blue-500 px-3 py-1.5 text-white hover:bg-blue-600 max-sm:text-sm sm:px-4 sm:py-2"
          >
            Начать общение
          </Link>
        </div>
      </header>
      <main>
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 rounded-[12px] px-4 py-8 sm:gap-[30px] sm:px-5 sm:py-[50px]">
          <div className="mx-auto flex flex-col items-center gap-3 text-center sm:gap-[20px]">
            <h1>Современный корпоративный мессенджер</h1>
            <h4 className="text-neutral-500">Быстрый. Надежный. Простой.</h4>
          </div>
          <div className="w-full px-2 sm:px-0">
            <Image
              loader={imageLoader}
              src="/preview.webp"
              alt="preview-app"
              priority
              width={1920}
              height={1080}
              sizes="(max-width: 640px) 95vw, (max-width: 768px) 90vw, 100vw"
              className="w-full"
              style={{
                borderRadius: "12px",
                border: "1px solid #D4D4D4",
              }}
            />
          </div>
        </div>
        <div className="container mx-auto mb-8 flex flex-col justify-between gap-8 px-4 sm:mb-[70px] sm:gap-[70px] sm:px-5">
          <FEATURES />
          <API />
          <FAQ />
        </div>
      </main>
    </>
  );
}
