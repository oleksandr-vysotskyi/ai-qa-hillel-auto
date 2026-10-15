# Cats bug agent analysis

- Defect: Форма оплати дозволяє натиснути «Оплатити» та завершити оплату без підтвердження чекбоксу Terms of Service.
- Training app: `https://kitties.students.hillel.it/`
- Jira project key: `AAQW`
- Jira API: `rest/api/2/issue` (Data Center v10005)
- Defect report standard: ISTQB (`Steps to Reproduce` / `Actual Result` / `Expected Result`)
- Browsers confirmed: Firefox, Chrome

## 1. Preview (redacted)

```json
{
  "fields": {
    "project": { "key": "AAQW" },
    "summary": "Форма оплати дозволяє натиснути «Оплатити» без підтвердження Terms of Service",
    "issuetype": { "name": "Bug" },
    "description": "Steps: 1) Перейти на https://kitties.students.hillel.it/ 2) Заповнити усі поля форми оплати 3) Не підтверджувати (не відмічати) чекбокс Terms of Service 4) Натиснути кнопку «Оплатити». Actual: Форма дозволяє натиснути «Оплатити» і завершити оплату без підтвердження Terms of Service. Expected: Кнопка «Оплатити» має бути неактивною (або оплата має блокуватись), доки користувач не підтвердить Terms of Service.",
    "environment": "https://kitties.students.hillel.it/ (браузер/ОС не вказані користувачем)"
  }
}
```

- Destination (`project.key`, `issuetype`): `AAQW`, `Bug` — підтверджено людиною перед `APPROVE`.
- Поля перевірені людиною: так (`APPROVE` отримано дослівно).
- Секрети відсутні: `так`

## 2. Create receipt

- Command: `npm run jira -- create --payload jira/issue-payload.json`
- Timestamp: 2026-10-06 (локальний час запуску команди)
- Response (redacted): `id=142678`, `key=AAQW-3`, `self=https://jira.ithillel.com/rest/api/2/issue/142678`

## 3. Read (redacted)

- Command: `npm run jira -- read --key AAQW-3`
- Response (redacted), лише потрібні поля:

```json
{
  "key": "AAQW-3",
  "summary": "Форма оплати дозволяє натиснути «Оплатити» без підтвердження Terms of Service",
  "description": "h3. Steps\n# Перейти на https://kitties.students.hillel.it/\n# Заповнити усі поля форми оплати\n# Не підтверджувати (не відмічати) чекбокс Terms of Service\n# Натиснути кнопку «Оплатити»\n\nh3. Actual\nФорма дозволяє натиснути «Оплатити» і завершити оплату без підтвердження Terms of Service.\n\nh3. Expected\nКнопка «Оплатити» має бути неактивною (або оплата має блокуватись), доки користувач не підтвердить Terms of Service.",
  "environment": "https://kitties.students.hillel.it/ (браузер/ОС не вказані користувачем)",
  "issuetype": "Bug",
  "status": "To Do"
}
```

## 3a. Correction: опис-форматування (update + re-read)

- Проблема: перша версія `description` була одним суцільним реченням без `\n` і без Jira wiki-розмітки → у Jira UI відображалась як суцільний текст без Steps/Actual/Expected.
- Fix command: `npm run jira -- update --key AAQW-3 --payload jira/issue-update.json` (`PUT`, 204 No Content).
- Verify command: `npm run jira -- read --key AAQW-3` (другий `GET`, виконаний після нового `APPROVE` людини саме на цю правку).
- Новий `description` використовує Jira wiki markup (`h3.` заголовки, нумерований список `#`, порожні рядки між секціями) — підтверджено в response вище.
- `APPROVE`: отримано окремим повідомленням людини перед `update`.

## 3b. Correction: ISTQB-заголовки та browser coverage (update + re-read)

- Проблема: заголовки `h3. Steps` / `h3. Actual` / `h3. Expected` не відповідали повним ISTQB-термінам; `environment` не вказував конкретних браузерів.
- Fix command 1: `npm run jira -- update --key AAQW-3 --payload jira/issue-update.json` (`PUT`) — перейменування заголовків на `Steps to Reproduce` / `Actual Result` / `Expected Result`.
- Fix command 2: ще один `npm run jira -- update --key AAQW-3 --payload jira/issue-update.json` (`PUT`) — `environment` оновлено на `https://kitties.students.hillel.it/ — підтверджено у Firefox і Chrome (ОС не вказана користувачем)`.
- Verify command: `npm run jira -- read --key AAQW-3` (`GET`) після кожної правки.
- Browser confirmation: людина підтвердила в чаті дослівно `обидва` (Firefox і Chrome) у відповідь на пряме уточнювальне питання — значення не вигадане.
- `APPROVE`: отримано окремим повідомленням людини перед обома `update`.

## 3c. Correction: OS (update + re-read)

- Додано ОС, на якій фактично знайдено дефект: `macOS` (зі слів людини в чаті).
- Fix command: `npm run jira -- update --key AAQW-3 --payload jira/issue-update.json` (`PUT`, 204 No Content) — `environment` оновлено на `https://kitties.students.hillel.it/ — macOS, підтверджено у Firefox і Chrome`.
- Verify command: `npm run jira -- read --key AAQW-3` (`GET`) — підтверджено в response.
- Дозвіл: пряма інструкція людини в чаті додати конкретне значення та оновити саме `AAQW-3`.

## 4. Таблиця повноти (6 полів)

| Поле | У payload/response | Присутнє | Коментар |
|---|---|---|---|
| key | `AAQW-3` | так | отримано з `create`/`read` |
| summary | збігається з payload | так | |
| description | збігається з payload | так | ISTQB-заголовки `Steps to Reproduce`/`Actual Result`/`Expected Result` |
| environment | `https://kitties.students.hillel.it/ — macOS, підтверджено у Firefox і Chrome` | так | ОС і браузери підтверджені людиною дослівно, не вигадано |
| issuetype.name | `Bug` | так | фіксоване значення скрипта |
| status.name | `To Do` | так | початковий статус нового issue |

## 5. Звірка з вимогами за ID

| Requirement ID | Очікування | Факт з GET | Збіг |
|---|---|---|---|
| Усна вимога людини (повідомлення в чаті, без формального Requirement ID у repo) | Кнопка «Оплатити» має бути неактивною/оплата заблокована без підтвердження Terms of Service | `summary`/`description` у GET дослівно відтворюють steps/actual/expected з підтвердженого дефекту | збіг |

## 6. Screenshot / attachment

- Статус: `MISSING`

## FACTS / ASSUMPTIONS / QUESTIONS / RISKS

- FACTS: Issue `AAQW-3` фактично створено в Jira Data Center (project `AAQW`, issuetype `Bug`, status `To Do`); GET підтверджує 6 полів без розбіжностей. Опис виправлено трьома `PUT` (кожен — після окремого `APPROVE`) і звірено повторними `GET`: спершу структура Jira wiki markup, потім повні ISTQB-заголовки та `environment` з Firefox/Chrome.
- ASSUMPTIONS: Вважаємо опис дефекту, наданий людиною в чаті, достатньо підтвердженим (явної формальної фіксації в `requirements/` немає, бо дефект стосується зовнішнього застосунку `kitties.students.hillel.it`, а не repo-специфічних requirement-файлів).
- QUESTIONS: ОС для поля `environment` досі не вказана користувачем — якщо потрібна точніша діагностика, варто донести це окремо.
- RISKS: Без прикріпленого screenshot/video evidence факт дефекту спирається лише на словесний опис людини; формальний Requirement ID відсутній, що ускладнює майбутню трасування issue до вимоги.

## Дві власні перевірки тверджень агента

1. Твердження агента: "Payload не містить секретів (PAT/cookie/пароль)" → Перевірка людини: переглянути JSON preview/read вище — присутні лише `summary`, `description`, `environment`, `project.key`, `issuetype`; жодних токенів чи заголовків авторизації.
2. Твердження агента: "Issue AAQW-3 реально створено, а не вигадано" → Перевірка людини: звірити `self`-посилання `https://jira.ithillel.com/rest/api/2/issue/142678` і `key=AAQW-3` безпосередньо в Jira UI навчального проєкту.

## Рішення

- DECISION: `ACCEPT` — людина підтвердила issue `AAQW-3` після звірки create/read receipt з вимогою.
