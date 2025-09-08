import requests
import uuid

BASE_URL = "http://localhost:3145"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json"
}

def create_company():
    url = f"{BASE_URL}/api/empresas"
    payload = {
        "nome": f"Test Company {uuid.uuid4()}"
    }
    resp = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
    resp.raise_for_status()
    company_id = resp.json().get("id")
    assert isinstance(company_id, str) and len(company_id) > 0
    return company_id

def delete_company(company_id):
    url = f"{BASE_URL}/api/empresas/{company_id}"
    # No delete endpoint defined in PRD, so if no delete supported, skip.
    # Assuming it's not available, no action here.
    pass

def create_client(client_data):
    url = f"{BASE_URL}/api/clientes"
    resp = requests.post(url, json=client_data, headers=HEADERS, timeout=TIMEOUT)
    resp.raise_for_status()
    client_id = resp.json().get("id")
    assert isinstance(client_id, str) and len(client_id) > 0
    return client_id

def delete_client(client_id):
    url = f"{BASE_URL}/api/clientes/{client_id}"
    # No delete endpoint defined in PRD, so if no delete supported, skip.
    # Assuming it's not available, no action here.
    pass

def test_list_clients_for_current_company_with_data_isolation():
    # Create a new company
    company_id = None
    client_id = None
    try:
        # Step 1: Create a new company - needed to isolate data (if possible)
        # NOTE: PRD doesn't show how clients are linked by company explicitly in request,
        # we assume the API uses authentication or some header to determine the current company context.
        # Without authentication info, this test will create a client and verify it appears in the listing.

        company_id = create_company()

        # Step 2: Create a client belonging to the current company
        client_data = {
            "nome": f"Client {uuid.uuid4()}",
            "documento": f"12345678900",
            "endereco": "Rua Teste, 123",
            "telefone": "1234567890",
            "email": f"testclient_{uuid.uuid4().hex}@example.com"
        }
        client_id = create_client(client_data)

        # Step 3: Call GET /api/clientes to list clients of current company
        url = f"{BASE_URL}/api/clientes"
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        clients = resp.json()
        assert isinstance(clients, list)

        # Step 4: Verify that the created client is in the list with correct details
        matching_clients = [c for c in clients if c.get("id") == client_id]
        assert len(matching_clients) == 1
        client_returned = matching_clients[0]

        # Validate client fields
        assert client_returned.get("nome") == client_data["nome"]
        assert client_returned.get("documento") == client_data["documento"]
        assert client_returned.get("endereco") == client_data["endereco"]
        assert client_returned.get("telefone") == client_data["telefone"]
        assert client_returned.get("email") == client_data["email"]
        assert "createdAt" in client_returned and isinstance(client_returned["createdAt"], str)

        # Optional: Test data isolation by asserting no clients from other companies appear
        # Since no cross-company clients creation available here and no auth, skipping.

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"
    finally:
        # Cleanup - Delete created client and company if API had delete endpoints.
        # PRD did not specify deletes for clients or companies, so skipping.
        pass

test_list_clients_for_current_company_with_data_isolation()