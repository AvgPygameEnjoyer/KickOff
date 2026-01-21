import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from a .env file if present
load_dotenv()

def get_supabase_client() -> Client:
    url = os.environ.get("PROJECT_URL")
    key = os.environ.get("API_KEY")
    
    if not url or not key:
        print("Warning: PROJECT_URL or API_KEY not set. Database operations will fail.")
        return None

    return create_client(url, key)

def upsert_matches(matches_data):
    """
    Upserts a list of match dictionaries into the 'matches' table.
    We assume the table has a unique constraint on (date, home_team, away_team).
    """
    supabase = get_supabase_client()
    if not supabase:
        print("Skipping database update: Client not initialized.")
        return

    if not matches_data:
        print("No matches to save.")
        return

    try:
        # data=matches_data automatically maps keys to columns
        # on_conflict specified to handle duplicates if needed, though upsert default behavior often suffices
        # if the primary key isn't the conflict target.
        # We'll use the ignore_duplicates=False option which is default (update on conflict).
        response = supabase.table("matches").upsert(matches_data).execute()
        print(f"Successfully upserted {len(matches_data)} matches to Supabase.")
    except Exception as e:
        print(f"Error saving to Supabase: {e}")
