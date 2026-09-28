# Guest adds a car (Audi TT)

## Перевірені факти (агент-планувальник, дослідницький прохід)

- FACT: після `Guest log in` користувач потрапляє на URL, що містить `/panel/garage`, і бачить `heading "Garage"`.
- FACT: `button "Add car"` відкриває діалог із заголовком `heading "Add a car"` (рівень 4) — назва діалогу відрізняється від назви кнопки.
- FACT: поле Brand — `combobox "Brand"`; підтверджені опції: `Audi`, `BMW`, `Ford`, `Porsche`, `Fiat`.
- FACT: поле Model — `combobox "Model"`, залежить від Brand; для Brand=`Audi` підтверджена опція `TT`.
- FACT: поле Mileage — `spinbutton "Mileage"`.
- FACT: кнопка збереження форми має accessible name `Add` (вимога описує дію як "Save the form", у UI кнопка називається інакше).
- FACT: `button "Add"` неактивна, доки поле Mileage порожнє.
- FACT: після збереження показується текст `"Car added"`, а в списку Garage з'являється елемент з `paragraph "Audi TT"`.
- ASSUMPTION: Brand=`Audi` і Model=`TT` можуть бути обрані за замовчуванням у порожньому гостьовому Garage; тест має явно обирати обидва значення, а не покладатися на дефолтний стан.
- RISK: точні `data-testid`/CSS-класи не перевірені (аналізувалося лише accessibility-дерево); перед написанням теста локатори треба звірити через Playwright CLI (`generate-locator`), а не MCP browser-сесію.

## Сценарій тесту

1. Відкрити застосунок за `baseURL` і натиснути `Guest log in`.
2. Перевірити, що URL містить `/panel/garage` і видимий `heading "Garage"`.
3. Натиснути `button "Add car"`.
4. У діалозі `heading "Add a car"` обрати в `combobox "Brand"` значення `Audi`.
5. Обрати в `combobox "Model"` значення `TT`.
6. Ввести в `spinbutton "Mileage"` значення `12000`.
7. Натиснути `button "Add"`.
8. Перевірити, що URL містить `/panel/garage`.
9. Перевірити, що в Garage відображається `paragraph "Audi TT"`.

## Межі

- Один UI-тест у Chromium.
- Вхід через `Guest log in` — підготовчий крок, не окрема перевірка.
- Перевіряються два результати: URL Garage і видимий текст `Audi TT` у списку автомобілів.
- Не перевіряється Update mileage, Add fuel expense чи видалення автомобіля — це поза межами вимоги.
- Якщо реальний UI відрізняється від фактів нижче (наприклад, немає дефолтного вибору Brand/Model), тест має явно обирати `Audi`/`TT` і не покладатися на попередній стан.

## Джерела контракту

- Сценарій, поля форми й очікуваний результат: [requirements/add-car-requirement.md](../requirements/add-car-requirement.md).
- Accessible role/name елементів (`Add car`, `Add a car`, `Brand`, `Model`, `Mileage`, `Add`, `Audi TT`): перевірено дослідницьким проходом агента-планувальника (Playwright MCP browser tools) станом на 2026-09-28; це проміжна перевірка, а не заміна обов'язкової Playwright CLI-перевірки локаторів перед записом теста.
- Результат запуску: лише фактичний terminal output Playwright Test, отриманий після `APPROVE RUN`.
