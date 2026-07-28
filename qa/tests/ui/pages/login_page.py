from playwright.sync_api import Page, expect


class LoginPage:
    def __init__(self, page: Page):
        self.page = page
        self.login_input = page.get_by_test_id('login-input')
        self.password_input = page.get_by_test_id('password-input')
        self.submit_button = page.get_by_test_id('login-submit')

    def navigate(self):
        self.page.goto('/admin/login')
        expect(self.page.get_by_test_id('login-form')).to_be_visible()

    def login(self, login: str, password: str):
        self.login_input.fill(login)
        self.password_input.fill(password)
        self.submit_button.click()
