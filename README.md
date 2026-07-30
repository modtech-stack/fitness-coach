# AI Fitness Trainer

AI Fitness Trainer — система управления персональным тренировочным процессом. Она собирает контекст пользователя, а на следующих этапах будет помогать создавать проверяемые программы и адаптировать нагрузку на основе прозрачных правил.

## Текущий статус

**Stage 1.5 — исправления после первого пользовательского тестирования.**

Реализованы:

- Next.js 16, TypeScript и Supabase Auth;
- PostgreSQL-миграции для `profiles`, `goals`, `constraints`;
- Row Level Security для изоляции данных пользователей;
- регистрация и первичная настройка профиля;
- редактирование профиля;
- создание, изменение и удаление целей и ограничений;
- одна активная основная цель и любое количество второстепенных;
- полное удаление собственной учётной записи и связанных данных;
- unit-тесты и pgTAP-тесты схемы/RLS.

Пока не реализованы построение тренировочных программ, OpenAI API, Training Engine, Polar и расширенная аналитика.

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

3. Создайте `.env.local` по образцу `.env.example`.

   URL и ключи локального проекта покажет команда:

   ```bash
   pnpm exec supabase status -o env
   ```

   Перенесите URL и публичный ключ в `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Server-only ключ с ролью `service_role` укажите в `SUPABASE_SERVICE_ROLE_KEY`. Не добавляйте `.env.local` в Git.

4. Примените миграции с чистого состояния:

   ```bash
   pnpm db:reset
   ```

5. Запустите приложение:

   ```bash
   pnpm dev
   ```

   Откройте [http://localhost:3000](http://localhost:3000).

Локальная конфигурация отключает обязательное подтверждение email. В hosted Supabase пользователь сначала подтверждает адрес по ссылке из письма.

## Проверки

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm db:test
```

`pnpm db:test` требует запущенный локальный Supabase. Тесты проверяют CRUD собственных данных, запрет изменения чужих записей, единственность активной основной цели, каскадное удаление данных и сохранение RLS.

## Публикация через hosted Supabase и Vercel

### 1. Подготовить Supabase

1. Создайте отдельный проект в Supabase и сохраните его Project URL, publishable key и server-only `service_role` key.
2. Авторизуйте CLI и привяжите репозиторий к проекту:

   ```bash
   pnpm exec supabase login
   pnpm exec supabase link --project-ref <project-ref>
   ```

3. Сначала проверьте список миграций, затем примените их:

   ```bash
   pnpm exec supabase db push --dry-run
   pnpm exec supabase db push
   ```

Не применяйте рабочие миграции вручную через SQL Editor: история схемы должна оставаться воспроизводимой. Подробнее — в [документации Supabase о миграциях](https://supabase.com/docs/guides/deployment/database-migrations).

### 2. Импортировать GitHub-репозиторий в Vercel

1. В Vercel выберите **Add New → Project** и импортируйте `modtech-stack/fitness-coach` из GitHub.
2. Оставьте Framework Preset `Next.js` и корневой каталог репозитория.
3. Добавьте переменные окружения:

   | Переменная | Откуда взять | Область |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Production и Preview |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key | Production и Preview |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase `service_role` key | Production и Preview, только server-side |
   | `NEXT_PUBLIC_SITE_URL` | точный production URL с `https://` | только Production |

Для Preview не задавайте `NEXT_PUBLIC_SITE_URL`: сервер использует системный `VERCEL_URL` текущего deployment. После изменения env-переменных запустите новый deployment. Vercel создаёт Preview для веток/PR и Production для production-ветки; подробнее — в [официальной инструкции Vercel](https://vercel.com/docs/git).

Никогда не добавляйте `service_role` key в переменную с префиксом `NEXT_PUBLIC_`, клиентский код, GitHub, README или логи.

### 3. Настроить Supabase Auth URL Configuration

В Supabase откройте **Authentication → URL Configuration**:

- **Site URL:** точный production URL, например `https://<production-domain>`;
- **Redirect URLs:**
  - `https://<production-domain>/auth/confirm`;
  - `http://localhost:3000/**`;
  - `https://*-<team-or-account-slug>.vercel.app/**` для Vercel Preview.

Для production используйте точный callback, а wildcard оставляйте только для локальной разработки и Preview. Формат Vercel wildcard приведён в [документации Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

### 4. Проверить опубликованное приложение

1. Откройте production или Preview URL в приватном окне.
2. Создайте новый тестовый аккаунт с доступным email.
3. Убедитесь, что письмо подтверждения ведёт на `/auth/confirm`, после чего открывается первичная настройка.
4. Заполните профиль, цель и ограничения; выйдите и войдите снова.
5. Проверьте редактирование/удаление записей и полное удаление отдельного тестового аккаунта.
6. После удаления убедитесь, что прежние данные отсутствуют и повторный вход не выполняется.

## Структура

```text
.
├── src/
│   ├── app/                  # страницы и маршруты App Router
│   ├── features/
│   │   ├── account/          # полное удаление аккаунта
│   │   ├── auth/             # регистрация и вход
│   │   ├── home/             # состояния публичной главной
│   │   └── onboarding/       # профиль, цели, ограничения
│   ├── lib/
│   │   ├── auth/
│   │   └── supabase/         # browser/server/admin/proxy clients
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
