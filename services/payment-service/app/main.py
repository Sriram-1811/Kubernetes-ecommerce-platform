from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.database import get_connection
from app.models import PaymentCreate, PaymentUpdate


app = FastAPI(title="Hunger Store Payment Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://10.2.0.4:5173",
        "http://52.154.129.246:5173",
        ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/payments")
def create_payment(payment: PaymentCreate):
    connection = get_connection()
    cursor = connection.cursor()

    # Get the order amount and currency from the orders table.
    cursor.execute(
        """
        SELECT total_price, currency
        FROM orders
        WHERE id = %s
        """,
        (payment.order_id,)
    )

    order = cursor.fetchone()

    if order is None:
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    amount = order[0]
    currency = order[1]

    # Create the payment using the order's amount and currency.
    cursor.execute(
        """
        INSERT INTO payments
            (order_id, amount, currency, payment_method)
        VALUES
            (%s, %s, %s, %s)
        RETURNING id, order_id, amount, currency,
                  payment_method, status, created_at
        """,
        (
            payment.order_id,
            amount,
            currency,
            payment.payment_method
        )
    )

    new_payment = cursor.fetchone()

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": new_payment[0],
        "order_id": new_payment[1],
        "amount": float(new_payment[2]),
        "currency": new_payment[3],
        "payment_method": new_payment[4],
        "status": new_payment[5],
        "created_at": new_payment[6]
    }


@app.get("/payments")
def get_payments():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, order_id, amount, currency,
               payment_method, status, created_at
        FROM payments
        ORDER BY id
        """
    )

    payments = cursor.fetchall()

    cursor.close()
    connection.close()

    return [
        {
            "id": row[0],
            "order_id": row[1],
            "amount": float(row[2]),
            "currency": row[3],
            "payment_method": row[4],
            "status": row[5],
            "created_at": row[6]
        }
        for row in payments
    ]


@app.get("/payments/{payment_id}")
def get_payment(payment_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, order_id, amount, currency,
               payment_method, status, created_at
        FROM payments
        WHERE id = %s
        """,
        (payment_id,)
    )

    payment = cursor.fetchone()

    cursor.close()
    connection.close()

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return {
        "id": payment[0],
        "order_id": payment[1],
        "amount": float(payment[2]),
        "currency": payment[3],
        "payment_method": payment[4],
        "status": payment[5],
        "created_at": payment[6]
    }


@app.put("/payments/{payment_id}")
def update_payment(payment_id: int, payment: PaymentUpdate):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE payments
        SET status = %s
        WHERE id = %s
        RETURNING id, order_id, amount, currency,
                  payment_method, status, created_at
        """,
        (
            payment.status,
            payment_id
        )
    )

    updated_payment = cursor.fetchone()

    if updated_payment is None:
        connection.rollback()
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": updated_payment[0],
        "order_id": updated_payment[1],
        "amount": float(updated_payment[2]),
        "currency": updated_payment[3],
        "payment_method": updated_payment[4],
        "status": updated_payment[5],
        "created_at": updated_payment[6]
    }


@app.delete("/payments/{payment_id}")
def delete_payment(payment_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM payments
        WHERE id = %s
        RETURNING id
        """,
        (payment_id,)
    )

    deleted_payment = cursor.fetchone()

    if deleted_payment is None:
        connection.rollback()
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Payment deleted successfully",
        "payment_id": deleted_payment[0]
    }

