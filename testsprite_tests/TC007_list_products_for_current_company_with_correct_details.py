import requests

BASE_URL = "http://localhost:3145"
HEADERS = {"Accept": "application/json"}
TIMEOUT = 30

def test_list_products_for_current_company_with_correct_details():
    url = f"{BASE_URL}/api/produtos"
    try:
        response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to list products failed: {e}"

    try:
        products = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(products, list), "Response JSON is not a list"

    for product in products:
        assert isinstance(product, dict), "Product item is not a JSON object"
        assert "id" in product and isinstance(product["id"], str), "Product missing 'id' or not string"
        assert "nome" in product and isinstance(product["nome"], str), "Product missing 'nome' or not string"
        assert "preco" in product and (isinstance(product["preco"], float) or isinstance(product["preco"], int)), "Product missing 'preco' or not a number"
        assert "categoria" in product and isinstance(product["categoria"], str), "Product missing 'categoria' or not string"
        assert "created_at" in product and isinstance(product["created_at"], str), "Product missing 'created_at' or not string"

test_list_products_for_current_company_with_correct_details()