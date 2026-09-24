# caller-git-base

Scenarios:

- A set SPEC_COVERAGE_BASE is ignored
- A set SPEC_COVERAGE_BASE is ignored when origin/master is absent

## Сделать

Пакет не читает `SPEC_COVERAGE_BASE`; установленная переменная не выбирает базу (см. delta requirement «SPEC_COVERAGE_BASE does not select the base»). Логика выбора базы из задачи `default-git-base` сохраняется.

Файлы: `src/run.ts`, `src/registration.spec.ts` (блок `caller-git-base` под delta requirement «SPEC_COVERAGE_BASE does not select the base»).

Не менять README (задача `readme-git-base`). Не откатывать поведение default-git-base.

## Доказательство

Тест на границе проверки coverage: при установленном `SPEC_COVERAGE_BASE` база не равна значению переменной; второй сценарий — то же при отсутствующем `origin/master`. Имена тестов содержат заголовки Scenario.

`pnpm run test:units:fast`, `pnpm run test:types`.
