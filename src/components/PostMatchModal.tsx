import React from 'react';
import { MatchStats, OpponentTeam } from '../types/game';
import { Trophy, Check, ArrowRight, Award, Flame, BarChart2 } from 'lucide-react';
import { playSound } from '../utils/audio';

interface PostMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: MatchStats;
  opponent: OpponentTeam;
  isHome: boolean;
  onAdvanceDay: () => void;
}

export const PostMatchModal: React.FC<PostMatchModalProps> = ({
  isOpen,
  onClose,
  stats,
  opponent,
  isHome,
  onAdvanceDay,
}) => {
  if (!isOpen) return null;

  const isWin = stats.homeScore > stats.awayScore;
  const isDraw = stats.homeScore === stats.awayScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] bg-[#0A1225] border border-blue-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-blue-500/20">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </span>
            <h2 className="font-heading text-lg font-bold text-amber-400">
              ESTATÍSTICAS PÓS-JOGO
            </h2>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isWin
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : isDraw
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}
          >
            {isWin ? 'VITÓRIA HISTÓRICA' : isDraw ? 'EMPATE DISPUTADO' : 'DERROTA'}
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          {/* Final Scoreboard Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-black">
                🦁
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Manaus Gold</h4>
                <span className="text-[11px] text-amber-400">Mandante</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="font-heading font-black text-3xl sm:text-4xl text-amber-300">
                {stats.homeScore} - {stats.awayScore}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest">Fim de Jogo</span>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <h4 className="text-sm font-bold text-white">{opponent.name}</h4>
                <span className="text-[11px] text-blue-400">Visitante</span>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold shadow"
                style={{ backgroundColor: opponent.primaryColor, color: opponent.secondaryColor }}
              >
                {opponent.badge}
              </div>
            </div>
          </div>

          {/* Player of the Match Card */}
          <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Desempenho do Seu Jogador
                </div>
                <div className="text-xs text-slate-200">
                  {stats.playerGoals} Gol(s) marcados · {stats.playerAssists} Assistência(s)
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-amber-400 text-xs">★</span>
                <span className="font-heading font-black text-xl text-white font-mono">
                  {stats.playerRating}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Nota da Partida</span>
            </div>
          </div>

          {/* Detailed Match Statistics Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              Comparativo Técnico
            </h3>

            {/* Stat Row Component */}
            {[
              {
                label: 'Posse de Bola',
                home: `${stats.homePossession}%`,
                away: `${stats.awayPossession}%`,
                homeVal: stats.homePossession,
                awayVal: stats.awayPossession,
              },
              {
                label: 'Finalizações (No Alvo)',
                home: `${stats.homeShots} (${stats.homeShotsOnTarget})`,
                away: `${stats.awayShots} (${stats.awayShotsOnTarget})`,
                homeVal: stats.homeShots,
                awayVal: stats.awayShots,
              },
              {
                label: 'Precisão dos Passes',
                home: `${stats.homePassAccuracy}%`,
                away: `${stats.awayPassAccuracy}%`,
                homeVal: stats.homePassAccuracy,
                awayVal: stats.awayPassAccuracy,
              },
              {
                label: 'Escanteios',
                home: `${stats.homeCorners}`,
                away: `${stats.awayCorners}`,
                homeVal: stats.homeCorners,
                awayVal: stats.awayCorners,
              },
              {
                label: 'Faltas Cometidas',
                home: `${stats.homeFouls}`,
                away: `${stats.awayFouls}`,
                homeVal: stats.homeFouls,
                awayVal: stats.awayFouls,
              },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-400 font-mono">{item.home}</span>
                  <span className="text-slate-400 text-[11px]">{item.label}</span>
                  <span className="text-blue-400 font-mono">{item.away}</span>
                </div>
                {/* Dual Progress Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${(item.homeVal / ((item.homeVal + item.awayVal) || 1)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${(item.awayVal / ((item.homeVal + item.awayVal) || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Match Rewards */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-around text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Premiação</span>
              <div className="font-heading font-black text-emerald-400 text-sm">
                +€{isWin ? '8,500' : isDraw ? '3,000' : '1,200'}
              </div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Experiência</span>
              <div className="font-heading font-black text-amber-400 text-sm">
                +{isWin ? '35 XP' : '15 XP'}
              </div>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Torcedores</span>
              <div className="font-heading font-black text-cyan-400 text-sm">
                +{isWin ? '240' : '60'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={() => {
              playSound('whistle');
              onAdvanceDay();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg"
          >
            <span>Avançar Calendário</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
