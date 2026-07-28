import pytest
from playwright.sync_api import expect

from config import settings


@pytest.mark.smoke
@pytest.mark.ui
def test_valid_login_redirects_to_admin_dashboard(login_page):
    login_page.navigate()
    login_page.login(settings.admin_login, settings.admin_password)

    login_page.page.wait_for_url('**/admin')
    expect(login_page.page.get_by_test_id('admin-sidebar')).to_be_visible()


@pytest.mark.smoke
@pytest.mark.ui
def test_invalid_password_keeps_user_on_login_page(login_page):
    login_page.navigate()
    login_page.login(settings.admin_login, 'definitely-wrong-password')

    expect(login_page.page.locator('[data-sonner-toast]')).to_be_visible()
    expect(login_page.page).to_have_url(f'{settings.base_ui_url}/admin/login')
