import requests
import uuid

BASE_URL = "http://localhost:3145"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}

def test_list_sales_with_related_data():
    company_id = None
    client_id = None
    product_id = None
    sale_id = None

    try:
        # 1. Create a company to isolate data
        company_payload = {"nome": f"Test Company {uuid.uuid4()}"}
        r = requests.post(f"{BASE_URL}/api/empresas", json=company_payload, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        company_id = r.json().get("id")
        assert company_id, "Company ID should be present"

        # 2. Create a client linked to the company
        client_payload = {
            "nome": f"Test Client {uuid.uuid4()}",
            "documento": "12345678900",
            "endereco": "Rua Teste, 123",
            "telefone": "5591999999999",
            "email": f"testclient{uuid.uuid4().hex[:8]}@example.com"
        }
        r = requests.post(f"{BASE_URL}/api/clientes", json=client_payload, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        client_id = r.json().get("id")
        assert client_id, "Client ID should be present"

        # 3. Create a product linked to the company
        product_payload = {
            "nome": f"Test Product {uuid.uuid4()}",
            "preco": 99.99,
            "categoria": "Categoria Teste"
        }
        r = requests.post(f"{BASE_URL}/api/produtos", json=product_payload, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        product_id = r.json().get("id")
        assert product_id, "Product ID should be present"

        # 4. Create a sale with the client_id, product_id, and company_id
        sale_payload = {
            "cliente_id": client_id,
            "produto_id": product_id,
            "quantidade": 5,
            "preco_unitario": 99.99,
            "empresa_id": company_id
        }
        r = requests.post(f"{BASE_URL}/api/vendas", json=sale_payload, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        sale_id = r.json().get("id")
        assert sale_id, "Sale ID should be present"

        # 5. List sales and verify the included data
        r = requests.get(f"{BASE_URL}/api/vendas", headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        sales = r.json()
        assert isinstance(sales, list), "Sales response should be a list"
        assert any(sale.get("id") == sale_id for sale in sales), "Created sale should be in the sales list"

        # Find the created sale in the list to verify related data
        created_sale = next((s for s in sales if s.get("id") == sale_id), None)
        assert created_sale, "Created sale details must be present"

        # Validate sale fields
        assert created_sale.get("cliente_id") == client_id, "Sale cliente_id must match"
        assert created_sale.get("produto_id") == product_id, "Sale produto_id must match"
        assert created_sale.get("empresa_id") == company_id, "Sale empresa_id must match"
        assert isinstance(created_sale.get("quantidade"), (int, float)), "quantidade should be a number"
        assert isinstance(created_sale.get("preco_unitario"), (int, float)), "preco_unitario should be a number"
        assert isinstance(created_sale.get("total"), (int, float)), "total should be a number"

        # Validate related names presence and types
        assert isinstance(created_sale.get("cliente_nome"), str) and created_sale["cliente_nome"], "cliente_nome must be a non-empty string"
        assert isinstance(created_sale.get("produto_nome"), str) and created_sale["produto_nome"], "produto_nome must be a non-empty string"
        assert isinstance(created_sale.get("empresa_nome"), str) and created_sale["empresa_nome"], "empresa_nome must be a non-empty string"

    finally:
        # Cleanup - delete the sale if possible
        if sale_id:
            try:
                requests.delete(f"{BASE_URL}/api/vendas/{sale_id}", headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass
        # Cleanup - delete product
        if product_id:
            try:
                requests.delete(f"{BASE_URL}/api/produtos/{product_id}", headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass
        # Cleanup - delete client
        if client_id:
            try:
                requests.delete(f"{BASE_URL}/api/clientes/{client_id}", headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass
        # Cleanup - delete company
        if company_id:
            try:
                requests.delete(f"{BASE_URL}/api/empresas/{company_id}", headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass


test_list_sales_with_related_data()