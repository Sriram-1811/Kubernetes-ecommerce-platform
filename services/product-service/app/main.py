from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.database import get_connection

app = FastAPI()


class Product(BaseModel):
    id: int
    name: str
    category: str
    price: float
    currency: str

class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    currency: str

class ProductUpdate(BaseModel):
    name: str
    category: str
    price: float
    currency: str


@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/products", response_model=list[Product])
def get_products():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT id, name, category, price, currency
        FROM products
        ORDER BY id
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    return [
        {
            "id": row[0],
            "name": row[1],
            "category": row[2],
            "price": float(row[3]),
            "currency": row[4]
        }
        for row in rows
    ]

@app.post("/products", response_model=Product)
def create_product(product: ProductCreate):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO products (name, category, price, currency)
        VALUES (%s, %s, %s, %s)
        RETURNING id, name, category, price, currency
        """,
        (
            product.name,
            product.category,
            product.price,
            product.currency
        )
    )

    row = cursor.fetchone()

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": row[0],
        "name": row[1],
        "category": row[2],
        "price": float(row[3]),
        "currency": row[4]
    }

@app.put("/products/{product_id}", response_model=Product)
def update_product(product_id: int, product: ProductUpdate):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE products
        SET name = %s,
            category = %s,
            price = %s,
            currency = %s
        WHERE id = %s
        RETURNING id, name, category, price, currency
        """,
        (
            product.name,
            product.category,
            product.price,
            product.currency,
            product_id
        )
    )

    row = cursor.fetchone()

    if row is None:
        cursor.close()
        connection.close()
        raise HTTPException(status_code=404, detail="Product not found")

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": row[0],
        "name": row[1],
        "category": row[2],
        "price": float(row[3]),
        "currency": row[4]
    }

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM products
        WHERE id = %s
        RETURNING id
        """,
        (product_id,)
    )

    row = cursor.fetchone()

    if row is None:
        cursor.close()
        connection.close()
        raise HTTPException(status_code=404, detail="Product not found")

    connection.commit()

    cursor.close()
    connection.close()

    return {"message": "Product deleted successfully"}

@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, name, category, price, currency
        FROM products
        WHERE id = %s
        """,
        (product_id,)
    )

    row = cursor.fetchone()

    cursor.close()
    connection.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "id": row[0],
        "name": row[1],
        "category": row[2],
        "price": float(row[3]),
        "currency": row[4]
    }
