import requests

BASE_URL = "http://localhost:3145"
TIMEOUT = 30

def test_create_new_company_with_valid_data():
    url = f"{BASE_URL}/api/empresas"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "nome": "Empresa Teste API"
    }
    
    response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    
    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    
    json_response = response.json()
    assert isinstance(json_response, dict), f"Response JSON should be a dictionary but got {type(json_response)}"
    assert "id" in json_response, "Response JSON does not contain 'id'"
    assert isinstance(json_response["id"], str) and json_response["id"].strip() != "", "'id' should be a non-empty string"

test_create_new_company_with_valid_data()