from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class Product(BaseModel):
    id: int
    name: str
    category: str
    price: float

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float

class ProductUpdate(BaseModel):
    name: str
    category: str
    price: float

products = [
    {
        "id": 1,
        "name": "HungerTech Wireless Headphones",
        "category": "Electronics",
        "price": 79.99
    },
    {
        "id": 2,
        "name": "HungerTech Smartwatch",
        "category": "Electronics",
        "price": 129.99
    },
    {
        "id": 3,
        "name": "HungerWear Classic Hoodie",
        "category": "Fashion",
        "price": 49.99
    },
    {
        "id": 4,
        "name": "HungerWear Premium T-Shirt",
        "category": "Fashion",
        "price": 29.99
    }
]


@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/products", response_model=list[Product])
def get_products():
    return products


@app.post("/products", response_model=Product)
def create_product(product: ProductCreate):
    new_id = len(products) + 1

    new_product = {
        "id": new_id,
        "name": product.name,
        "category": product.category,
        "price": product.price
    }

    products.append(new_product)

    return new_product

@app.put("/products/{product_id}", response_model=Product)
def update_product(product_id: int, product: ProductUpdate):
    for existing_product in products:
        if existing_product["id"] == product_id:
            existing_product["name"] = product.name
            existing_product["category"] = product.category
            existing_product["price"] = product.price

            return existing_product

    raise HTTPException(status_code=404, detail="Product not found")

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    for product in products:
        if product["id"] == product_id:
            products.remove(product)
            return {"message": "Product deleted successfully"}

    raise HTTPException(status_code=404, detail="Product not found")

@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    for product in products:
        if product["id"] == product_id:
            return product

    raise HTTPException(status_code=404, detail="Product not found")
