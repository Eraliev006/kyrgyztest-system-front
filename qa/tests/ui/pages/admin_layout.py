from playwright.sync_api import Page, expect


class AdminLayout:
    def __init__(self, page: Page):
        self.page = page
        self.sidebar = page.get_by_test_id('admin-sidebar')

    def navigate(self):
        self.page.goto('/admin')
        expect(self.sidebar).to_be_visible()

    def go_to(self, nav_test_id: str, path: str):
        self.page.get_by_test_id(nav_test_id).click()
        self.page.wait_for_url(f'**{path}')
