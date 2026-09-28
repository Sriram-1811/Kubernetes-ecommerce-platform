import psycopg2


def get_connection():
    return psycopg2.connect(
        host="localhost",
        port=5432,
        database="hunger_store",
        user="hunger_store_app",
        password="HungerStore@123"
    )
