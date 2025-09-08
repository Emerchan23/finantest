import requests
import uuid

BASE_URL = "http://localhost:3145"
TIMEOUT = 30

def test_create_new_sale_with_linked_client_and_product():
    headers = {"Content-Type": "application/json"}

    # Step 1. Create a new company
    company_payload = {"nome": f"Test Company {uuid.uuid4()}"}
    company_response = requests.post(f"{BASE_URL}/api/empresas", json=company_payload, headers=headers, timeout=TIMEOUT)
    assert company_response.status_code == 200, f"Failed to create company: {company_response.text}"
    company_id = company_response.json().get("id")
    assert company_id, "Company ID not returned"

    # Step 2. Create a new client linked to the company
    client_payload = {
        "nome": f"Test Client {uuid.uuid4()}",
        "documento": "12345678900",
        "endereco": "Rua Teste, 123",
        "telefone": "11999999999",
        "email": f"client{uuid.uuid4()}@example.com"
    }
    client_response = requests.post(f"{BASE_URL}/api/clientes", json=client_payload, headers=headers, timeout=TIMEOUT)
    assert client_response.status_code == 200, f"Failed to create client: {client_response.text}"
    client_id = client_response.json().get("id")
    assert client_id, "Client ID not returned"

    # Step 3. Create a new product linked to the company
    product_payload = {
        "nome": f"Test Product {uuid.uuid4()}",
        "preco": 99.90,
        "categoria": "Test Category"
    }
    product_response = requests.post(f"{BASE_URL}/api/produtos", json=product_payload, headers=headers, timeout=TIMEOUT)
    assert product_response.status_code == 200, f"Failed to create product: {product_response.text}"
    product_id = product_response.json().get("id")
    assert product_id, "Product ID not returned"

    # Step 4. Create a new sale with linked client id, product id, quantity, unit price, and company id
    sale_payload = {
        "cliente_id": client_id,
        "produto_id": product_id,
        "quantidade": 3,
        "preco_unitario": 99.90,
        "empresa_id": company_id
    }

    try:
        sale_response = requests.post(f"{BASE_URL}/api/vendas", json=sale_payload, headers=headers, timeout=TIMEOUT)
        assert sale_response.status_code == 200, f"Failed to create sale: {sale_response.text}"
        sale_id = sale_response.json().get("id")
        assert sale_id, "Sale ID not returned"

    finally:
        # Cleanup created sale (if created)
        if 'sale_id' in locals() and sale_id:
            requests.delete(f"{BASE_URL}/api/vendas/{sale_id}", headers=headers, timeout=TIMEOUT)

        # Cleanup created client
        if client_id:
            requests.delete(f"{BASE_URL}/api/clientes/{client_id}", headers=headers, timeout=TIMEOUT)

        # Cleanup created product
        if product_id:
            requests.delete(f"{BASE_URL}/api/produtos/{product_id}", headers=headers, timeout=TIMEOUT)

        # Cleanup created company
        if company_id:
            requests.delete(f"{BASE_URL}/api/empresas/{company_id}", headers=headers, timeout=TIMEOUT)

test_create_new_sale_with_linked_client_and_product()