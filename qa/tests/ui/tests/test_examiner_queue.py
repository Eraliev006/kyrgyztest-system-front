import pytest
from playwright.sync_api import expect


@pytest.mark.smoke
@pytest.mark.ui
def test_examiner_queue_page_renders(examiner_queue_page):
    examiner_queue_page.navigate()

    expect(examiner_queue_page.table).to_be_visible()
