
import pytest

from app.core.security import get_current_manager
from app.main import app


@pytest.fixture(autouse=True)
def authenticate_test_requests(request):
    if request.node.get_closest_marker("unauthenticated"):
        yield
        return

    app.dependency_overrides[get_current_manager] = (
        lambda: "hr-manager@example.com"
    )
    yield
    app.dependency_overrides.pop(get_current_manager, None)
