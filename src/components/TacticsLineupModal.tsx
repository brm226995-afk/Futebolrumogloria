import React, { useState } from 'react';
import { X, Check, ArrowLeftRight, Shield, Zap, Sparkles } from 'lucide-react';
import { FormationType, TacticsPosture, TacticsSettings, TeamPlayer } from '../types/game';
import { playSound } from '../utils/audio';

interface TacticsLineupModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: TeamPlayer[];
  tactics: TacticsSettings;
  onSave: (updatedPlayers: TeamPlayer[], updatedTactics: TacticsSettings) => void;
}

const FORMATIONS: FormationType[] = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1'];

// Coordinate layouts for starters (0% to 100% relative to pitch)
const FORMATION_POSITIONS: Record<FormationType, { x: number; y: number; role: string }[]> = {
  '4-3-3': [
    { x: 50, y: 88, role: 'GOL' }, // 1
    { x: 18, y: 70, role: 'LAT' }, // 2
    { x: 38, y: 73, role: 'ZAG' }, // 3
    { x: 62, y: 73, role: 'ZAG' }, // 4
    { x: 82, y: 70, role: 'LAT' }, // 5
    { x: 32, y: 52, role: 'VOL' }, // 6
    { x: 68, y: 52, role: 'VOL' }, // 7
    { x: 50, y: 40, role: 'MEI' }, // 8
    { x: 20, y: 22, role: 'ATA' }, // 9
    { x: 50, y: 18, role: 'ATA' }, // 10 (Hero)
    { x: 80, y: 22, role: 'ATA' }, // 11
  ],
  '4-4-2': [
    { x: 50, y: 88, role: 'GOL' },
    { x: 18, y: 70, role: 'LAT' },
    { x: 38, y: 73, role: 'ZAG' },
    { x: 62, y: 73, role: 'ZAG' },
    { x: 82, y: 70, role: 'LAT' },
    { x: 18, y: 46, role: 'MEI' },
    { x: 40, y: 48, role: 'VOL' },
    { x: 60, y: 48, role: 'VOL' },
    { x: 82, y: 46, role: 'MEI' },
    { x: 38, y: 20, role: 'ATA' },
    { x: 62, y: 20, role: 'ATA' },
  ],
  '3-5-2': [
    { x: 50, y: 88, role: 'GOL' },
    { x: 26, y: 72, role: 'ZAG' },
    { x: 50, y: 74, role: 'ZAG' },
    { x: 74, y: 72, role: 'ZAG' },
    { x: 15, y: 48, role: 'ALA' },
    { x: 36, y: 52, role: 'VOL' },
    { x: 64, y: 52, role: 'VOL' },
    { x: 85, y: 48, role: 'ALA' },
    { x: 50, y: 38, role: 'MEI' },
    { x: 38, y: 20, role: 'ATA' },
    { x: 62, y: 20, role: 'ATA' },
  ],
  '4-2-3-1': [
    { x: 50, y: 88, role: 'GOL' },
    { x: 18, y: 72, role: 'LAT' },
    { x: 38, y: 75, role: 'ZAG' },
    { x: 62, y: 75, role: 'ZAG' },
    { x: 82, y: 72, role: 'LAT' },
    { x: 38, y: 56, role: 'VOL' },
    { x: 62, y: 56, role: 'VOL' },
    { x: 20, y: 36, role: 'MEI' },
    { x: 50, y: 34, role: 'MEI' },
    { x: 80, y: 36, role: 'MEI' },
    { x: 50, y: 18, role: 'ATA' },
  ],
};

export const TacticsLineupModal: React.FC<TacticsLineupModalProps> = ({
  isOpen,
  onClose,
  players,
  tactics,
  onSave,
}) => {
  const [currentPlayers, setCurrentPlayers] = useState<TeamPlayer[]>(players);
  const [currentTactics, setCurrentTactics] = useState<TacticsSettings>(tactics);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  if (!isOpen) return null;

  const starters = currentPlayers.filter((p) => p.isStarter);
  const bench = currentPlayers.filter((p) => !p.isStarter);

  const teamOvr = Math.round(
    starters.reduce((acc, p) => acc + p.ovr, 0) / (starters.length || 1)
  );

  const handleSelectPlayer = (id: string) => {
    playSound('click');
    if (!selectedPlayerId) {
      setSelectedPlayerId(id);
    } else if (selectedPlayerId === id) {
      setSelectedPlayerId(null);
    } else {
      // Swap players
      const idx1 = currentPlayers.findIndex((p) => p.id === selectedPlayerId);
      const idx2 = currentPlayers.findIndex((p) => p.id === id);

      if (idx1 !== -1 && idx2 !== -1) {
        const updated = [...currentPlayers];
        const p1Starter = updated[idx1].isStarter;
        const p2Starter = updated[idx2].isStarter;

        // Swap their starter flags if one was starter and other was bench
        updated[idx1] = { ...updated[idx1], isStarter: p2Starter };
        updated[idx2] = { ...updated[idx2], isStarter: p1Starter };

        // Swap position in array
        const temp = updated[idx1];
        updated[idx1] = updated[idx2];
        updated[idx2] = temp;

        setCurrentPlayers(updated);
        setSelectedPlayerId(null);
        playSound('pass');
      }
    }
  };

  const handleSave = () => {
    playSound('whistle');
    onSave(currentPlayers, currentTactics);
    onClose();
  };

  const positions = FORMATION_POSITIONS[currentTactics.formation];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[94vh] bg-[#0A1224] border border-blue-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-blue-500/20">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-amber-400">
                ESCALAÇÃO & TÁTICAS
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>Manaus Gold</span>
                <span>·</span>
                <span className="text-amber-400 font-bold">GERAL {teamOvr}</span>
                <span>·</span>
                <span>Formação {currentTactics.formation}</span>
              </div>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col lg:flex-row gap-5">
          {/* Tactical Pitch (Visual Board) */}
          <div className="w-full lg:w-7/12 flex flex-col items-center">
            {/* Formations Selector Bar */}
            <div className="w-full flex items-center justify-between bg-slate-900/80 p-2 rounded-xl mb-3 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 pl-2">Formação:</span>
              <div className="flex gap-1">
                {FORMATIONS.map((form) => (
                  <button
                    key={form}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setCurrentTactics({ ...currentTactics, formation: form });
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      currentTactics.formation === form
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {form}
                  </button>
                ))}
              </div>
            </div>

            {/* Pitch Container */}
            <div className="relative w-full aspect-[3/4] max-h-[460px] bg-[#1E7E34] border-4 border-white/80 rounded-2xl overflow-hidden shadow-2xl">
              {/* Pitch Grass Stripes */}
              <div className="absolute inset-0 flex flex-col">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 w-full"
                    style={{ backgroundColor: i % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'transparent' }}
                  />
                ))}
              </div>

              {/* Pitch Markings */}
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-2 border-white/60 rounded-full pointer-events-none" />
              {/* Halfway Line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/60 pointer-events-none" />
              {/* Penalty Area Top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-b-2 border-x-2 border-white/60 pointer-events-none" />
              {/* Penalty Area Bottom */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-t-2 border-x-2 border-white/60 pointer-events-none" />
              {/* Goal Boxes */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 border-b-2 border-x-2 border-white/60 pointer-events-none" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 border-t-2 border-x-2 border-white/60 pointer-events-none" />

              {/* Starters on pitch */}
              {starters.slice(0, 11).map((player, idx) => {
                const pos = positions[idx] || { x: 50, y: 50, role: player.position };
                const isSelected = selectedPlayerId === player.id;

                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => handleSelectPlayer(player.id)}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-transform ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                    }`}
                  >
                    {/* Token Circle */}
                    <div
                      className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-heading font-black text-sm shadow-xl transition-all ${
                        player.isCustomHero
                          ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300 ring-offset-2 ring-offset-black'
                          : 'bg-[#F7D002] text-slate-950 border-2 border-black'
                      } ${isSelected ? 'ring-4 ring-cyan-400 animate-pulse' : ''}`}
                    >
                      {player.number}
                      {player.isCustomHero && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full flex items-center justify-center text-[8px] text-white">
                          ★
                        </span>
                      )}
                    </div>

                    {/* Name Pill */}
                    <div
                      className={`mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shadow-md ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950'
                          : player.isCustomHero
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-black/80 text-white'
                      }`}
                    >
                      {player.name} <span className="opacity-75">({player.ovr})</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Instruction helper */}
            <p className="mt-2 text-xs text-slate-400 text-center flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
              Clique em um jogador em campo e depois em outro (ou no banco) para trocar!
            </p>
          </div>

          {/* Sidebar: Substitutes & Tactical Sliders */}
          <div className="w-full lg:w-5/12 flex flex-col gap-4">
            {/* Tactical Sliders */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Estilo de Jogo
              </h3>

              {/* Postura */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Postura Tática:</span>
                  <span className="font-bold text-amber-400">{currentTactics.posture}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Defensivo', 'Equilíbrio', 'Ofensivo'] as TacticsPosture[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setCurrentTactics({ ...currentTactics, posture: mode });
                      }}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        currentTactics.posture === mode
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ritmo */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Ritmo de Jogo:</span>
                  <span className="font-bold text-amber-400">{currentTactics.pace}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Lento', 'Normal', 'Rápido'] as const).map((pace) => (
                    <button
                      key={pace}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setCurrentTactics({ ...currentTactics, pace });
                      }}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        currentTactics.pace === pace
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {pace}
                    </button>
                  ))}
                </div>
              </div>

              {/* Passes */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Tipo de Passe:</span>
                  <span className="font-bold text-amber-400">{currentTactics.passing}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Curto', 'Misto', 'Direto'] as const).map((pas) => (
                    <button
                      key={pas}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setCurrentTactics({ ...currentTactics, passing: pas });
                      }}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        currentTactics.passing === pas
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {pas}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bench / Substitutes List */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex-1 flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center justify-between">
                <span>Banco de Reservas ({bench.length})</span>
                {selectedPlayerId && (
                  <span className="text-[11px] text-cyan-400 animate-pulse">Toque para substituir</span>
                )}
              </h3>

              <div className="space-y-1.5 flex-1 overflow-y-auto max-h-56 pr-1">
                {bench.map((sub) => {
                  const isSelected = selectedPlayerId === sub.id;

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSelectPlayer(sub.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all text-left ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-400 shadow-md scale-[1.02]'
                          : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold font-mono">
                          {sub.number}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            {sub.name}
                            <span className="px-1 py-0.2 bg-slate-700 text-slate-300 rounded text-[9px]">
                              {sub.position}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">Energia: {sub.energy}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-xs">
                          {sub.ovr}
                        </span>
                        <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-sm font-bold shadow-lg"
          >
            <Check className="w-4 h-4" />
            Confirmar Escalação
          </button>
        </div>
      </div>
    </div>
  );
};
