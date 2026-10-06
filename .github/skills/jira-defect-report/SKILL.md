---
name: jira-defect-report
description: 'Domain knowledge for creating and verifying a single Jira Data Center bug report via REST API v10005 for the training cats app (kitties.students.hillel.it). Use when previewing a Jira Bug payload, calling POST /rest/api/2/issue or GET /rest/api/2/issue/{key}, redacting Jira auth/secrets from evidence, or filling cats-bug-agent-analysis.md.'
---

# Jira Bug Report (Data Center REST API)

## Коли використовувати

- Потрібно підготувати preview одного Jira Bug для навчального Jira Data
  Center проєкту.
- Потрібно виконати `POST`/`GET` до `rest/api/2/issue` і звірити поля.
- Потрібно заповнити `cats-bug-agent-analysis.md` без витоку секретів.

Джерело API: https://developer.atlassian.com/server/jira/platform/rest/v10005/api-group-issue/

## Структура дефект-репорту (ISTQB)

`description` обов'язко містить секції ISTQB defect report, кожна з власним Jira wiki-заголовком (`h3.`) і реальними переносами рядків (`\n`), не одним суцільним реченням:

1. `Steps to Reproduce` — нумеровані кроки;
2. `Actual Result` — що фактично відбулося;
3. `Expected Result` — що має бути за вимогою.

`environment` обов'язко фіксує браузери, на яких підтверджено дефект: **Firefox і Chrome**. Якщо дефект відтворено
лише в одному з них — зафіксуй це явно в `environment`, не позначай обидва браузери як підтверджені.

## Обов'язкові параметри (приходять від людини, не вигадуються)

| Параметр | Приклад | Джерело |
|---|---|---|
| `JIRA_BASE_URL` | `https://jira.example.internal` | `.env` (копія `.env.example`), надається людиною |
| `JIRA_PROJECT_KEY` | `CATS` | `.env`, навчальний Jira-проєкт |
| `JIRA_PAT` | — | `.env`, людина вставляє значення сама, ніколи не в чат |
| `issuetype` | `Bug` | фіксоване значення для цього завдання |

`.env` і каталог `jira/` (payload/response файли) вже в `.gitignore`. Якщо
параметр відсутній — зафіксуй `QUESTION`, не підставляй вигадані значення.

## Безпечний канал: scripts/jira-request.mjs

Усі виклики до Jira йдуть **лише** через [scripts/jira-request.mjs](../../../scripts/jira-request.mjs),
а не напряму через `curl`. Скрипт сам читає `.env`, підставляє
`Authorization: Bearer` і ніколи не друкує токен чи заголовок. `create`/`read`
повертають лише дозволені поля в термінал; повний raw response лягає у
`jira/create-response.json` / `jira/read-response.json` (gitignored, не
вставляти в evidence цілком).

## Payload для preview (крок 1)

```bash
npm run jira -- preview \
  --summary "<короткий опис дефекту>" \
  --description "h3. Steps to Reproduce\n# ...\n\nh3. Actual Result\n...\n\nh3. Expected Result\n..." \
  --environment "<ОС>, Firefox, Chrome, URL застосунку котиків"
```

Скрипт бере `JIRA_PROJECT_KEY` з `.env`, фіксує `issuetype: Bug` і записує
`jira/issue-payload.json`, роздруковуючи той самий JSON у термінал:

```json
{
  "fields": {
    "project": { "key": "<PROJECT_KEY>" },
    "summary": "<короткий опис дефекту>",
    "issuetype": { "name": "Bug" },
    "description": "h3. Steps to Reproduce\n# ...\n\nh3. Actual Result\n...\n\nh3. Expected Result\n...",
    "environment": "<ОС>, Firefox, Chrome, URL застосунку котиків"
  }
}
```

Покажи цей payload людині дослівно перед `APPROVE`. Перевір разом з людиною:
- destination (`project.key`) відповідає навчальному проєкту;
- `issuetype` = `Bug`;
- `description` має структуру ISTQB (Steps to Reproduce / Actual Result / Expected Result) з реальними `\n`, а не одним реченням;
- `environment` зазначає обидва підтверджені браузери (Firefox, Chrome), якщо дефект перевірено в обох;
- `description`/`environment` не містять PAT, cookie, паролів чи
  внутрішніх URL із credentials;
- опис дефекту точний і не розширює вимогу.

## POST (крок 2, лише після `APPROVE`)

```bash
npm run jira -- create --payload jira/issue-payload.json
```

- Скрипт сам додає `Authorization: Bearer` з `.env`; ти не бачиш і не
  друкуєш значення токена.
- У термінал і в evidence потрапляють лише `id`, `key`, `self`.
- `401`/`403`/`404` чи мережевий блок → скрипт завершується з `BLOCKER: ...`;
  зафіксуй це як blocker, не повторюй `create` без нового дозволу і не
  вигадуй receipt.

## GET (крок 3, рівно один раз)

```bash
npm run jira -- read --key <ISSUE_KEY>
```

Скрипт друкує лише шість дозволених полів (redacted), повний response
зберігає в `jira/read-response.json` (gitignored).

### Шість полів для звірки з вимогами за ID

1. `key`
2. `fields.summary`
3. `fields.description`
4. `fields.environment`
5. `fields.issuetype.name`
6. `fields.status.name` (або `fields.project.key`, якщо саме destination —
   предмет перевірки за вимогою)

Для кожного поля зафіксуй: очікування з вимоги (за ID), фактичне значення з
GET, збіг/розбіжність.

## Redaction-правила для evidence

- Ніколи не копіюй `Authorization`, PAT, cookie, пароль чи повний приватний
  response у чат, terminal output чи `cats-bug-agent-analysis.md`.
- У redacted evidence залишай лише ті поля payload/response, які потрібні
  для перевірки (`summary`, `description`, `environment`, `issuetype`,
  `key`, `id`, `self`, `status`).
- Якщо response містить чутливі поля (наприклад `reporter.emailAddress`
  внутрішніх людей) — заміни на `[REDACTED]`, не видаляй структуру поля.
- Ніколи не вставляй у evidence вміст `jira/create-response.json` чи
  `jira/read-response.json` цілком — лише те, що скрипт вивів у термінал.

## Output

Заповни [templates/cats-bug-agent-analysis.md](../../../templates/cats-bug-agent-analysis.md)
redacted evidence для preview/create/read, create receipt, таблицею
повноти (6 полів), таблицею звірки з вимогами за ID, `FACTS`/`ASSUMPTIONS`/
`QUESTIONS`/`RISKS` і двома власними перевірками тверджень агента.
