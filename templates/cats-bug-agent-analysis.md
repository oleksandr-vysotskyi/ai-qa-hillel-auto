# Cats bug agent analysis

- Defect: `<одне речення — підтверджений дефект>`
- Training app: `https://kitties.students.hillel.it/`
- Jira project key: `<PROJECT_KEY>`
- Jira API: `rest/api/2/issue` (Data Center v10005)
- Defect report standard: ISTQB (`Steps to Reproduce` / `Actual Result` / `Expected Result`)
- Browsers confirmed: Firefox, Chrome

## 1. Preview (redacted)

```json
<redacted payload без PAT/cookie/пароля>
```

- Destination (`project.key`, `issuetype`): 
- `description` структурований за ISTQB (Steps to Reproduce / Actual Result / Expected Result): `так` / `ні`
- `environment` вказує Firefox і Chrome: `так` / `ні`
- Поля перевірені людиною: 
- Секрети відсутні: `так` / `ні`

## 2. Create receipt

- Command: `<точна curl-команда зі змінними, без значень>`
- Timestamp: `<ISO 8601>`
- Response (redacted): `id=`, `key=`, `self=`

## 3. Read (redacted)

- Command: `<точна curl-команда зі змінними, без значень>`
- Response (redacted), лише потрібні поля:

```json
<redacted response>
```

## 4. Таблиця повноти (6 полів)

| Поле | У payload/response | Присутнє | Коментар |
|---|---|---|---|
| key | | | |
| summary | | | |
| description | | | |
| environment | | | |
| issuetype.name | | | |
| status.name / project.key | | | |

## 5. Звірка з вимогами за ID

| Requirement ID | Очікування | Факт з GET | Збіг |
|---|---|---|---|
| | | | |

## 6. Screenshot / attachment

- Статус: `MISSING` / `посилання: <...>`

## FACTS / ASSUMPTIONS / QUESTIONS / RISKS

- FACTS:
- ASSUMPTIONS:
- QUESTIONS:
- RISKS:

## Дві власні перевірки тверджень агента

1. Твердження агента: `<...>` → Перевірка людини: `<як перевірено, результат>`
2. Твердження агента: `<...>` → Перевірка людини: `<як перевірено, результат>`

## Рішення

- DECISION: `ACCEPT` / `STOP` — `<обґрунтування>`
