import os
import re
import uuid
import psycopg2
import pdfplumber
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def get_or_create_test_ministry(cursor):
    cursor.execute("SELECT id FROM ministries WHERE slug = 'test-ministry'")
    result = cursor.fetchone()
    if result:
        return result[0]
    
    new_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO ministries (id, name, slug)
        VALUES (%s, 'Ministry of Electronics and IT', 'test-ministry')
    """, (new_id,))
    return new_id

def process_and_slice_pdf(filename, act_title, enactment_year):
    filepath = os.path.join("india_code_pdfs", filename)
    
    if not os.path.exists(filepath):
        print(f"❌ Cannot find {filepath}")
        return

    print("📖 Reading PDF...")
    full_text = ""
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text.replace('\n', ' ') + " "

    # Clean up weird spacing
    full_text = re.sub(r'\s+', ' ', full_text)

    print("🔪 Slicing text into sections and extracting titles...")
    sections = re.split(r'\s(?=\d{1,3}[A-Z]?\.\s)', full_text)
    valid_sections = [s.strip() for s in sections if len(s.strip()) > 20]

    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        ministry_id = get_or_create_test_ministry(cursor)
        
        act_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO acts (id, ministry_id, title, enactment_year)
            VALUES (%s, %s, %s, %s)
        """, (act_id, ministry_id, act_title, enactment_year))
        
        for index, section_text in enumerate(valid_sections):
            clause_num = str(index + 1)
            title = None
            content = section_text
            
            # Extract Number, Title, and Description
            # Looks for "43. Title Text.—Description Text"
            match = re.match(r'^(\d{1,3}[A-Z]?)\.\s+(.*)', section_text)
            if match:
                clause_num = match.group(1)
                remainder = match.group(2)
                
                # Split the title from the body using the dot-dash pattern
                parts = re.split(r'\.\s*[—\-]\s*', remainder, maxsplit=1)
                if len(parts) == 2:
                    title = parts[0].strip()
                    content = parts[1].strip()
                else:
                    content = remainder.strip()
            
            cursor.execute("""
                INSERT INTO clauses (act_id, hierarchy_level, clause_number, title, content_text)
                VALUES (%s, 'SECTION', %s, %s, %s)
            """, (act_id, clause_num, title, content))
            
        conn.commit()
        print(f"🎉 Success! Inserted '{act_title}' with titles and descriptions separated.")
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    process_and_slice_pdf("IT_Act_2000.pdf", "The Information Technology Act, 2000 (Final)", 2000)