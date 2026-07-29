import pytest
from playwright.sync_api import expect

# (sidebar test-id, path, marker kind, marker value) — marker is either a
# data-testid the page renders (preferred) or, for pages still at their Ф-1
# placeholder stub, the heading text. Either way it proves the route resolved
# to real page content, not a blank/crashed screen.
PAGES = [
    ('nav-dashboard', '/admin', 'heading', 'Дашборд'),
    ('nav-organizations', '/admin/organizations', 'testid', 'organizations-table'),
    ('nav-candidates', '/admin/candidates', 'testid', 'candidates-table'),
    ('nav-topics', '/admin/topics', 'testid', 'topics-accordion'),
    ('nav-questions', '/admin/questions', 'testid', 'questions-accordion'),
    ('nav-variants', '/admin/variants', 'testid', 'variants-table'),
    ('nav-results', '/admin/results', 'heading', 'Результаты'),
    ('nav-monitoring', '/admin/monitoring', 'testid', 'live-monitoring-table'),
]


@pytest.mark.smoke
@pytest.mark.ui
@pytest.mark.parametrize('nav_test_id, path, kind, marker', PAGES)
def test_sidebar_link_navigates_and_renders_page(admin_layout, nav_test_id, path, kind, marker):
    admin_layout.navigate()
    admin_layout.go_to(nav_test_id, path)

    if kind == 'testid':
        expect(admin_layout.page.get_by_test_id(marker)).to_be_visible()
    else:
        expect(admin_layout.page.get_by_role('heading', name=marker)).to_be_visible()
