import requests

BASE_URL = "http://localhost:3145"
TIMEOUT = 30

def test_list_products_for_current_company_with_correct_details():
    url = f"{BASE_URL}/api/produtos"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    data = response.json()
    assert isinstance(data, list), "Response should be a list"

    for product in data:
        assert isinstance(product, dict), "Each product should be an object"
        assert "id" in product, "Product missing 'id'"
        assert isinstance(product["id"], str), "'id' should be a string"
        assert "nome" in product, "Product missing 'nome'"
        assert isinstance(product["nome"], str), "'nome' should be a string"
        assert "preco" in product, "Product missing 'preco'"
        assert isinstance(product["preco"], (int, float)), "'preco' should be a number"
        assert "categoria" in product, "Product missing 'categoria'"
        assert isinstance(product["categoria"], str), "'categoria' should be a string"
        assert "created_at" in product, "Product missing 'created_at'"
        assert isinstance(product["created_at"], str), "'created_at' should be a string"

test_list_products_for_current_company_with_correct_details()