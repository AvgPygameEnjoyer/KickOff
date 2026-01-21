'use client';

import { useState, useMemo } from 'react';

function formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

const LEAGUE_PRIORITY: Record<string, number> = {
    'Champions League': 1,
    'UEFA Champions League': 1,
    'Europa League': 2,
    'UEFA Europa League': 2,
    'Premier League': 3,
    'La Liga': 4,
    'Bundesliga': 5,
    'Ligue 1': 6,
    'League One': 6,
    'Serie A': 7,
    'Italian League': 7,
    'Portuguese League': 8,
    'Liga Portugal': 8,
};

function getLeaguePriority(leagueName: string): number {
    for (const [key, priority] of Object.entries(LEAGUE_PRIORITY)) {
        if (leagueName.toLowerCase().includes(key.toLowerCase())) {
            return priority;
        }
    }
    return 999;
}

export default function MatchClient({ initialMatches }: { initialMatches: any[] }) {
    const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);

    const sortedAndFilteredMatches = useMemo(() => {
        let matches = [...initialMatches];

        if (selectedLeagues.length > 0) {
            matches = matches.filter(m => selectedLeagues.includes(m.league));
        }

        return matches.sort((a, b) => {
            const priorityA = getLeaguePriority(a.league);
            const priorityB = getLeaguePriority(b.league);

            if (priorityA !== priorityB) return priorityA - priorityB;
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });
    }, [initialMatches, selectedLeagues]);

    const availableLeagues = useMemo(() => {
        const leagues = Array.from(new Set(initialMatches.map(m => m.league)));
        return leagues.sort((a, b) => getLeaguePriority(a) - getLeaguePriority(b));
    }, [initialMatches]);

    const toggleLeague = (league: string) => {
        setSelectedLeagues(prev =>
            prev.includes(league)
                ? prev.filter(l => l !== league)
                : [...prev, league]
        );
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <header className="mb-12 text-center">
                <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent italic transform -skew-x-12">
                    KICKOFF
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Elite Priority Feed</p>
            </header>

            <nav className="mb-12">
                <div className="flex flex-wrap justify-center gap-2">
                    <button
                        onClick={() => setSelectedLeagues([])}
                        className={`px-4 py-2 rounded-lg font-bold text-[10px] tracking-widest uppercase transition-all duration-300 border ${selectedLeagues.length === 0
                                ? 'bg-white text-slate-950 border-white'
                                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        All Matches
                    </button>
                    <div className="w-px h-8 bg-slate-800 self-center mx-2 hidden sm:block"></div>
                    {availableLeagues.map((league) => (
                        <button
                            key={league}
                            onClick={() => toggleLeague(league)}
                            className={`px-4 py-2 rounded-lg font-bold text-[10px] tracking-widest uppercase transition-all duration-300 border ${selectedLeagues.includes(league)
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                                }`}
                        >
                            {league.replace('Premier League', 'PREM').replace('UEFA ', '').slice(0, 15)}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="space-y-6">
                {sortedAndFilteredMatches.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                        <p className="text-slate-500 font-medium">No matches found for the selected filters.</p>
                    </div>
                ) : (
                    sortedAndFilteredMatches.map((match: any) => (
                        <div
                            key={match.id}
                            className="group bg-[#0a0f1a] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-500 shadow-lg"
                        >
                            <div className="bg-slate-900/30 px-6 py-3 flex justify-between items-center border-b border-slate-800/50">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                    {match.league}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-white font-mono font-bold text-sm tracking-tighter">{match.time}</span>
                                    <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{formatDate(match.date)}</span>
                                </div>
                            </div>

                            <div className="p-6 md:p-10 flex items-center justify-between gap-4">
                                <div className="flex-1 flex flex-col md:flex-row items-center justify-end gap-4 text-right">
                                    <span className="font-black text-lg md:text-2xl text-slate-100 tracking-tight order-2 md:order-1">
                                        {match.home_team}
                                    </span>
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-xl flex items-center justify-center text-2xl md:text-3xl border border-slate-700 order-1 md:order-2 group-hover:scale-110 transition-transform">
                                        🛡️
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black italic text-slate-600">
                                        VS
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col md:flex-row items-center justify-start gap-4 text-left">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-xl flex items-center justify-center text-2xl md:text-3xl border border-slate-700 group-hover:scale-110 transition-transform">
                                        ⚔️
                                    </div>
                                    <span className="font-black text-lg md:text-2xl text-slate-100 tracking-tight">
                                        {match.away_team}
                                    </span>
                                </div>
                            </div>

                            <div className="max-h-0 group-hover:max-h-16 overflow-hidden transition-all duration-500 ease-in-out border-t border-slate-800/50 bg-slate-900/10">
                                <div className="px-6 py-3 flex justify-center gap-8">
                                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-400 transition-colors">Highlights</button>
                                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-cyan-400 transition-colors">Squads</button>
                                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-purple-400 transition-colors">Timeline</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}
