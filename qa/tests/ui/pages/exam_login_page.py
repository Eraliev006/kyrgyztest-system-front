from playwright.sync_api import Page, expect


class ExamLoginPage:
    def __init__(self, page: Page):
        self.page = page

    def navigate(self):
        self.page.goto('/exam/login')

    def unlock(self, password: str):
        expect(self.page.get_by_test_id('kiosk-unlock-form')).to_be_visible()
        self.page.get_by_test_id('kiosk-password-input').fill(password)
        self.page.get_by_test_id('kiosk-unlock-submit').click()

    def login_with_access_code(self, access_code: str):
        expect(self.page.get_by_test_id('access-code-form')).to_be_visible()
        self.page.get_by_test_id('access-code-input').fill(access_code)
        self.page.get_by_test_id('access-code-submit').click()
