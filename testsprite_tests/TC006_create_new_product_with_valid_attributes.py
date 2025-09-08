import requests

BASE_URL = "http://localhost:3145"
TIMEOUT = 30


def test_TC006_create_new_product_with_valid_attributes():
    url = f"{BASE_URL}/api/produtos"
    headers = {"Content-Type": "application/json"}
    product_data = {
        "nome": "Produto Teste",
        "preco": 99.90,
        "categoria": "Categoria Teste"
    }
    response = None
    product_id = None
    try:
        response = requests.post(url, json=product_data, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
        json_resp = response.json()
        assert isinstance(json_resp, dict), "Response is not a JSON object"
        product_id = json_resp.get("id")
        assert product_id is not None and isinstance(product_id, str) and len(product_id) > 0, "Response does not contain valid product id"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    finally:
        if product_id:
            try:
                del_response = requests.delete(f"{url}/{product_id}", timeout=TIMEOUT)
                del_response.raise_for_status()
            except requests.RequestException:
                pass


test_TC006_create_new_product_with_valid_attributes()