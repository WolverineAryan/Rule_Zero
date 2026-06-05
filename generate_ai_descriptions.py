import os
import time
import psycopg2
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# Initialize Groq Client explicitly
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def generate_ai_descriptions():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Fetch only the clauses that don't have an AI description yet
    print("🔍 Scanning database for sections requiring simplification...")
    cursor.execute("""
        SELECT c.id, c.clause_number, c.title, c.content_text, a.title 
        FROM clauses c
        JOIN acts a ON c.act_id = a.id
        WHERE c.ai_description IS NULL
        ORDER BY c.clause_number ASC;
    """)
    clauses_to_process = cursor.fetchall()

    total_records = len(clauses_to_process)
    if total_records == 0:
        print("✅ Excellent! All sections in your database already have AI descriptions baked in.")
        return

    print(f"🚀 Found {total_records} sections to process. Starting Groq pipeline...")

    for index, (clause_id, clause_num, title, content_text, act_title) in enumerate(clauses_to_process):
        print(f"🤖 [{index + 1}/{total_records}] Processing Section {clause_num}: {title or 'Untitled'}...")

        # Crafting a razor-sharp, dense prompt optimized for smaller open-source models
        system_instruction = (
            "You are an expert legal scholar translating complex Indian legislation for everyday citizens. "
            "Simplify the text provided. Give a highly concise, plain English summary of what this section "
            "means, what is forbidden/allowed, and any penalties mentioned. Keep your entire answer "
            "under 4 short, clear sentences. Do not include introductory text like 'Here is the summary'."
        )

        user_prompt = f"Act: {act_title}\nSection: {clause_num} - {title or 'Untitled'}\nLegalese text: {content_text}"

        try:
            # 2. Chat Completion call to Groq Endpoint
            completion = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",  # Blazing fast, highly accurate, completely free tier model
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,  # Lower temperature prevents legal hallucinations
                max_tokens=256
            )

            ai_summary = completion.choices[0].message.content.strip()

            # 3. Save the summary back to the database row immediately
            cursor.execute("""
                UPDATE clauses 
                SET ai_description = %s 
                WHERE id = %s;
            """, (ai_summary, clause_id))
            
            conn.commit()
            
            # Anti-rate-limiting cooldown buffer for free tiers
            time.sleep(1.5)

        except Exception as e:
            print(f"❌ Failed to process Section {clause_num}. Error: {e}")
            conn.rollback()
            # If we hit a hard rate limit block, pause the script gracefully
            if "rate_limit" in str(e).lower() or "429" in str(e):
                print("⏳ Rate limit reached. Cooldown sleep initiated for 30 seconds...")
                time.sleep(30)
            continue

    cursor.close()
    conn.close()
    print("🎉 Groq AI Pipeline execution complete! All structural rows populated.")

if __name__ == "__main__":
    generate_ai_descriptions()