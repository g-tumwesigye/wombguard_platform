# supabase_client.py
from supabase import create_client, Client
import os

# Supabase credentials
SUPABASE_URL = "https://tbpvwccscohkpelfswxo.supabase.co"

# Use service role key for admin operations (bypasses RLS)
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicHZ3Y2NzY29oa3BlbGZzd3hvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg5MDA4NSwiZXhwIjoyMDc1NDY2MDg1fQ.aRSQRX3xcE2altXsEqk7JCiEwWlkZS892oWk2RfijbY"

# Initializing Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# test
if __name__ == "__main__":
    try:
        tables = supabase.table("users").select("*").limit(1).execute()
        print("Supabase client initialized successfully!")
        print("Sample data:", tables.data)
    except Exception as e:
        print("Supabase client initialization failed:", str(e))
