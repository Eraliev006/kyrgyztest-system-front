import httpx
import pytest
from playwright.sync_api import expect, sync_playwright

from config import settings
from utils.auth import get_admin_token_sync
from utils.helpers import candidate_payload

# The dev server (`npm run dev`) compiles each route's chunk on first request,
# which can take longer than Playwright's 5s default under Vite's on-demand
# transform — bump the global assertion timeout so first-hit navigation in a
# fresh dev session isn't flaky. Production builds (CI) don't pay this cost,
# but the larger timeout is harmless there too.
expect.set_options(timeout=10_000)


@pytest.fixture(scope='session')
def playwright_instance():
    with sync_playwright() as p:
        yield p


@pytest.fixture(scope='session')
def browser(playwright_instance):
    # CI runs this as root inside Docker, where Chromium's sandbox needs
    # privileges the container doesn't grant — without --no-sandbox the
    # browser launches but every navigation silently produces a blank page.
    browser = playwright_instance.chromium.launch(
        headless=settings.headless,
        slow_mo=settings.slow_mo,
        args=['--no-sandbox', '--disable-dev-shm-usage'],
    )
    yield browser
    browser.close()


# --- Admin / Examiner persona (both roles satisfy the backend's SuperAdmin-or-Examiner
# guard on /examiner/*, so a single logged-in SuperAdmin session covers both). Logging in
# once per session and handing out fresh tabs keeps tests independent without re-doing
# the login flow for every test. ---


@pytest.fixture(scope='session')
def logged_in_admin_context(browser):
    from tests.ui.pages.login_page import LoginPage

    context = browser.new_context(base_url=settings.base_ui_url)
    page = context.new_page()
    login_page = LoginPage(page)
    login_page.navigate()
    login_page.login(settings.admin_login, settings.admin_password)
    page.wait_for_url('**/admin')
    page.close()

    yield context
    context.close()


@pytest.fixture
def page(logged_in_admin_context):
    page = logged_in_admin_context.new_page()
    yield page
    page.close()


@pytest.fixture
def admin_layout(page):
    from tests.ui.pages.admin_layout import AdminLayout
    return AdminLayout(page)


@pytest.fixture
def examiner_queue_page(page):
    from tests.ui.pages.examiner_queue_page import ExaminerQueuePage
    return ExaminerQueuePage(page)


# --- Unauthenticated persona: staff login form itself, and the candidate kiosk flow.
# Both need a clean browser context with no admin session in localStorage. ---


@pytest.fixture
def fresh_context(browser):
    context = browser.new_context(base_url=settings.base_ui_url)
    yield context
    context.close()


@pytest.fixture
def fresh_page(fresh_context):
    page = fresh_context.new_page()
    yield page
    page.close()


@pytest.fixture
def login_page(fresh_page):
    from tests.ui.pages.login_page import LoginPage
    return LoginPage(fresh_page)


@pytest.fixture
def exam_login_page(fresh_page):
    from tests.ui.pages.exam_login_page import ExamLoginPage
    return ExamLoginPage(fresh_page)


# --- Test data, created/cleaned via direct backend API calls rather than through
# the UI — keeps UI tests independent and avoids leaving rows behind in the DB. ---


@pytest.fixture
def admin_token():
    return get_admin_token_sync()


@pytest.fixture
def ui_test_candidate(admin_token):
    headers = {'Authorization': f'Bearer {admin_token}'}
    payload = candidate_payload()

    response = httpx.post(f'{settings.base_url}/api/candidates', headers=headers, json=payload)
    response.raise_for_status()
    candidate = response.json()

    yield candidate

    httpx.delete(f'{settings.base_url}/api/candidates/{candidate["id"]}', headers=headers)
