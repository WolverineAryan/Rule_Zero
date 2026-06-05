import os
import time
import uuid
import requests
import psycopg2
import pdfplumber
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from dotenv import load_dotenv

# 1. Load environment variables from the .env file securely
load_dotenv()

# Create a folder to store downloaded PDFs locally
os.makedirs("india_code_pdfs", exist_ok=True)

# 2. Database Connection (Using Neon Cloud)
def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL not found. Please check your .env file.")
    return psycopg2.connect(db_url)

# Helper function to prevent Foreign Key constraint errors during testing
def get_or_create_test_ministry():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM ministries WHERE slug = 'test-ministry'")
        result = cursor.fetchone()
        if result:
            return result[0] # Return existing ID
        
        # If it doesn't exist, create a dummy ministry for our test data
        new_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO ministries (id, name, slug, website_url)
            VALUES (%s, 'Test Ministry', 'test-ministry', 'https://example.gov.in')
        """, (new_id,))
        conn.commit()
        return new_id
    finally:
        cursor.close()
        conn.close()

# 3. Database Insertion Logic
def insert_act_to_db(ministry_id, act_title, original_pdf_url, parsed_text):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Generate a UUID for the new act
        act_id = str(uuid.uuid4())
        
        print(f"Saving '{act_title}' to the cloud database...")
        
        # Insert into the 'acts' table
        cursor.execute("""
            INSERT INTO acts (id, ministry_id, title, original_pdf_url)
            VALUES (%s, %s, %s, %s)
        """, (act_id, ministry_id, act_title, original_pdf_url))
        
        # Insert the raw parsed text into the 'clauses' table
        cursor.execute("""
            INSERT INTO clauses (act_id, hierarchy_level, clause_number, content_text)
            VALUES (%s, 'FULL_TEXT', '1', %s)
        """, (act_id, parsed_text))
        
        # Commit the transaction
        conn.commit()
        print(f"✅ Successfully saved '{act_title}' to the database!")
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()
        
# 4. Scraper Logic
def scrape_with_zenrows(act_url):
    print(f"Sending the bulldozer to: {act_url}")
    
    # Get your ZenRows key
    apikey = os.getenv("ZENROWS_API_KEY")
    if not apikey:
        print("❌ Error: ZENROWS_API_KEY not found in .env file.")
        return None, []

    # The ZenRows API endpoint
    api_url = "https://api.zenrows.com/v1/"
    
    # We pass 'antibot=true' to specifically tell ZenRows to crush the Akamai firewall
    params = {
        "url": act_url,
        "apikey": apikey,
        "js_render": "true",
        "antibot": "true"
    }
    
    try:
        # This single line replaces 30 lines of Playwright code!
        response = requests.get(api_url, params=params)
        
        if response.status_code != 200:
            print(f"❌ Scraping API failed. Status: {response.status_code}")
            print(f"Response: {response.text}")
            return None, []
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract Act Metadata
        act_title = "Unknown Title"
        title_element = soup.find('h2', class_='page-header')
        
        if title_element:
            act_title = title_element.text.strip()
        elif soup.title:
            act_title = soup.title.text.replace("India Code:", "").strip()
            
        print(f"✅ Found Act: {act_title}")

        # Find PDF Links
        pdf_links = []
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')
            if '/bitstream/' in href:
                full_url = f"https://www.indiacode.nic.in{href}"
                if full_url not in pdf_links:
                    pdf_links.append(full_url)
                    
        return act_title, pdf_links
        
    except Exception as e:
        print(f"❌ Request error: {e}")
        return None, []
# 5. PDF Download and Parsing Logic
def download_and_parse_pdf(pdf_url, filename):
    filepath = os.path.join("india_code_pdfs", f"{filename}.pdf")
    
    print(f"Downloading PDF from {pdf_url}...")
    response = requests.get(pdf_url, stream=True)
    
    if response.status_code == 200:
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print("Download complete.")
        
        print("Extracting text...")
        extracted_text = ""
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
                    
        return extracted_text
    else:
        print(f"Failed to download. Status code: {response.status_code}")
        return None
# --- Main Execution Pipeline ---
if __name__ == "__main__":
    # The Information Technology Act, 2000
    sample_act_url = "https://www.indiacode.nic.in/handle/123456789/1999"
    
    test_ministry_id = get_or_create_test_ministry()
    
    # Call the new ZenRows function!
    title, links = scrape_with_zenrows(sample_act_url)
    
    if links:
        print(f"Found {len(links)} document links! Grabbing the first one...")
        raw_text = download_and_parse_pdf(links[0], "sample_act")
        
        if raw_text:
            print("\n--- Extracted Text Snippet ---")
            print(raw_text[:300] + "...\n") 
            
            insert_act_to_db(
                ministry_id=test_ministry_id,
                act_title=title,
                original_pdf_url=links[0],
                parsed_text=raw_text
            )
        else:
            print("Failed to extract text from the PDF.")
    else:
        print("No PDF links found. The HTML might have changed, or the Act has no PDFs attached.")