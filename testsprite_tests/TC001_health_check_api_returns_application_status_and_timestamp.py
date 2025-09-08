import requests
from datetime import datetime

BASE_URL = "http://localhost:3145"
TIMEOUT = 30

def test_health_check_api_returns_application_status_and_timestamp():
    url = f"{BASE_URL}/api/health"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"
        json_data = response.json()
        assert isinstance(json_data, dict), "Response is not a JSON object"
        assert 'ok' in json_data, "'ok' key missing in response"
        assert json_data['ok'] is True, "'ok' is not True"
        assert 'timestamp' in json_data, "'timestamp' key missing in response"
        # Validate timestamp is a valid ISO 8601 string
        timestamp_str = json_data['timestamp']
        try:
            # Try parsing timestamp to datetime
            parsed_timestamp = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        except Exception:
            assert False, f"Timestamp '{timestamp_str}' is not a valid ISO 8601 string"
    except requests.RequestException as e:
        assert False, f"Request to health check API failed: {e}"

test_health_check_api_returns_application_status_and_timestamp()