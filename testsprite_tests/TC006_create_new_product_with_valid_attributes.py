import requests

BASE_URL = "http://localhost:3145"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json"
}

def test_create_new_product_with_valid_attributes():
    url = f"{BASE_URL}/api/produtos"
    payload = {
        "nome": "Produto Teste",
        "preco": 150.75,
        "categoria": "Categoria Teste"
    }

    response = None
    try:
        response = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
        response.raise_for_status()
        data = response.json()

        assert isinstance(data, dict), "Response is not a JSON object"
        assert "id" in data, "Response JSON does not contain 'id'"
        assert isinstance(data["id"], str), "'id' field is not a string"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    except ValueError:
        assert False, "Response is not valid JSON"

test_create_new_product_with_valid_attributes()