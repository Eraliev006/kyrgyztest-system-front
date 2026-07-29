import pytest
from playwright.sync_api import expect

from config import settings


@pytest.mark.smoke
@pytest.mark.ui
@pytest.mark.xfail(
    reason='Dev stand has no question bank yet — variant generation produces 0 questions, '
    'so there is nothing for the candidate to start. Not a code bug; remove this xfail once '
    'real questions exist for every section/level on this environment.',
    strict=False,
)
def test_access_code_login_reaches_exam_or_finish(exam_login_page, ui_test_candidate):
    exam_login_page.navigate()
    exam_login_page.unlock(settings.exam_kiosk_password)
    exam_login_page.login_with_access_code(ui_test_candidate['accessCode'])

    exam_login_page.page.wait_for_url(lambda url: '/exam/section/' in url or '/exam/finish' in url)


@pytest.mark.smoke
@pytest.mark.ui
def test_invalid_access_code_shows_error(exam_login_page):
    exam_login_page.navigate()
    exam_login_page.unlock(settings.exam_kiosk_password)
    exam_login_page.login_with_access_code('NONEXISTENT-CODE')

    expect(exam_login_page.page.locator('[data-sonner-toast]')).to_be_visible()
