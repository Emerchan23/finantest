import requests
from datetime import datetime

BASE_URL = "http://localhost:3145"
TIMEOUT = 30

def test_health_check_api_returns_application_status_and_timestamp():
    url = f"{BASE_URL}/api/health"
    try:
        response = requests.get(url, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not a valid JSON"

    assert "ok" in data, "'ok' field is missing in response JSON"
    assert data["ok"] is True, "'ok' field is not True"

    assert "timestamp" in data, "'timestamp' field is missing in response JSON"
    timestamp_str = data["timestamp"]
    assert isinstance(timestamp_str, str), "'timestamp' is not a string"
    try:
        # Validate timestamp format by attempting to parse ISO 8601 string
        datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
    except ValueError:
        assert False, f"'timestamp' is not a valid ISO 8601 datetime string: {timestamp_str}"

test_health_check_api_returns_application_status_and_timestamp()