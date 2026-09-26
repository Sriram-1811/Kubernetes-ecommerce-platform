from fastapi import FastAPI, HTTPException
from app.database import get_connection
from app.models import UserCreate, UserUpdate

app = FastAPI(title="User Service")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/users")
def create_user(user: UserCreate):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO users (name, email)
        VALUES (%s, %s)
        RETURNING id, name, email
        """,
        (user.name, user.email)
    )

    new_user = cursor.fetchone()

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": new_user[0],
        "name": new_user[1],
        "email": new_user[2]
    }

@app.put("/users/{user_id}")
def update_user(user_id: int, user: UserUpdate):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE users
        SET name = %s,
            email = %s
        WHERE id = %s
        RETURNING id, name, email
        """,
        (user.name, user.email, user_id)
    )

    updated_user = cursor.fetchone()

    if updated_user is None:
        connection.rollback()
        cursor.close()
        connection.close()
        raise HTTPException(status_code=404, detail="User not found")

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "id": updated_user[0],
        "name": updated_user[1],
        "email": updated_user[2]
    }

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM users
        WHERE id = %s
        RETURNING id, name, email
        """,
        (user_id,)
    )

    deleted_user = cursor.fetchone()

    if deleted_user is None:
        connection.rollback()
        cursor.close()
        connection.close()
        raise HTTPException(status_code=404, detail="User not found")

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": "User deleted successfully",
        "user": {
            "id": deleted_user[0],
            "name": deleted_user[1],
            "email": deleted_user[2]
        }
    }

@app.get("/users")
def get_users():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, name, email
        FROM users
        ORDER BY id
        """
    )

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    users = []

    for row in rows:
        users.append({
            "id": row[0],
            "name": row[1],
            "email": row[2]
        })

    return users

@app.get("/users/{user_id}")
def get_user(user_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id, name, email
        FROM users
        WHERE id = %s
        """,
        (user_id,)
    )

    row = cursor.fetchone()

    cursor.close()
    connection.close()

    if row is None:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": row[0],
        "name": row[1],
        "email": row[2]
    }
