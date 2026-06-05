import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def flag_compliance_sections():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cursor = conn.cursor()
    
    print("🔍 Scanning database for startup compliance requirements...")
    
    # Flag sections containing critical startup/tech action words
    cursor.execute("""
        UPDATE clauses 
        SET requires_compliance = true 
        WHERE content_text ILIKE '%penalty%' 
           OR content_text ILIKE '%punishment%' 
           OR content_text ILIKE '%licence%' 
           OR content_text ILIKE '%retain%' 
           OR content_text ILIKE '%secure%'
           OR content_text ILIKE '%audit%';
    """)
    
    row_count = cursor.rowcount
    conn.commit()
    
    print(f"✅ Success! Flagged {row_count} sections as critical compliance items.")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    flag_compliance_sections()