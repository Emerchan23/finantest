import requests
import uuid

BASE_URL = "http://localhost:3145"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}

def create_company():
    data = {"nome": f"Test Company {uuid.uuid4()}"}
    resp = requests.post(f"{BASE_URL}/api/empresas", json=data, headers=HEADERS, timeout=TIMEOUT)
    resp.raise_for_status()
    company_id = resp.json().get("id")
    assert company_id, "Failed to create company"
    return company_id

def delete_company(company_id):
    requests.delete(f"{BASE_URL}/api/empresas/{company_id}", timeout=TIMEOUT)

def create_client():
    data = {
        "nome": f"Test Client {uuid.uuid4()}",
        "documento": "12345678900",
        "endereco": "Rua Teste, 123",
        "telefone": "+5511999999999",
        "email": f"testclient{uuid.uuid4().hex[:6]}@example.com"
    }
    resp = requests.post(f"{BASE_URL}/api/clientes", json=data, headers=HEADERS, timeout=TIMEOUT)
    resp.raise_for_status()
    client_id = resp.json().get("id")
    assert client_id, "Failed to create client"
    return client_id

def delete_client(client_id):
    requests.delete(f"{BASE_URL}/api/clientes/{client_id}", timeout=TIMEOUT)

def create_product():
    data = {
        "nome": f"Test Product {uuid.uuid4()}",
        "preco": 99.99,
        "categoria": "Test Category"
    }
    resp = requests.post(f"{BASE_URL}/api/produtos", json=data, headers=HEADERS, timeout=TIMEOUT)
    resp.raise_for_status()
    product_id = resp.json().get("id")
    assert product_id, "Failed to create product"
    return product_id

def delete_product(product_id):
    requests.delete(f"{BASE_URL}/api/produtos/{product_id}", timeout=TIMEOUT)

def delete_sale(sale_id):
    requests.delete(f"{BASE_URL}/api/vendas/{sale_id}", timeout=TIMEOUT)

def test_create_new_sale_with_linked_client_and_product():
    company_id = None
    client_id = None
    product_id = None
    sale_id = None
    try:
        # Create company
        company_id = create_company()

        # Create client
        client_id = create_client()

        # Create product
        product_id = create_product()

        sale_data = {
            "cliente_id": client_id,
            "produto_id": product_id,
            "quantidade": 2,
            "preco_unitario": 99.99,
            "empresa_id": company_id
        }
        response = requests.post(f"{BASE_URL}/api/vendas", json=sale_data, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 200, f"Unexpected status code: {response.status_code}"
        resp_json = response.json()
        sale_id = resp_json.get("id")
        assert sale_id, "Response JSON does not contain sale id"
    finally:
        if sale_id:
            delete_sale(sale_id)
        if client_id:
            delete_client(client_id)
        if product_id:
            delete_product(product_id)
        if company_id:
            delete_company(company_id)

test_create_new_sale_with_linked_client_and_product()