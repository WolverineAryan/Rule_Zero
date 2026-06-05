import os
import uuid
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def setup_relational_categories():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cursor = conn.cursor()

    print("1️⃣ Cleaning old relational links...")
    cursor.execute("DELETE FROM act_categories;")
    cursor.execute("DELETE FROM categories;")

    print("2️⃣ Injecting official categories...")
    # Generate static UUIDs so we can guarantee the links match perfectly
    tech_id = str(uuid.uuid4())
    cursor.execute("INSERT INTO categories (id, name, slug) VALUES (%s, 'Technology', 'technology');", (tech_id,))
    cursor.execute("INSERT INTO categories (id, name, slug) VALUES (%s, 'Finance & Tax', 'finance');", (str(uuid.uuid4()),))

    print("3️⃣ Fetching your current Acts to link them...")
    cursor.execute("SELECT id, title FROM acts;")
    all_acts = cursor.fetchall()

    if not all_acts:
        print("❌ Zero acts found in your database! Did you delete them all in Prisma Studio?")
        return

    linked_count = 0
    for act_id, title in all_acts:
        print(f"Found Act: '{title}'")
        # Aggressive matching: if it has 'technology' or 'it' anywhere, map it to Technology
        if "technology" in title.lower() or "it act" in title.lower() or "final" in title.lower():
            cursor.execute("""
                INSERT INTO act_categories (act_id, category_id) 
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING;
            """, (act_id, tech_id))
            print(f"🔗 Successfully linked '{title}' -> Technology")
            linked_count += 1

    conn.commit()
    cursor.close()
    conn.close()
    print(f"🎉 Complete! Linked {linked_count} documents to the Technology category.")

if __name__ == "__main__":
    setup_relational_categories()