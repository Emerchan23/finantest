import requests

BASE_URL = "http://localhost:3145"
TIMEOUT = 30

def test_list_all_companies_multi_tenant_support():
    url = f"{BASE_URL}/api/empresas"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    try:
        companies = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(companies, list), "Response should be a list"

    for company in companies:
        assert isinstance(company, dict), "Each company should be an object"
        assert "id" in company, "Company object missing 'id'"
        assert isinstance(company["id"], str), "'id' should be a string"
        assert "nome" in company, "Company object missing 'nome'"
        assert isinstance(company["nome"], str), "'nome' should be a string"
        assert "created_at" in company, "Company object missing 'created_at'"
        assert isinstance(company["created_at"], str), "'created_at' should be a string"

test_list_all_companies_multi_tenant_support()