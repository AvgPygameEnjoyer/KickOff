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

function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

export default async function Home() {
  const matches = await getMatches();

  // Group matches by date
  const matchesByDate = matches.reduce((acc: any, match: any) => {
    const date = match.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(match);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            KickOff
          </h1>
          <p className="text-slate-400 text-lg">Your daily football schedule</p>
        </header>

        <div className="space-y-12">
          {Object.keys(matchesByDate).length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
              <p className="text-slate-500 text-xl">No matches found.</p>
            </div>
          ) : (
            Object.keys(matchesByDate).sort().map((date) => (
              <section key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                  <h2 className="text-2xl font-bold text-slate-200 capitalize tracking-wide">
                    {formatDate(date)}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                </div>

                <div className="grid gap-4">
                  {matchesByDate[date].map((match: any) => (
                    <div
                      key={match.id}
                      className="group relative bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-sm border border-slate-800/60 hover:border-emerald-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/10 hover:-translate-y-0.5"
                    >
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* League Badge/Name */}
                        <div className="md:w-1/4 text-center md:text-left">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/50">
                            {match.league}
                          </span>
                        </div>

                        {/* Teams */}
                        <div className="flex-1 flex items-center justify-center gap-8 w-full md:w-auto">
                          <div className="text-right flex-1">
                            <span className="font-bold text-lg md:text-xl text-slate-100 group-hover:text-emerald-300 transition-colors">
                              {match.home_team}
                            </span>
                          </div>
                          <div className="text-slate-500 font-medium text-sm">VS</div>
                          <div className="text-left flex-1">
                            <span className="font-bold text-lg md:text-xl text-slate-100 group-hover:text-cyan-300 transition-colors">
                              {match.away_team}
                            </span>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="md:w-1/4 text-center md:text-right">
                          <span className="text-emerald-400 font-mono font-medium bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-900/50">
                            {match.time}
                          </span>
                        </div>
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
