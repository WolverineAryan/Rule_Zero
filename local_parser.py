import os
import uuid
import psycopg2
import pdfplumber
from dotenv import load_dotenv

# Load your Neon database URL
load_dotenv()

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    return psycopg2.connect(db_url)

def get_or_create_test_ministry():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM ministries WHERE slug = 'test-ministry'")
        result = cursor.fetchone()
        if result:
            return result[0]
        
        new_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO ministries (id, name, slug)
            VALUES (%s, 'Ministry of Electronics and IT', 'test-ministry')
        """, (new_id,))
        conn.commit()
        return new_id
    finally:
        cursor.close()
        conn.close()

def insert_act_to_db(ministry_id, act_title, enactment_year, parsed_text):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        act_id = str(uuid.uuid4())
        
        # Insert Act
        cursor.execute("""
            INSERT INTO acts (id, ministry_id, title, enactment_year)
            VALUES (%s, %s, %s, %s)
        """, (act_id, ministry_id, act_title, enactment_year))
        
        # Insert Text
        cursor.execute("""
            INSERT INTO clauses (act_id, hierarchy_level, clause_number, content_text)
            VALUES (%s, 'FULL_TEXT', '1', %s)
        """, (act_id, parsed_text))
        
        conn.commit()
        print(f"✅ Successfully saved '{act_title}' to your Neon database!")
    except Exception as e:
        print(f"❌ Database error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

def parse_local_pdf(filename, act_title):
    filepath = os.path.join("india_code_pdfs", filename)
    
    if not os.path.exists(filepath):
        print(f"❌ Cannot find the file: {filepath}")
        print("Make sure you downloaded it and put it in the 'india_code_pdfs' folder!")
        return
        
    print(f"Extracting text from {filename}...")
    extracted_text = ""
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
                
    if extracted_text:
        print("Text extracted! Pushing to database...")
        ministry_id = get_or_create_test_ministry()
        insert_act_to_db(ministry_id, act_title, "2000", extracted_text)
    else:
        print("Failed to extract text. The PDF might be a scanned image.")

if __name__ == "__main__":
    # Make sure you downloaded the PDF and named it "IT_Act_2000.pdf"
    parse_local_pdf("IT_Act_2000.pdf", "The Information Technology Act, 2000")