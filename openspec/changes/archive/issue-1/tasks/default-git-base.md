# default-git-base

Scenarios:

- The pull-request base is the change diff base
- The remote default branch is the base when the pull-request base is absent
- A checkout with no origin/master finishes the coverage check

## Сделать

Реализовать выбор базы change diff по `design.md` (Technical prerequisites, первый пункт): база PR через `GITHUB_BASE_REF` и refs в checkout (`origin/<name>`, иначе `<name>`); иначе revision из `refs/remotes/origin/HEAD`; без fetch. Сравнение этой revision с `HEAD`. Если revision отсутствует — не запускать diff против missing revision; проверка завершается без `fatal: bad revision 'origin/master...HEAD'`.

Файлы: `src/run.ts`, `src/tree.ts`, `src/registration.spec.ts` (блок `default-git-base` под delta requirement «The package chooses the change diff base»).

Не менять README. Не трогать блок `caller-git-base` в `src/registration.spec.ts` (его обновит следующая задача). Не архивировать openspec и не менять delta spec.

## Доказательство

Тест на границе проверки coverage (`design.md`, Verification boundary): имя каждого теста содержит заголовок Scenario; тест видит, какую базу diff сравнивает с `HEAD`, и завершается ли проверка без fatal при отсутствии `origin/master`. Читать только перечисленные файлы и vitest/wrap helpers, уже импортируемые в `src/registration.spec.ts`.

`pnpm run test:units:fast`, `pnpm run test:types`.
