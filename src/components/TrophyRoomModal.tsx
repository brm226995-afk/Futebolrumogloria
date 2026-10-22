import React, { useState } from 'react';
import { X, Trophy, Award, Lock, CheckCircle2, Sparkles, Star } from 'lucide-react';
import { TrophyItem } from '../types/game';
import { playSound } from '../utils/audio';

interface TrophyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  trophies: TrophyItem[];
}

export const TrophyRoomModal: React.FC<TrophyRoomModalProps> = ({
  isOpen,
  onClose,
  trophies,
}) => {
  const [selectedTrophy, setSelectedTrophy] = useState<TrophyItem | null>(null);

  if (!isOpen) return null;

  const unlockedCount = trophies.filter((t) => t.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-[#0A1226] border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-950 via-yellow-950 to-slate-900 border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-400 text-slate-950 shadow-md">
              <Trophy className="w-5 h-5 fill-current" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-amber-300 flex items-center gap-2">
                SALA DE TROFÉUS & CONQUISTAS
              </h2>
              <p className="text-[11px] text-slate-300">
                Os troféus e títulos conquistados na sua carreira
              </p>
            </div>
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

        {/* Top Trophy Counter Bar */}
        <div className="bg-slate-900/90 px-5 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Total de Conquistas:</span>
            <span className="font-heading font-black text-amber-400 font-mono text-sm">
              {unlockedCount} / {trophies.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500"
                style={{ width: `${(unlockedCount / trophies.length) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-amber-300 font-bold font-mono">
              {Math.round((unlockedCount / trophies.length) * 100)}%
            </span>
          </div>
        </div>

        {/* Trophy Shelves Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {trophies.map((trophy) => {
              const isSelected = selectedTrophy?.id === trophy.id;

              return (
                <button
                  key={trophy.id}
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setSelectedTrophy(trophy);
                  }}
                  className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border transition-all text-center min-h-[170px] ${
                    trophy.unlocked
                      ? 'bg-gradient-to-b from-[#1C170A] to-[#120F05] border-amber-500/60 shadow-[0_0_20px_rgba(250,204,21,0.15)] hover:border-amber-400'
                      : 'bg-slate-900/50 border-slate-800/80 opacity-60 hover:opacity-80'
                  } ${isSelected ? 'ring-2 ring-amber-300 scale-105' : ''}`}
                >
                  {/* Status Badge */}
                  <div className="w-full flex items-center justify-between mb-1">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        trophy.unlocked
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {trophy.category === 'CHAMPIONSHIP'
                        ? 'Campeonato'
                        : trophy.category === 'INDIVIDUAL'
                        ? 'Individual'
                        : 'Especial'}
                    </span>

                    {trophy.unlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>

                  {/* 3D Trophy Visual Container */}
                  <div className="my-2 relative flex items-center justify-center">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-inner ${
                        trophy.unlocked
                          ? 'bg-gradient-to-b from-amber-400/20 to-yellow-600/30 border border-amber-400/50 shadow-[0_0_25px_rgba(250,204,21,0.3)] animate-pulse'
                          : 'bg-slate-800/40 border border-slate-700/40 grayscale'
                      }`}
                    >
                      {trophy.icon}
                    </div>

                    {trophy.unlocked && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-xs font-black shadow">
                        ★
                      </span>
                    )}
                  </div>

                  {/* Trophy Title */}
                  <div className="w-full">
                    <h4
                      className={`font-heading font-black text-xs leading-tight line-clamp-1 ${
                        trophy.unlocked ? 'text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      {trophy.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {trophy.unlocked ? (trophy.unlockedDate || 'Conquistado!') : 'Bloqueado'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Trophy Inspector Detail Card */}
          {selectedTrophy && (
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 animate-fade-in shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-4xl shadow-lg shrink-0">
                {selectedTrophy.icon}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="font-heading font-black text-base text-amber-300">
                    {selectedTrophy.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedTrophy.unlocked
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {selectedTrophy.unlocked ? 'CONQUISTADO' : 'EM DISPUTA'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1">
                  {selectedTrophy.description}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-xs">
                  <span className="text-emerald-400 font-bold font-mono">
                    Bônus: +€{(selectedTrophy.rewardCash / 1000).toFixed(0)}K
                  </span>
                  <span className="text-amber-400 font-bold font-mono">
                    +{selectedTrophy.rewardXp} XP
                  </span>
                  {selectedTrophy.unlocked && (
                    <span className="text-slate-400 text-[11px]">
                      Conquistado em: {selectedTrophy.unlockedDate || 'Janeiro'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Dispute partidas e vença os torneios para encher sua sala de troféus!
          </p>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-md transition-colors"
          >
            Fechar Sala
          </button>
        </div>
      </div>
    </div>
  );
};
