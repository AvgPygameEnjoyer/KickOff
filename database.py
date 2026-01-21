import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env
load_dotenv()

# Fetch variables
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

# Initialize Supabase client
# We strictly use the provided architecture.
# Note: Client creation might fail if url/key are None, but we handle that in usage or let it error if critical.
supabase: Client = None
if url and key:
    try:
        supabase = create_client(url, key)
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")

def upsert_matches(matches_data):
    """
    Upserts a list of match dictionaries into the 'matches' table using Supabase client.
    """
    if not matches_data:
        print("No matches to save.")
        return

    if not supabase:
        print("Supabase client is not initialized. Check your .env file.")
        return

    try:
        # Supabase upsert automatically handles conflict on primary key / unique constraints.
        # Ensure your table has the appropriate unique constraint (date, home_team, away_team).
        response = supabase.table('matches').upsert(matches_data).execute()
        
        # response.data contains the inserted/updated rows
        print(f"Successfully upserted matches to Database.")
            
    except Exception as e:
        print(f"Error saving to Database: {e}")

# Main block for testing connection
if __name__ == "__main__":
    print("Testing Supabase connection...")
    if supabase:
        try:
            # Simple query to verify connection, assuming 'matches' table exists or just checking client.
            # We can't easily run "SELECT NOW()" with the client unless we use rpc or query a table.
            # We'll just verify the client object exists and maybe try a lightweight fetch if table is known.
            print("Supabase client initialized successfully.")
            print(f"URL: {url}")
            
            # Optional: Try listing one item to verify permissions if table exists
            # response = supabase.table('matches').select("*").limit(1).execute()
            # print("Query check:", response)
            
        except Exception as e:
            print(f"Connection test failed: {e}")
    else:
        print("Supabase client not initialized.")
