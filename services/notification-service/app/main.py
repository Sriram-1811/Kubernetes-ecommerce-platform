from fastapi import FastAPI, HTTPException

from app.database import get_connection
from app.models import NotificationCreate, NotificationUpdate


app = FastAPI(title="Hunger Store Notification Service")


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/notifications")
def create_notification(notification: NotificationCreate):
    connection = get_connection()
    cursor = connection.cursor()

    # Get the user associated with the order.
    cursor.execute(
        """
        SELECT user_id
        FROM orders
        WHERE id = %s
        """,
        (notification.order_id,)
    )

    order = cursor.fetchone()

    if order is None:
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    user_id = order[0]

    # For now, create a simple message based on the notification type.
    message = (
        f"{notification.type} notification for order "
        f"#{notification.order_id}"
    )

    cursor.execute(
        """
        INSERT INTO notifications
            (user_id, order_id, type, message)
        VALUES
            (%s, %s, %s, %s)
        RETURNING id, user_id, order_id, type,
                  message, status, created_at
        """,
        (
            user_id,
            notification.order_id,
            notification.type,
            message
        )
    )

    new_notification = cursor.fetchone()

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": new_notification[0],
        "user_id": new_notification[1],
        "order_id": new_notification[2],
        "type": new_notification[3],
        "message": new_notification[4],
        "status": new_notification[5],
        "created_at": new_notification[6]
    }


@app.get("/notifications")
def get_notifications():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, user_id, order_id, type,
               message, status, created_at
        FROM notifications
        ORDER BY id
        """
    )

    notifications = cursor.fetchall()

    cursor.close()
    connection.close()

    return [
        {
            "id": row[0],
            "user_id": row[1],
            "order_id": row[2],
            "type": row[3],
            "message": row[4],
            "status": row[5],
            "created_at": row[6]
        }
        for row in notifications
    ]


@app.get("/notifications/{notification_id}")
def get_notification(notification_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, user_id, order_id, type,
               message, status, created_at
        FROM notifications
        WHERE id = %s
        """,
        (notification_id,)
    )

    notification = cursor.fetchone()

    cursor.close()
    connection.close()

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {
        "id": notification[0],
        "user_id": notification[1],
        "order_id": notification[2],
        "type": notification[3],
        "message": notification[4],
        "status": notification[5],
        "created_at": notification[6]
    }


@app.put("/notifications/{notification_id}")
def update_notification(
    notification_id: int,
    notification: NotificationUpdate
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE notifications
        SET status = %s
        WHERE id = %s
        RETURNING id, user_id, order_id, type,
                  message, status, created_at
        """,
        (
            notification.status,
            notification_id
        )
    )

    updated_notification = cursor.fetchone()

    if updated_notification is None:
        connection.rollback()
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": updated_notification[0],
        "user_id": updated_notification[1],
        "order_id": updated_notification[2],
        "type": updated_notification[3],
        "message": updated_notification[4],
        "status": updated_notification[5],
        "created_at": updated_notification[6]
    }


@app.delete("/notifications/{notification_id}")
def delete_notification(notification_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM notifications
        WHERE id = %s
        RETURNING id
        """,
        (notification_id,)
    )

    deleted_notification = cursor.fetchone()

    if deleted_notification is None:
        connection.rollback()
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "Notification deleted successfully",
        "notification_id": deleted_notification[0]
    }

