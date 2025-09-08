import requests

BASE_URL = "http://localhost:3145"
TIMEOUT = 30

def test_create_new_company_with_valid_data():
    url = f"{BASE_URL}/api/empresas"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "nome": "Empresa Teste TC002"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
        data = response.json()
        assert isinstance(data, dict), "Response is not a JSON object"
        assert "id" in data, "Response JSON does not contain 'id'"
        company_id = data["id"]
        assert isinstance(company_id, str) and company_id.strip() != "", "Company ID is not a valid non-empty string"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_create_new_company_with_valid_data()