<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Обязательный review workflow

Для каждой продуктовой задачи, начиная со следующих этапов разработки, применяй
последовательность независимых ролей:

`Implementer → Functional QA Reviewer → UX Reviewer → Code Reviewer`.

Одна роль не заменяет другую. Implementer выполняет self-review, но не принимает
окончательное решение о готовности собственной работы. Каждую review-роль выполняет
отдельный агент: он не участвовал в реализации проверяемого изменения и не совмещает
две review-роли в одной проверке.

## Implementer

- реализует изменение, миграции и тесты;
- выполняет `typecheck`, `lint`, unit tests, database/RLS tests и production build;
- фиксирует, что именно удалось и не удалось проверить.

## Functional QA Reviewer

После Implementer проверяет acceptance-сценарии в работающем приложении:

- выполняет пользовательские действия через UI;
- проверяет результат после перезагрузки;
- проверяет реальные интеграции, включая Supabase, формы и server actions;
- когда релевантно, сверяет фактическое состояние Supabase;
- проверяет ошибки, негативные сценарии, desktop и mobile;
- для функций, зависящих от облачной инфраструктуры, по возможности проверяет
  Vercel Preview с hosted development Supabase.

Локальные unit-тесты не заменяют такую проверку. Разрушительные сценарии нельзя
проверять на production-данных. Если ключевой acceptance-сценарий не выполнен
реально, это blocker, а задача не считается полностью проверенной.

## UX Reviewer

После Functional QA оценивает работающий интерфейс глазами нового пользователя,
не опираясь на устройство кода или базы. Проверяет следующее действие, визуальную
иерархию, навигацию, формы, пользовательский язык, validation/error/success и empty
states, discoverability, редактирование, когнитивную нагрузку, desktop, mobile и
длинный контент.

Каждое замечание классифицируется как `BLOCKER`, `MAJOR` или `MINOR`. Все `BLOCKER`
и `MAJOR` должны быть исправлены Implementer и повторно проверены Functional QA до
handoff владельцу. UX Reviewer не расширяет scope продукта без обоснования.

## Code Reviewer

После Functional QA и UX review независимо проверяет архитектуру, соответствие
задаче, регрессии, безопасность, RLS, server/client boundaries, migration safety,
обработку ошибок, секреты, тестовое покрытие и ненужное усложнение. Если доступен
GitHub Codex Review, дополнительно запроси его для PR.

## Quality Gate и handoff

Перед передачей владельцу обязательны:

- TypeScript, ESLint, unit tests, database/RLS tests и production build — `PASS`;
- миграции проверены;
- основные acceptance-сценарии реально пройдены, включая persistence;
- UX review выполнен, `BLOCKER = 0`, `MAJOR = 0`;
- code review не содержит открытых критических замечаний.

При замечании цикл выглядит так:

`review → Implementer fixes → relevant tests → Functional QA repeat → reviewer repeat`.

После трёх циклов с сохраняющимся blocker остановись и сообщи владельцу причину.
Итоговый handoff должен содержать разделы `Implementation`, `Automated checks`,
`Functional QA`, `Environment`, `UX Review`, `Code Review`, `Not tested`,
`Known issues` и `Verdict`. Допустимые verdict: `READY FOR OWNER REVIEW` или
`NOT READY`. Запрещено писать `READY FOR OWNER REVIEW`, если ключевая функция не
была реально проверена через UI.

Подробное описание процесса находится в
[`docs/06_codex_instructions.md`](docs/06_codex_instructions.md).
