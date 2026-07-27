# AI Fitness Trainer

AI Fitness Trainer — система управления персональным тренировочным процессом. Она помогает сформировать проверяемую программу, выполнить запланированную тренировку и адаптировать нагрузку на основе состояния пользователя.

Критические решения принимает прозрачный Training Engine. AI используется для создания черновика программы и объяснения решений, но не заменяет safety-правила и медицинского специалиста.

## Текущий статус

**Phase 0 — Product Architecture / Source of Truth Consolidation.**

Приложение ещё не реализовано. Next.js, Supabase и OpenAI API на этом этапе не подключены.

## Структура репозитория

```text
.
├── README.md
├── docs/
│   ├── 00_project_rules.md
│   ├── 01_product_vision.md
│   ├── 02_core_model.md
│   ├── 03_mvp_specification.md
│   ├── 04_database_schema.md
│   ├── 05_training_engine.md
│   ├── 06_codex_instructions.md
│   ├── 07_program_builder.md
│   ├── 08_implementation_plan.md
│   └── DECISIONS.md
├── knowledge/
│   └── training/
│       └── training_engine_principles_v0.9.md
└── profiles/
    └── examples/
        ├── boris.example.md
        └── alena.example.md
```

## Порядок чтения

1. [Project Rules](docs/00_project_rules.md)
2. [Product Vision](docs/01_product_vision.md)
3. [Core Model](docs/02_core_model.md)
4. [MVP Specification](docs/03_mvp_specification.md)
5. [Architecture Decisions](docs/DECISIONS.md)
6. [Training Engine Principles](knowledge/training/training_engine_principles_v0.9.md)
7. [GPT Program Builder](docs/07_program_builder.md)
8. [Database Schema](docs/04_database_schema.md)
9. [Training Engine Specification status](docs/05_training_engine.md)
10. [Implementation Plan](docs/08_implementation_plan.md)
11. [Codex Development Instructions](docs/06_codex_instructions.md)

## Источник истины

Ветка `main` является единственным источником актуальной документации. Тематические ветки могут использоваться только временно для подготовки изменений через Pull Request.

## Конфиденциальность

Реальные пользовательские, медицинские и биометрические данные не хранятся в репозитории. Файлы в [`profiles/examples/`](profiles/examples/) являются синтетическими примерами.
