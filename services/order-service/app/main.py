from fastapi import FastAPI, HTTPException

from app.database import get_connection
from app.models import OrderCreate, OrderUpdate


app = FastAPI(title="Hunger Store Order Service")


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/orders")
def create_order(order: OrderCreate):
    if order.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    connection = get_connection()
    cursor = connection.cursor()

    # Get the current product price from the product data.
    cursor.execute(
        """
        SELECT price, currency
        FROM products
        WHERE id = %s
        """,
        (order.product_id,)
    )

    product = cursor.fetchone()

    if product is None:
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    unit_price = product[0]
    currency = product[1]

    total_price = unit_price * order.quantity

    cursor.execute(
        """
        INSERT INTO orders
            (user_id, product_id, quantity,
             unit_price, total_price, currency)
        VALUES
            (%s, %s, %s, %s, %s, %s)
        RETURNING id, user_id, product_id, quantity,
                  unit_price, total_price, currency,
                  status, created_at
        """,
        (
            order.user_id,
            order.product_id,
            order.quantity,
            unit_price,
            total_price,
            currency
        )
    )

    new_order = cursor.fetchone()

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": new_order[0],
        "user_id": new_order[1],
        "product_id": new_order[2],
        "quantity": new_order[3],
        "unit_price": float(new_order[4]),
        "total_price": float(new_order[5]),
        "currency": new_order[6],
        "status": new_order[7],
        "created_at": new_order[8]
    }


@app.get("/orders")
def get_orders():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, user_id, product_id, quantity,
               unit_price, total_price, currency,
               status, created_at
        FROM orders
        ORDER BY id
        """
    )

    orders = cursor.fetchall()

    cursor.close()
    connection.close()

    return [
        {
            "id": row[0],
            "user_id": row[1],
            "product_id": row[2],
            "quantity": row[3],
            "unit_price": float(row[4]),
            "total_price": float(row[5]),
            "currency": row[6],
            "status": row[7],
            "created_at": row[8]
        }
        for row in orders
    ]


@app.get("/orders/{order_id}")
def get_order(order_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, user_id, product_id, quantity,
               unit_price, total_price, currency,
               status, created_at
        FROM orders
        WHERE id = %s
        """,
        (order_id,)
    )

    order = cursor.fetchone()

    cursor.close()
    connection.close()

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return {
        "id": order[0],
        "user_id": order[1],
        "product_id": order[2],
        "quantity": order[3],
        "unit_price": float(order[4]),
        "total_price": float(order[5]),
        "currency": order[6],
        "status": order[7],
        "created_at": order[8]
    }


@app.put("/orders/{order_id}")
def update_order(order_id: int, order: OrderUpdate):
    if order.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE orders
        SET quantity = %s,
            total_price = unit_price * %s,
            status = %s
        WHERE id = %s
        RETURNING id, user_id, product_id, quantity,
                  unit_price, total_price, currency,
                  status, created_at
        """,
        (
            order.quantity,
            order.quantity,
            order.status,
            order_id
        )
    )

    updated_order = cursor.fetchone()

    if updated_order is None:
        connection.rollback()
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": updated_order[0],
        "user_id": updated_order[1],
        "product_id": updated_order[2],
        "quantity": updated_order[3],
        "unit_price": float(updated_order[4]),
        "total_price": float(updated_order[5]),
        "currency": updated_order[6],
        "status": updated_order[7],
        "created_at": updated_order[8]
    }


@app.delete("/orders/{order_id}")
def delete_order(order_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM orders
        WHERE id = %s
        RETURNING id
        """,
        (order_id,)
    )

    deleted_order = cursor.fetchone()

    if deleted_order is None:
        connection.rollback()
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Order deleted successfully",
        "order_id": deleted_order[0]
    }
