# readme-git-base

Anchor: `design.md` → Technical prerequisites — README no longer tells a caller to set `SPEC_COVERAGE_BASE` or that the default is `origin/master`.

## Сделать

Обновить `README.md`: убрать документирование `SPEC_COVERAGE_BASE` как базы change diff и умолчания `origin/master`; кратко описать, что базу выбирает пакет (база PR, затем remote default branch). `SPEC_COVERAGE_DIR` можно оставить.

Файлы: `README.md`, `src/readme.spec.ts` (новый тест, что README не обещает caller-controlled base).

Не менять `src/run.ts`, `src/tree.ts`, сценарные тесты git base.

## Доказательство

Тест в `src/readme.spec.ts` читает `README.md` и проверяет отсутствие инструкции задавать `SPEC_COVERAGE_BASE` для базы diff и отсутствие утверждения, что default — `origin/master`.

`pnpm run test:units:fast`, `pnpm run test:types`.
