import Image from "next/image";

import { ZODIAC_IMAGE_CACHE_REVISION } from "@/constants/zodiacAssets";
import { ZODIAC_SIGNS } from "@/data/zodiac";

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-b from-amber-50 via-stone-50 to-amber-100/80 text-stone-900 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 dark:text-stone-100">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10 text-center lg:mb-12">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-amber-800/80 dark:text-amber-200/80">
            Coffee Horoscope
          </p>
          <h1 className="text-balance font-serif text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 sm:text-5xl">
            Кофейный гороскоп
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-stone-600 dark:text-stone-400">
            Двенадцать знаков — двенадцать напитков и коротких подсказок на день.
          </p>
        </header>

        <nav
          className="sticky top-0 z-20 -mx-4 mb-10 border-b border-amber-200/70 bg-amber-50/95 px-4 py-3 shadow-sm backdrop-blur-md dark:border-stone-700 dark:bg-stone-950/95 sm:-mx-6 sm:px-6"
          aria-label="Навигация по знакам зодиака"
        >
          <div className="mx-auto max-w-5xl">
            <p className="mb-3 text-center text-sm font-medium text-stone-600 dark:text-stone-400">
              Выберите ваш знак
            </p>
            <div className="grid grid-cols-6 grid-rows-2 gap-1.5">
              {ZODIAC_SIGNS.map((sign) => (
                <a
                  key={sign.id}
                  href={`#${sign.id}`}
                  title={sign.name}
                  className="flex min-h-[3.4rem] flex-col items-center justify-center gap-0.5 rounded-md border border-amber-200/90 bg-white/90 px-px py-1.5 text-center text-[8px] font-medium leading-tight text-stone-800 shadow-sm transition hover:border-amber-400 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 sm:min-h-[4rem] sm:text-[10px] dark:border-stone-600 dark:bg-stone-900/90 dark:text-stone-100 dark:hover:border-amber-500/80 dark:hover:bg-stone-900"
                >
                  <span aria-hidden className="select-none text-xl leading-none sm:text-2xl">
                    {sign.symbol}
                  </span>
                  <span className="line-clamp-2 w-full break-words hyphens-auto">
                    {sign.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </nav>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ZODIAC_SIGNS.map((sign) => (
            <li key={sign.id}>
              <article
                id={sign.id}
                className="scroll-mt-40 flex h-full flex-col rounded-2xl border border-amber-200/60 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-shadow duration-300 target:border-amber-400 target:shadow-[0_0_0_3px_rgba(217,119,6,0.35)] dark:border-stone-700 dark:bg-stone-900/80 dark:target:border-amber-500/70 dark:target:shadow-[0_0_0_3px_rgba(245,158,11,0.25)]"
              >
                <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-amber-100/40 dark:bg-stone-800/60">
                  <Image
                    src={`/images/zodiac/zodiac-${sign.id}.png?v=${ZODIAC_IMAGE_CACHE_REVISION}`}
                    alt={`Иллюстрация: ${sign.name} и кофе`}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={sign.id === "aries"}
                  />
                </div>
                <div className="mb-4 flex items-baseline justify-between gap-2">
                  <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
                    <span className="mr-2 text-2xl" aria-hidden>
                      {sign.symbol}
                    </span>
                    {sign.name}
                  </h2>
                </div>
                <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
                  {sign.dateRange}
                </p>
                <div className="space-y-3 text-sm leading-relaxed">
                  <div>
                    <p className="mb-1 font-medium text-amber-900 dark:text-amber-200">
                      Напиток
                    </p>
                    <p className="text-stone-700 dark:text-stone-300">{sign.coffeePick}</p>
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-amber-900 dark:text-amber-200">
                      На день
                    </p>
                    <p className="text-stone-600 dark:text-stone-400">{sign.reading}</p>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
