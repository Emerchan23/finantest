import requests

BASE_URL = "http://localhost:3145"
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}

def test_list_sales_with_related_data():
    # First create a company, client, product and a sale to ensure data exists for testing
    company_id = None
    client_id = None
    product_id = None
    sale_id = None

    try:
        # Create company
        company_resp = requests.post(
            f"{BASE_URL}/api/empresas",
            json={"nome": "Test Company for TC009"},
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        company_resp.raise_for_status()
        company_data = company_resp.json()
        company_id = company_data.get("id")
        assert isinstance(company_id, str) and company_id != ""

        # Create client
        client_payload = {
            "nome": "Client TC009",
            "documento": "12345678901",
            "endereco": "Rua Teste, 123",
            "telefone": "11999999999",
            "email": "clienttc009@example.com"
        }
        client_resp = requests.post(
            f"{BASE_URL}/api/clientes",
            json=client_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        client_resp.raise_for_status()
        client_data = client_resp.json()
        client_id = client_data.get("id")
        assert isinstance(client_id, str) and client_id != ""

        # Create product
        product_payload = {
            "nome": "Product TC009",
            "preco": 100.0,
            "categoria": "Categoria Teste"
        }
        product_resp = requests.post(
            f"{BASE_URL}/api/produtos",
            json=product_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        product_resp.raise_for_status()
        product_data = product_resp.json()
        product_id = product_data.get("id")
        assert isinstance(product_id, str) and product_id != ""

        # Create sale
        sale_payload = {
            "cliente_id": client_id,
            "produto_id": product_id,
            "quantidade": 2,
            "preco_unitario": 100.0,
            "empresa_id": company_id
        }
        sale_resp = requests.post(
            f"{BASE_URL}/api/vendas",
            json=sale_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        sale_resp.raise_for_status()
        sale_data = sale_resp.json()
        sale_id = sale_data.get("id")
        assert isinstance(sale_id, str) and sale_id != ""

        # Now list sales and verify inclusion of related data
        list_resp = requests.get(
            f"{BASE_URL}/api/vendas",
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        list_resp.raise_for_status()
        sales_list = list_resp.json()
        assert isinstance(sales_list, list) and len(sales_list) > 0

        # Find the sale we just created
        sale_found = None
        for sale in sales_list:
            if sale.get("id") == sale_id:
                sale_found = sale
                break

        assert sale_found is not None, "Created sale not found in list"

        # Validate presence and correctness of all related fields
        assert sale_found.get("cliente_id") == client_id
        assert sale_found.get("produto_id") == product_id
        assert sale_found.get("empresa_id") == company_id

        assert isinstance(sale_found.get("cliente_nome"), str) and sale_found.get("cliente_nome") != ""
        assert isinstance(sale_found.get("produto_nome"), str) and sale_found.get("produto_nome") != ""
        assert isinstance(sale_found.get("empresa_nome"), str) and sale_found.get("empresa_nome") != ""

        # Validate sale details
        assert isinstance(sale_found.get("quantidade"), (int, float))
        assert isinstance(sale_found.get("preco_unitario"), (int, float))
        assert isinstance(sale_found.get("total"), (int, float))

        # Check total correctness (quantity * unit price)
        expected_total = sale_found["quantidade"] * sale_found["preco_unitario"]
        assert abs(sale_found["total"] - expected_total) < 0.01

    finally:
        # Cleanup created sale
        if sale_id:
            try:
                requests.delete(f"{BASE_URL}/api/vendas/{sale_id}", headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass

        # Cleanup created client
        if client_id:
            try:
                requests.delete(f"{BASE_URL}/api/clientes/{client_id}", headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass

        # Cleanup created product
        if product_id:
            try:
                requests.delete(f"{BASE_URL}/api/produtos/{product_id}", headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass

        # Cleanup created company
        if company_id:
            try:
                requests.delete(f"{BASE_URL}/api/empresas/{company_id}", headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass


test_list_sales_with_related_data()