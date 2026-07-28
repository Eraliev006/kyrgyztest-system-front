# QA Smoke Tests — KyrgyzTest Frontend

Playwright UI smoke tests for the KyrgyzTest candidate/admin/examiner frontend.
Structure and conventions follow the Network Passport QA suite (pytest +
Playwright + httpx + pydantic-settings, page-object model, data created/cleaned
via direct API calls rather than through the UI).

## Стек

- Python 3.11+
- pytest
- Playwright (sync API)
- httpx — создание/удаление тестовых данных напрямую через backend API
- pydantic-settings

## Установка

```bash
cd qa
uv sync
uv run playwright install chromium
cp .env.example .env
# заполни BASE_URL, BASE_UI_URL, ADMIN_LOGIN, ADMIN_PASSWORD, EXAM_KIOSK_PASSWORD
```

Без `uv`:

```bash
cd qa
python -m venv .venv && source .venv/bin/activate
pip install -e .
playwright install chromium
```

## Запуск

```bash
# все smoke-тесты
uv run pytest -m smoke

# с видимым браузером для отладки
HEADLESS=false SLOW_MO=250 uv run pytest -m smoke

# конкретный файл
uv run pytest tests/ui/tests/test_admin_login.py -v
```

Перед запуском должны быть подняты backend (`docker compose up -d` в
`kyrgyztest-system`) и frontend (`npm run dev`) на адресах из `.env`.

## Что проверяется

- `test_admin_login.py` — вход в админку валидным и неверным логином/паролем.
- `test_admin_navigation.py` — каждый пункт сайдбара открывает свою страницу
  без падения (по одному тесту на пункт меню).
- `test_examiner_queue.py` — очередь проверки Examiner'а открывается и
  рендерится (доступ SuperAdmin к `/examiner/*` тоже проверяется этим).
- `test_exam_login.py` — вход кандидата по коду доступа (после разблокировки
  киоска) доходит до раздела теста или экрана завершения; неверный код
  показывает ошибку.

Это набор smoke — быстрые, некритичные к состоянию БД проверки "приложение не
сломано", а не полная регрессия. Кандидаты для UI-тестов создаются и удаляются
через прямые вызовы backend API (фикстура `ui_test_candidate`), поэтому тесты
не зависят друг от друга и не оставляют мусор в БД.
