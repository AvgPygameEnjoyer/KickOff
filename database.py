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

def check_if_date_exists(date_str):
    """
    Checks if matches for a given date already exist in the database.
    """
    if not supabase:
        return False

    try:
        response = supabase.table('matches').select('date').eq('date', date_str).limit(1).execute()
        return len(response.data) > 0
    except Exception as e:
        print(f"Error checking existence for {date_str}: {e}")
        return False

def delete_old_matches(date_str):
    """
    Deletes matches with a date strictly less than the provided date_str.
    """
    if not supabase:
        return

    try:
        # Delete matches where date < date_str (e.g., remove yesterday's matches)
        supabase.table('matches').delete().lt('date', date_str).execute()
        print(f"Deleted matches older than {date_str}.")
    except Exception as e:
        print(f"Error deleting old matches: {e}")

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
