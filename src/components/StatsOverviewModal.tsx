import React, { useState } from 'react';
import { X, Trophy, BarChart2, Star, Award, Shield } from 'lucide-react';
import { AvatarConfig, CalendarDay, ClubInfo } from '../types/game';
import { TACA_SAMBA_OPPONENTS, CAMP_NACIONAL_OPPONENTS } from '../data/initialData';
import { playSound } from '../utils/audio';

interface StatsOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: CalendarDay[];
  avatar: AvatarConfig;
  currentClub?: ClubInfo;
}

export const StatsOverviewModal: React.FC<StatsOverviewModalProps> = ({
  isOpen,
  onClose,
  days,
  avatar,
  currentClub,
}) => {
  const [tab, setTab] = useState<'standings' | 'player'>('standings');
  const [selectedComp, setSelectedComp] = useState<'TACA_SAMBA' | 'CAMP_NACIONAL'>('TACA_SAMBA');

  if (!isOpen) return null;

  const playedMatches = days.filter((d) => d.type === 'MATCH' && d.status === 'COMPLETED');
  const totalGoals = playedMatches.reduce((acc, d) => acc + (d.matchStats?.playerGoals || 0), 0);
  const totalAssists = playedMatches.reduce((acc, d) => acc + (d.matchStats?.playerAssists || 0), 0);
  const avgRating =
    playedMatches.length > 0
      ? (
          playedMatches.reduce((acc, d) => acc + (d.matchStats?.playerRating || 6.0), 0) /
          playedMatches.length
        ).toFixed(1)
      : '6.5';

  // Opponents change completely per championship!
  const currentOpponents =
    selectedComp === 'TACA_SAMBA' ? TACA_SAMBA_OPPONENTS : CAMP_NACIONAL_OPPONENTS;

  const compMatches = playedMatches.filter(
    (m) =>
      (selectedComp === 'TACA_SAMBA' && m.competition === 'Taça Samba') ||
      (selectedComp === 'CAMP_NACIONAL' && m.competition === 'Campeonato Nacional')
  );

  const heroWins = compMatches.filter(
    (m) => (m.matchStats?.homeScore || 0) > (m.matchStats?.awayScore || 0)
  ).length;
  const heroDraws = compMatches.filter(
    (m) => (m.matchStats?.homeScore || 0) === (m.matchStats?.awayScore || 0)
  ).length;
  const heroLosses = compMatches.filter(
    (m) => (m.matchStats?.homeScore || 0) < (m.matchStats?.awayScore || 0)
  ).length;

  const heroClubName = currentClub?.name || 'Manaus Gold';
  const heroClubBadge = currentClub?.badge || '👑';

  const allTeams = [
    {
      name: heroClubName,
      badge: heroClubBadge,
      isHero: true,
      p: compMatches.length,
      w: heroWins,
      d: heroDraws,
      l: heroLosses,
      pts: heroWins * 3 + heroDraws,
    },
    ...currentOpponents
      .filter((opp) => opp.name !== heroClubName)
      .map((opp, idx) => {
        const p = Math.max(1, compMatches.length);
        const w = Math.max(0, Math.floor(opp.ovr / 16 - (idx % 3)));
        const d = idx % 2;
        const l = Math.max(0, p - w - d);
        return {
          name: opp.name,
          badge: opp.badge,
          isHero: false,
          p,
          w,
          d,
          l,
          pts: w * 3 + d,
        };
      }),
  ].sort((a, b) => b.pts - a.pts);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-[#0A1225] border border-blue-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-blue-500/20">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <BarChart2 className="w-5 h-5" />
            </span>
            <h2 className="font-heading text-lg font-bold text-amber-400">
              TABELA & ESTATÍSTICAS
            </h2>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-1">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setTab('standings');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              tab === 'standings' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Classificação por Campeonato
          </button>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setTab('player');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              tab === 'player' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Estatísticas do Seu Atleta
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {tab === 'standings' ? (
            <div className="flex flex-col gap-3">
              {/* Championship Switcher: The teams change completely! */}
              <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setSelectedComp('TACA_SAMBA');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-heading font-black transition-all ${
                    selectedComp === 'TACA_SAMBA'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Taça Samba (10 Clubes Regionais)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setSelectedComp('CAMP_NACIONAL');
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-heading font-black transition-all ${
                    selectedComp === 'CAMP_NACIONAL'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Campeonato Nacional (Novos Clubes)
                </button>
              </div>

              {/* Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-3 py-2 bg-slate-800/60 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold text-amber-300">
                    {selectedComp === 'TACA_SAMBA' ? 'Taça Samba · 9 Partidas' : 'Campeonato Nacional · 18 Partidas'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {allTeams.length} Clubes Participantes
                  </span>
                </div>
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 z-10 bg-slate-800 text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3 text-left">#</th>
                        <th className="py-2.5 px-3 text-left">Clube</th>
                        <th className="py-2.5 px-2 text-center">J</th>
                        <th className="py-2.5 px-2 text-center">V</th>
                        <th className="py-2.5 px-2 text-center">E</th>
                        <th className="py-2.5 px-2 text-center">D</th>
                        <th className="py-2.5 px-3 text-right font-bold text-amber-400">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {allTeams.map((team, idx) => (
                        <tr
                          key={team.name}
                          className={team.isHero ? 'bg-amber-500/15 font-bold border-y border-amber-500/30' : 'hover:bg-slate-800/40'}
                        >
                          <td className="py-2 px-3 font-mono text-slate-400">
                            <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold ${
                              idx < 4 ? 'bg-blue-600/30 text-blue-300' : 'text-slate-400'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-2 px-3 flex items-center gap-2">
                            <span className="text-sm">{team.badge}</span>
                            <span className={team.isHero ? 'text-amber-300 font-black' : 'text-white'}>
                              {team.name}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center font-mono">{team.p}</td>
                          <td className="py-2 px-2 text-center font-mono text-emerald-400">{team.w}</td>
                          <td className="py-2 px-2 text-center font-mono text-slate-400">{team.d}</td>
                          <td className="py-2 px-2 text-center font-mono text-rose-400">{team.l}</td>
                          <td className="py-2 px-3 text-right font-mono font-black text-amber-400 text-sm">
                            {team.pts}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow">
                    #{avatar.number || 9}
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-base text-white">
                      {avatar.name || 'Gabriel M.'}
                    </h4>
                    <span className="text-xs text-amber-400 font-bold">Atacante Titular · Manaus Gold</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black font-heading text-amber-300">59 OVR</div>
                  <span className="text-[10px] text-slate-400">Potencial 88+</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Partidas</span>
                  <div className="font-heading font-black text-xl text-white font-mono mt-1">
                    {playedMatches.length}
                  </div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Gols Marcados</span>
                  <div className="font-heading font-black text-xl text-amber-400 font-mono mt-1">
                    ⚽ {totalGoals}
                  </div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Assistências</span>
                  <div className="font-heading font-black text-xl text-blue-400 font-mono mt-1">
                    🎯 {totalAssists}
                  </div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-slate-400 uppercase">Nota Média</span>
                  <div className="font-heading font-black text-xl text-emerald-400 font-mono mt-1">
                    ★ {avgRating}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-bold text-white"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
