import { supabase } from '@/utils/supabase/client';

export const revalidate = 60; // Revalidate every 60 seconds

async function getMatches() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
  return matches || [];
}

const LEAGUE_PRIORITY: Record<string, number> = {
  'Premier League': 1,
  'UEFA Champions League': 2,
  'Champions League': 2,
  'UEFA Europa League': 3,
  'Europa League': 3,
  'La Liga': 4,
  'Bundesliga': 5,
  'Serie A': 6,
  'Ligue 1': 7,
  'FA Cup': 8,
  'Carabao Cup': 9,
};

function getLeaguePriority(leagueName: string): number {
  // Try to find a match in our priority map
  for (const [key, priority] of Object.entries(LEAGUE_PRIORITY)) {
    if (leagueName.toLowerCase().includes(key.toLowerCase())) {
      return priority;
    }
  }
  return 999; // Default for unknown leagues
}

function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

export default async function Home() {
  const matches = await getMatches();

  // Group matches by League
  const matchesByLeague = matches.reduce((acc: any, match: any) => {
    const league = match.league;
    if (!acc[league]) {
      acc[league] = [];
    }
    acc[league].push(match);
    return acc;
  }, {});

  // Sort leagues by priority
  const sortedLeagues = Object.keys(matchesByLeague).sort((a, b) => {
    const priorityA = getLeaguePriority(a);
    const priorityB = getLeaguePriority(b);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return a.localeCompare(b);
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-16 text-center">
          <h1 className="text-6xl font-black tracking-tighter mb-4 bg-gradient-to-br from-white via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            KICKOFF
          </h1>
          <p className="text-slate-400 text-xl font-medium tracking-wide uppercase">Elite Football Tracker</p>
        </header>

        <div className="space-y-16">
          {sortedLeagues.length === 0 ? (
            <div className="text-center py-24 bg-slate-900/40 rounded-[3rem] border border-slate-800/50 backdrop-blur-xl">
              <div className="mb-4 text-slate-700 text-6xl">⚽</div>
              <p className="text-slate-500 text-xl font-medium">No matches scheduled at the moment.</p>
            </div>
          ) : (
            sortedLeagues.map((league) => (
              <section key={league} className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex items-center gap-6 mb-8 group">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-slate-800"></div>
                  <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                    <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                    {league}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-800 to-slate-800"></div>
                </div>

                <div className="grid gap-6">
                  {/* Subsection: Group by Date within League or just list? The user wanted subsections. Let's group by date as subsections */}
                  {Array.from(new Set(matchesByLeague[league].map((m: any) => m.date))).sort().map((date: any) => (
                    <div key={date} className="space-y-4">
                      <h3 className="text-xs font-bold text-emerald-500/70 uppercase tracking-[0.2em] ml-2">
                        {formatDate(date)}
                      </h3>
                      <div className="grid gap-3">
                        {matchesByLeague[league]
                          .filter((m: any) => m.date === date)
                          .map((match: any) => {
                            const isFinished = match.time.includes('FT');
                            const isLive = match.time.includes("'") || match.time.includes('HT');

                            return (
                              <div
                                key={match.id}
                                className="group relative bg-slate-900/40 hover:bg-slate-800/60 backdrop-blur-md border border-slate-800/50 hover:border-emerald-500/50 rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5 overflow-hidden"
                              >
                                {/* Decorative Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                                  {/* Home Team */}
                                  <div className="flex-1 flex items-center justify-end gap-6 w-full md:w-auto">
                                    <span className="font-extrabold text-xl md:text-2xl text-right text-slate-100 group-hover:text-emerald-300 transition-colors drop-shadow-sm">
                                      {match.home_team}
                                    </span>
                                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-xl border border-slate-700/50 group-hover:scale-110 transition-transform duration-500">
                                      🛡️
                                    </div>
                                  </div>

                                  {/* Center Info / Status */}
                                  <div className="flex flex-col items-center gap-2">
                                    <div className={`px-6 py-2 rounded-full border transition-all duration-500 ${isLive
                                        ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse'
                                        : isFinished
                                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                                          : 'bg-slate-800/50 text-emerald-400 border-emerald-900/50 group-hover:border-emerald-500/50'
                                      }`}>
                                      <span className="font-mono font-black text-lg">
                                        {match.time}
                                      </span>
                                    </div>
                                    {isLive && (
                                      <span className="text-[10px] font-bold uppercase tracking-tighter text-red-500">Live</span>
                                    )}
                                  </div>

                                  {/* Away Team */}
                                  <div className="flex-1 flex items-center justify-start gap-6 w-full md:w-auto">
                                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl shadow-xl border border-slate-700/50 group-hover:scale-110 transition-transform duration-500">
                                      ⚔️
                                    </div>
                                    <span className="font-extrabold text-xl md:text-2xl text-left text-slate-100 group-hover:text-cyan-300 transition-colors drop-shadow-sm">
                                      {match.away_team}
                                    </span>
                                  </div>
                                </div>

                                {/* Match Subsections */}
                                <div className="mt-6 pt-6 border-t border-slate-800/50 grid grid-cols-3 gap-4 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                                  <button className="flex flex-col items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-slate-700/30 transition-colors group/sub">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover/sub:text-emerald-500 transition-colors">Preview</span>
                                    <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Match Hub</span>
                                  </button>
                                  <button className="flex flex-col items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-slate-700/30 transition-colors group/sub">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover/sub:text-cyan-500 transition-colors">Insights</span>
                                    <span className="text-xs text-slate-300 font-medium whitespace-nowrap">AI Forecast</span>
                                  </button>
                                  <button className="flex flex-col items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-slate-700/30 transition-colors group/sub">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover/sub:text-purple-500 transition-colors">Legacy</span>
                                    <span className="text-xs text-slate-300 font-medium whitespace-nowrap">H2H Stats</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
