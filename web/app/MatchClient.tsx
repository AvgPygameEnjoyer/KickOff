'use client';

import { useState, useMemo } from 'react';

function formatDate(dateString: string) {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
};

function getLeaguePriority(leagueName: string): number {
    for (const [key, priority] of Object.entries(LEAGUE_PRIORITY)) {
        if (leagueName.toLowerCase().includes(key.toLowerCase())) {
            return priority;
        }
    }
    return 999;
}

export default function MatchLayout({ initialMatches }: { initialMatches: any[] }) {
    const [activeLeague, setActiveLeague] = useState<string | null>(null);

    // Group matches by League
    const matchesByLeague = useMemo(() => {
        return initialMatches.reduce((acc: any, match: any) => {
            const league = match.league;
            if (!acc[league]) {
                acc[league] = [];
            }
            acc[league].push(match);
            return acc;
        }, {});
    }, [initialMatches]);

    // Sort leagues by priority
    const sortedLeagues = useMemo(() => {
        const leagues = Object.keys(matchesByLeague).sort((a, b) => {
            const priorityA = getLeaguePriority(a);
            const priorityB = getLeaguePriority(b);
            if (priorityA !== priorityB) return priorityA - priorityB;
            return a.localeCompare(b);
        });

        // Set initial active league if not set
        if (!activeLeague && leagues.length > 0) {
            setActiveLeague(leagues[0]);
        }

        return leagues;
    }, [matchesByLeague, activeLeague]);

    const currentLeaguesMatches = activeLeague ? matchesByLeague[activeLeague] : [];

    // Subsections: group current league's matches by date
    const matchesByDate = useMemo(() => {
        return currentLeaguesMatches.reduce((acc: any, match: any) => {
            const date = match.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(match);
            return acc;
        }, {});
    }, [currentLeaguesMatches]);

    const sortedDates = Object.keys(matchesByDate).sort();

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Skeleton Top: KickOff Title */}
            <header className="mb-12 text-center">
                <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent italic transform -skew-x-12">
                    KICKOFF
                </h1>
            </header>

            {/* Skeleton Mid: League Tabs (PREM, OTT etc) */}
            <nav className="mb-12">
                <div className="flex flex-wrap justify-center gap-3">
                    {sortedLeagues.map((league) => (
                        <button
                            key={league}
                            onClick={() => setActiveLeague(league)}
                            className={`px-6 py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 border-2 ${activeLeague === league
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                                }`}
                        >
                            {league.replace('Premier League', 'PREM').replace('UEFA ', '').slice(0, 15)}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Skeleton Content: Match Cards (T1 VS T2 with Time/Date at top) */}
            <main className="space-y-12">
                {sortedDates.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                        <p className="text-slate-500 font-medium">Select a league to view matches</p>
                    </div>
                ) : (
                    sortedDates.map((date) => (
                        <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em] bg-emerald-500/10 px-3 py-1 rounded">
                                    {formatDate(date)}
                                </span>
                                <div className="h-px flex-1 bg-slate-800"></div>
                            </div>

                            <div className="grid gap-4">
                                {matchesByDate[date].map((match: any) => (
                                    <div
                                        key={match.id}
                                        className="group bg-[#0a0f1a] border-2 border-slate-800/80 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-500 shadow-xl"
                                    >
                                        {/* Top Row: Time and Date as per skeleton */}
                                        <div className="bg-slate-900/50 px-6 py-3 flex justify-between items-center border-b border-slate-800/50">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                                {match.time.includes('FT') ? 'Full Time' : match.time.includes("'") ? 'Live' : 'Scheduled'}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-emerald-400 font-mono font-bold text-sm">{match.time}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                                                <span className="text-xs font-medium text-slate-500">{formatDate(match.date)}</span>
                                            </div>
                                        </div>

                                        {/* Main Section: T1 VS T2 */}
                                        <div className="p-8 flex items-center justify-between gap-4">
                                            <div className="flex-1 flex flex-col items-center gap-4 group/team">
                                                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-slate-700 group-hover/team:scale-110 group-hover/team:rotate-3 transition-transform duration-500">
                                                    🛡️
                                                </div>
                                                <span className="font-black text-xl md:text-2xl text-slate-100 text-center tracking-tight">
                                                    {match.home_team}
                                                </span>
                                            </div>

                                            <div className="flex flex-col items-center gap-2">
                                                <div className="px-4 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700">
                                                    <span className="text-slate-500 font-black italic">VS</span>
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col items-center gap-4 group/team">
                                                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-slate-700 group-hover/team:scale-110 group-hover/team:-rotate-3 transition-transform duration-500">
                                                    ⚔️
                                                </div>
                                                <span className="font-black text-xl md:text-2xl text-slate-100 text-center tracking-tight">
                                                    {match.away_team}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Subsections: Hover details */}
                                        <div className="max-h-0 group-hover:max-h-24 overflow-hidden transition-all duration-500 ease-in-out">
                                            <div className="px-6 pb-6 pt-2 grid grid-cols-3 gap-3">
                                                <button className="py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                                                    Highlights
                                                </button>
                                                <button className="py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                                                    Squads
                                                </button>
                                                <button className="py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-purple-400 hover:border-purple-500/30 transition-all">
                                                    Timeline
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}
