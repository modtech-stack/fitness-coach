# AI Fitness Trainer

AI Fitness Trainer — система управления персональным тренировочным процессом. Она помогает собрать контекст пользователя, сформировать проверяемую программу и в следующих этапах адаптировать нагрузку на основе прозрачных правил.

## Текущий статус

**Stage 1 — Domain Foundation.**

Реализованы:

- Next.js 16 и TypeScript;
- Supabase PostgreSQL, Auth и локальные миграции;
- сущности `profiles`, `goals`, `constraints`;
- Row Level Security для изоляции данных пользователей;
- onboarding `регистрация → профиль → цель → ограничения`;
- unit-тесты доменной валидации и pgTAP-тесты схемы/RLS.

Пока не реализованы GPT Program Builder, OpenAI API, Training Engine, Polar и расширенная аналитика.

## Технологии

- Next.js App Router;
- React и TypeScript;
- Supabase PostgreSQL + Auth + RLS;
- Tailwind CSS;
- Zod;
- Vitest и pgTAP.

Требуется Node.js 20.9 или новее. Для локального Supabase нужен Docker-совместимый runtime.

## Локальный запуск

1. Установите зависимости:

   ```bash
   pnpm install
   ```

2. Запустите локальный Supabase:

   ```bash
   pnpm db:start
   ```

3. Создайте локальный env-файл:

   ```bash
   cp .env.example .env.local
   ```

   Значения URL и publishable key возьмите из:

   ```bash
   pnpm exec supabase status -o env
   ```

4. Примените миграции с чистого состояния:

   ```bash
   pnpm db:reset
   ```

5. Запустите приложение:

   ```bash
   pnpm dev
   ```

   Откройте [http://localhost:3000](http://localhost:3000).

Локальная конфигурация отключает обязательное подтверждение email. В hosted Supabase приложение корректно обрабатывает сценарий, когда сначала нужно подтвердить адрес.

## Проверки

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm db:test
```

`pnpm db:test` требует запущенный локальный Supabase и проверяет:

- создание тестовых пользователей;
- сохранение профиля, цели и ограничения;
- изменение собственных данных;
- невозможность пользователя A увидеть данные пользователя B.

## Подключение hosted Supabase

После создания отдельного dev-проекта:

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref <project-ref>
pnpm exec supabase db push --dry-run
pnpm exec supabase db push
```

Секреты и реальные пользовательские данные не добавляются в Git.

## Структура

```text
.
├── src/
│   ├── app/                  # страницы и маршруты App Router
│   ├── features/
│   │   ├── auth/             # регистрация и вход
│   │   └── onboarding/       # профиль, цели, ограничения
│   ├── lib/
│   │   ├── auth/
│   │   └── supabase/         # browser/server/proxy clients
│   ├── types/
│   └── proxy.ts              # обновление Auth-сессии
├── supabase/
│   ├── migrations/           # версионируемая схема PostgreSQL
│   ├── tests/database/       # pgTAP и RLS
│   ├── config.toml
│   └── seed.sql
├── docs/                     # продуктовые и архитектурные документы
├── knowledge/                # принципы Training Engine
└── profiles/examples/        # только синтетические профили
```

## Порядок чтения документации

1. [Project Rules](docs/00_project_rules.md)
2. [Product Vision](docs/01_product_vision.md)
3. [Core Model](docs/02_core_model.md)
4. [MVP Specification](docs/03_mvp_specification.md)
5. [Architecture Decisions](docs/DECISIONS.md)
6. [Database Schema](docs/04_database_schema.md)
7. [Implementation Plan](docs/08_implementation_plan.md)
8. [Training Engine Principles](knowledge/training/training_engine_principles_v0.9.md)

Ветка `main` является единственным источником актуальной документации. Реальные медицинские, биометрические, контактные и другие конфиденциальные данные в репозитории не хранятся.
