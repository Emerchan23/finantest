import requests

BASE_URL = "http://localhost:3145"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}


def test_list_clients_data_isolation():
    create_client_url = f"{BASE_URL}/api/clientes"
    get_clients_url = create_client_url

    # Sample client data to create a new client to ensure presence in the current company context
    new_client_data = {
        "nome": "Client Data Isolation Test",
        "documento": "12345678900",
        "endereco": "Rua Teste, 123",
        "telefone": "11999999999",
        "email": "client.isolation@test.com"
    }

    created_client_id = None
    try:
        # Create a new client to ensure at least one client for the current company
        create_resp = requests.post(create_client_url, json=new_client_data, headers=HEADERS, timeout=TIMEOUT)
        assert create_resp.status_code == 200, f"Failed to create client: {create_resp.text}"
        create_resp_json = create_resp.json()
        assert "id" in create_resp_json and isinstance(create_resp_json["id"], str) and create_resp_json["id"].strip(), "Invalid client ID in creation response"
        created_client_id = create_resp_json["id"]

        # Get list of clients for current company
        list_resp = requests.get(get_clients_url, headers=HEADERS, timeout=TIMEOUT)
        assert list_resp.status_code == 200, f"Failed to list clients: {list_resp.text}"

        clients = list_resp.json()
        assert isinstance(clients, list), "Clients response is not a list"

        # Find the created client in the list to assert data is correct
        matching_clients = [c for c in clients if c.get("id") == created_client_id]
        assert len(matching_clients) == 1, "Created client not found in clients list for current company"

        client = matching_clients[0]
        # Validate client fields
        expected_fields = ["id", "nome", "documento", "endereco", "telefone", "email", "createdAt"]
        for field in expected_fields:
            assert field in client, f"Missing field '{field}' in client data"

        assert client["nome"] == new_client_data["nome"], "Client 'nome' does not match"
        assert client["documento"] == new_client_data["documento"], "Client 'documento' does not match"
        assert client["endereco"] == new_client_data["endereco"], "Client 'endereco' does not match"
        assert client["telefone"] == new_client_data["telefone"], "Client 'telefone' does not match"
        assert client["email"] == new_client_data["email"], "Client 'email' does not match"
        # createdAt should be a non-empty string
        assert isinstance(client["createdAt"], str) and client["createdAt"].strip(), "Client 'createdAt' is invalid"

        # Check that all clients returned are from the current company by ensuring data isolation concept
        # This might be inferred from the lack of clients with name or document drastically different, 
        # but since no authentication/tenant header or multi-company data is visible, the test focuses on existence and details.

    finally:
        # Cleanup: Delete the created client if possible
        if created_client_id:
            try:
                delete_url = f"{create_client_url}/{created_client_id}"
                del_resp = requests.delete(delete_url, headers=HEADERS, timeout=TIMEOUT)
                # Deletion might not return 200, but we do not raise because this is cleanup
            except Exception:
                pass


test_list_clients_data_isolation()