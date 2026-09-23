import psycopg2

connection = psycopg2.connect(
    host="localhost",
    database="hunger_store",
    user="hunger_store_app",
    password="HungerStore@123"
)

print("Database connection successful!")

connection.close()
