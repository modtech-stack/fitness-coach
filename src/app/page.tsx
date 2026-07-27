import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-10">
        <header className="flex items-center justify-between">
          <span className="text-sm font-bold tracking-[0.18em] text-teal-300 uppercase">
            AI Fitness Trainer
          </span>
          <Link
            className="text-sm font-semibold text-slate-200 hover:text-white"
            href="/sign-in"
          >
            Войти
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-5 text-sm font-semibold text-teal-300">
              Domain Foundation · MVP
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              Начните с профиля, цели и реальных ограничений.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Первый рабочий контур AI Fitness Trainer сохраняет ваш
              базовый контекст и защищает его на уровне базы данных.
              Генерация программ и автоматическая адаптация появятся на
              следующих этапах.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                className="primary-button justify-center"
                href="/sign-up"
              >
                Создать аккаунт
              </Link>
              <Link
                className="secondary-button border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
                href="/sign-in"
              >
                Продолжить onboarding
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-7 shadow-2xl shadow-teal-950/30">
            <p className="text-xs font-bold tracking-[0.16em] text-teal-300 uppercase">
              Что доступно сейчас
            </p>
            <ol className="mt-6 space-y-5">
              {[
                ["01", "Регистрация", "Защищённая сессия Supabase Auth"],
                ["02", "Профиль", "Рост, вес, опыт и уровень активности"],
                ["03", "Цель", "Тип, описание и приоритет"],
                [
                  "04",
                  "Ограничения",
                  "Только ваши записи, изолированные RLS",
                ],
              ].map(([number, title, description]) => (
                <li className="flex gap-4" key={number}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-400/10 text-sm font-bold text-teal-300">
                    {number}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}
