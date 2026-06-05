import os
import psycopg2
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def patch_missing_clause():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cursor = conn.cursor()

    # Target only the skipped Section 1 record
    cursor.execute("""
        SELECT id, content_text FROM clauses 
        WHERE clause_number = '1' AND ai_description IS NULL LIMIT 1;
    """)
    record = cursor.fetchone()

    if not record:
        print("✅ Section 1 has already been filled or updated!")
        return

    clause_id, raw_text = record
    print("✂️ Slicing massive Section 1 text to bypass free-tier token limits...")
    
    # Take only the first 3000 words (the core short title & commencement mechanics)
    truncated_text = " ".join(raw_text.split()[:3000])

    system_instruction = (
        "You are an expert legal scholar translating complex Indian legislation for everyday citizens. "
        "Summarize the short title, extent, and commencement of this Act based on the text. "
        "Keep your entire answer under 3 clear sentences."
    )

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": truncated_text}
            ],
            temperature=0.1,
            max_tokens=150
        )

        summary = completion.choices[0].message.content.strip()

        cursor.execute("UPDATE clauses SET ai_description = %s WHERE id = %s;", (summary, clause_id))
        conn.commit()
        print("🎉 Success! Section 1 summary has been successfully generated and patched.")

    except Exception as e:
        print(f"❌ Patch failed: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    patch_missing_clause()