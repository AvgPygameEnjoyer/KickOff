from playwright.sync_api import sync_playwright
import datetime
import json
import time

def scrape_matches(date_obj):
    """
    Scrapes football matches for a given date object (datetime.date).
    Returns a list of dictionaries with match details.
    """
    date_str = date_obj.strftime("%Y%m%d")
    url = f"https://www.espn.com/soccer/schedule/_/date/{date_str}"
    
    matches_data = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        print(f"Navigating to {url}...")
        page.goto(url)
        
        # Wait for the main content to load
        try:
            page.wait_for_selector('.Table__Scroller', timeout=10000)
        except Exception as e:
            print(f"Timeout waiting for content on {date_str}: {e}")
            browser.close()
            return []

        # ESPN schedules are grouped by League headers (.Table__Title) inside a .ResponsiveTable container
        # The structure is: div.ResponsiveTable -> div.Table__Title (League) & div.flex -> div.Table__Scroller
        
        responsive_tables = page.query_selector_all('.ResponsiveTable')
        
        for container in responsive_tables:
            league_el = container.query_selector('.Table__Title')
            if not league_el:
                continue
                
            league_name = league_el.inner_text().strip()
            
            # Find the rows inside this container
            rows = container.query_selector_all('tr.Table__TR')
            
            for row in rows:
                try:
                    # Check if it's a header row (contains "match", "time", etc in headers) or just regular row
                    # Usually header rows have th or specific class, but let's check content of first cell/text
                    if "MATCH" in row.inner_text().upper() and "TIME" in row.inner_text().upper():
                        continue
                        
                    # Time is in td.date__col
                    time_el = row.query_selector('td.date__col a.AnchorLink')
                    match_time = time_el.inner_text().strip() if time_el else "FT/TBD"
                    
                    # Home Team: .events__col .Table__Team
                    # Away Team: .colspan__col .Table__Team
                    # We get the text from the parent span, as it contains the anchor with text.
                    
                    home_team_el = row.query_selector('.events__col .Table__Team')
                    away_team_el = row.query_selector('.colspan__col .Table__Team')
                    
                    home_team = home_team_el.inner_text().strip() if home_team_el else "Unknown"
                    away_team = away_team_el.inner_text().strip() if away_team_el else "Unknown"
                    
                    # Only add valid looking matches
                    if home_team != "Unknown" and away_team != "Unknown":
                        matches_data.append({
                            "date": date_str,
                            "league": league_name,
                            "time": match_time,
                            "home_team": home_team,
                            "away_team": away_team
                        })
                except Exception as e:
                    # specific row error, skip
                    continue
        
        browser.close()
        
    return matches_data

def main():
    today = datetime.date.today()
    tomorrow = today + datetime.timedelta(days=1)
    
    dates_to_scrape = [today, tomorrow]
    all_matches = []
    
    print(f"Starting scrape for {today} and {tomorrow}")
    
    for d in dates_to_scrape:
        print(f"Scraping {d}...")
        results = scrape_matches(d)
        print(f"Found {len(results)} matches for {d}")
        all_matches.extend(results)
        
    # Output Results
    print("\n" + "="*40)
    print(f"TOTAL MATCHES FOUND: {len(all_matches)}")
    print("="*40)
    
    # Print first few for verification
    for m in all_matches[:10]:
        print(f"[{m['date']}] {m['time']} - {m['league']}: {m['home_team']} vs {m['away_team']}")
        
    if len(all_matches) > 10:
        print(f"... and {len(all_matches) - 10} more.")

if __name__ == "__main__":
    main()
