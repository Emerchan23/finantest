import requests

BASE_URL = "http://localhost:3145"
TIMEOUT = 30

def test_list_all_companies():
    url = f"{BASE_URL}/api/empresas"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to list companies failed: {e}"

    try:
        companies = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(companies, list), "Response is not a list"

    for company in companies:
        assert isinstance(company, dict), "Each company must be a dictionary"
        assert "id" in company, "Company missing 'id' field"
        assert isinstance(company["id"], str), "'id' field must be a string"
        assert "nome" in company, "Company missing 'nome' field"
        assert isinstance(company["nome"], str), "'nome' field must be a string"
        assert "created_at" in company, "Company missing 'created_at' field"
        assert isinstance(company["created_at"], str), "'created_at' field must be a string"

test_list_all_companies()