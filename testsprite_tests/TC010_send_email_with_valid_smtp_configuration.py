import requests

BASE_URL = "http://localhost:3145"
TIMEOUT = 30

def test_tc010_send_email_with_valid_smtp_configuration():
    url = f"{BASE_URL}/api/email/send"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "to": "test@example.com",
        "subject": "Test Email Subject",
        "html": "<h1>This is a test email</h1><p>Sent during automated testing.</p>"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"


test_tc010_send_email_with_valid_smtp_configuration()