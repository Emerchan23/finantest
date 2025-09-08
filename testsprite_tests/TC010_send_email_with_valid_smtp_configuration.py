import requests

BASE_URL = "http://localhost:3145"
TIMEOUT = 30

def test_send_email_with_valid_smtp_configuration():
    url = f"{BASE_URL}/api/email/send"
    headers = {"Content-Type": "application/json"}
    payload = {
        "to": "recipient@example.com",
        "subject": "Test Email",
        "html": "<h1>This is a test email</h1><p>Sent from ERP-BR automated test.</p>"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
        # Assuming successful send returns 200 and some confirmation in body
        assert response.status_code == 200
        content_type = response.headers.get('Content-Type', '')
        assert "application/json" in content_type or "text" in content_type or "html" in content_type or content_type==""
        # If response is JSON, we can check for keys/values
        try:
            json_data = response.json()
            assert isinstance(json_data, dict)
        except Exception:
            # If not JSON, just pass, as only 200 success is required
            pass
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_send_email_with_valid_smtp_configuration()