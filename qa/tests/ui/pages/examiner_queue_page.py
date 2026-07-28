from playwright.sync_api import Page, expect


class ExaminerQueuePage:
    def __init__(self, page: Page):
        self.page = page
        self.table = page.get_by_test_id('examiner-queue-table')

    def navigate(self):
        self.page.goto('/examiner/queue')
        expect(self.table).to_be_visible()
