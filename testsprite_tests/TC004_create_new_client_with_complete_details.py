import requests

BASE_URL = "http://localhost:3145"
CLIENTS_ENDPOINT = f"{BASE_URL}/api/clientes"
HEADERS = {
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_tc004_create_new_client_complete_details():
    client_data = {
        "nome": "Cliente Teste Completo",
        "documento": "12345678901",
        "endereco": "Rua Exemplo, 123, São Paulo, SP",
        "telefone": "+55 11 91234-5678",
        "email": "cliente.teste@example.com"
    }

    try:
        response = requests.post(CLIENTS_ENDPOINT, json=client_data, headers=HEADERS, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to create client failed: {e}"

    try:
        json_response = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert "id" in json_response, "Response JSON does not contain 'id'"
    assert isinstance(json_response["id"], str) and len(json_response["id"]) > 0, "Client 'id' is not a valid non-empty string"

test_tc004_create_new_client_complete_details()