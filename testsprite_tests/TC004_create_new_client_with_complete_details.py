import requests

BASE_URL = "http://localhost:3145"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}

def test_create_new_client_with_complete_details():
    url = f"{BASE_URL}/api/clientes"
    client_data = {
        "nome": "Cliente Teste Completo",
        "documento": "12345678901",
        "endereco": "Rua Exemplo, 123, Bairro Teste, Cidade Y",
        "telefone": "+5511999998888",
        "email": "cliente.teste@example.com"
    }
    response = None
    try:
        response = requests.post(url, json=client_data, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 200, f"Unexpected status code: {response.status_code}"
        json_resp = response.json()
        assert "id" in json_resp, "Response JSON does not contain 'id'"
        assert isinstance(json_resp["id"], str) and len(json_resp["id"]) > 0, "Invalid 'id' value"
    finally:
        if response and response.status_code == 200:
            client_id = response.json().get("id")
            if client_id:
                # Attempt to delete created client to avoid test pollution
                delete_url = f"{BASE_URL}/api/clientes/{client_id}"
                try:
                    del_resp = requests.delete(delete_url, headers=HEADERS, timeout=TIMEOUT)
                    assert del_resp.status_code in (200, 204), "Failed to delete test client after test"
                except Exception:
                    pass

test_create_new_client_with_complete_details()