import { supabase } from '@/utils/supabase/client';
import MatchClient from './MatchClient';

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

export default async function Home() {
  const matches = await getMatches();

  return (
    <main className="min-h-screen bg-[#05070a] text-white font-sans selection:bg-emerald-500/30">
      <MatchClient initialMatches={matches} />
    </main>
  );
}
