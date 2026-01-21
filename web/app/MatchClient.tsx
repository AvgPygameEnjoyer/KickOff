'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

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
    'English Premier League': 3,
    'La Liga': 4,
    'Spanish League': 4,
    'Ligue 1': 5,
    'League One': 5,
    'French League': 5,
    'Bundesliga': 6,
    'German League': 6,
    'Serie A': 7,
    'Italian League': 7,
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        <div className="max-w-5xl mx-auto px-4 py-8 relative">
            <header className="mb-12 text-center">
                <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent italic transform -skew-x-12">
                    KICKOFF
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] mt-2">Elite Priority Feed</p>
            </header>

            {/* Dropdown Filter */}
            <div className="mb-12 flex justify-center sticky top-4 z-50 px-4" ref={dropdownRef}>
                <div className="relative w-full max-w-xs group">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full px-6 py-4 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all duration-500 border-2 flex items-center justify-between backdrop-blur-xl ${selectedLeagues.length > 0 || isDropdownOpen
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                    >
                        <span className="flex items-center gap-3">
                            <span className="relative flex h-2 w-2">
                                {selectedLeagues.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${selectedLeagues.length > 0 ? 'bg-emerald-500' : 'bg-slate-700'}`}></span>
                            </span>
                            {selectedLeagues.length === 0
                                ? 'All Leagues'
                                : `${selectedLeagues.length} Selected`}
                        </span>
                        <svg
                            className={`w-4 h-4 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Luxury Dropdown Menu */}
                    <div className={`absolute top-full left-0 right-0 mt-3 p-2 bg-[#0a0f1a]/95 backdrop-blur-2xl border-2 border-slate-800 rounded-2xl shadow-2xl transition-all duration-500 origin-top ${isDropdownOpen
                        ? 'opacity-100 scale-100 pointer-events-auto translate-y-0'
                        : 'opacity-0 scale-95 pointer-events-none -translate-y-4'
                        }`}>
                        <button
                            onClick={() => { setSelectedLeagues([]); setIsDropdownOpen(false); }}
                            className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-800/50 hover:text-white transition-all mb-1 flex items-center justify-between"
                        >
                            Show All Matches
                            {selectedLeagues.length === 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                        </button>
                        <div className="h-px bg-slate-800/50 mx-2 my-2"></div>
                        <div className="max-h-72 overflow-y-auto custom-scrollbar pr-1">
                            {availableLeagues.map((league) => (
                                <button
                                    key={league}
                                    onClick={() => toggleLeague(league)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 flex items-center justify-between group/item ${selectedLeagues.includes(league)
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                        }`}
                                >
                                    <span className="truncate">{league}</span>
                                    {selectedLeagues.includes(league) ? (
                                        <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <span className="text-[8px] opacity-0 group-hover/item:opacity-40 font-mono">#{getLeaguePriority(league)}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <main className="space-y-6">
                {sortedAndFilteredMatches.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900/20 border-2 border-dashed border-slate-800/50 rounded-[2rem]">
                        <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Zero Matches Found</p>
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
