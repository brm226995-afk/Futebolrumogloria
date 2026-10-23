import React, { useState } from 'react';
import { X, Search, Sparkles, UserPlus, Star, Shield, Zap, TrendingUp, CheckCircle, Compass } from 'lucide-react';
import { ScoutedPlayer, TeamPlayer } from '../types/game';
import { INITIAL_SCOUTED_PROSPECTS, generateScoutedTalents } from '../data/initialData';
import { playSound } from '../utils/audio';

interface ScoutingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCash: number;
  teamPlayers: TeamPlayer[];
  onRecruitPlayer: (prospect: ScoutedPlayer) => void;
  onSpendCash: (amount: number) => boolean;
}

export const ScoutingModal: React.FC<ScoutingModalProps> = ({
  isOpen,
  onClose,
  userCash,
  teamPlayers,
  onRecruitPlayer,
  onSpendCash,
}) => {
  const [activeTier, setActiveTier] = useState<'REGIONAL' | 'NACIONAL' | 'INTERNACIONAL'>('REGIONAL');
  const [scoutedList, setScoutedList] = useState<ScoutedPlayer[]>(INITIAL_SCOUTED_PROSPECTS.slice(0, 3));
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [recruitedIds, setRecruitedIds] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate current average team OVR
  const starters = teamPlayers.filter((p) => p.isStarter);
  const teamOvr = Math.round(
    starters.reduce((acc, p) => acc + p.ovr, 0) / (starters.length || 1)
  );

  const tierCosts = {
    REGIONAL: 4000,
    NACIONAL: 10000,
    INTERNACIONAL: 22000,
  };

  const handleSendScout = (tier: 'REGIONAL' | 'NACIONAL' | 'INTERNACIONAL') => {
    const cost = tierCosts[tier];
    if (userCash < cost) {
      playSound('card');
      setSuccessToast('Saldo insuficiente para enviar este olheiro!');
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }

    if (!onSpendCash(cost)) return;

    setActiveTier(tier);
    setIsScanning(true);
    playSound('click');

    setTimeout(() => {
      const newTalents = generateScoutedTalents(tier);
      setScoutedList(newTalents);
      setIsScanning(false);
      playSound('goal');
      setSuccessToast('Olheiro retornou com 3 novos jovens talentos promissores!');
      setTimeout(() => setSuccessToast(null), 3500);
    }, 800);
  };

  const handleRecruit = (prospect: ScoutedPlayer) => {
    if (recruitedIds.includes(prospect.id)) return;

    if (userCash < prospect.cost) {
      playSound('card');
      setSuccessToast('Saldo insuficiente para pagar as luvas de contratação!');
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }

    if (!onSpendCash(prospect.cost)) return;

    setRecruitedIds((prev) => [...prev, prospect.id]);
    onRecruitPlayer(prospect);
    playSound('cheer');
    setSuccessToast(`🎉 ${prospect.name.toUpperCase()} contratado! O OVR do seu time foi fortalecido!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-[#0A1329] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-cyan-950 via-blue-950 to-slate-900 border-b border-cyan-500/30">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-md">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-bold text-cyan-300 flex items-center gap-2">
                CENTRO DE OLHEIROS & RECRUTAMENTO
              </h2>
              <p className="text-[11px] text-slate-300">
                Envie olheiros para garimpar jovens promessas e elevar o OVR do seu time
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

        {/* Current Team OVR & Cash Banner */}
        <div className="bg-[#0C1A38] px-5 py-2.5 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300">OVR Atual do Elenco:</span>
            <span className="font-heading font-black text-amber-400 text-sm">{teamOvr}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Saldo Disponível:</span>
            <span className="font-heading font-black text-emerald-400 font-mono text-sm">
              R$ {userCash.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Toast Feedback */}
        {successToast && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold px-4 py-2 text-center animate-fade-in flex items-center justify-center gap-2 shadow-md">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Scouting Tiers Selector Buttons */}
        <div className="p-4 bg-slate-900/70 border-b border-slate-800 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Escolha uma Missão de Olheiro:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Tier 1: Regional */}
            <button
              type="button"
              disabled={isScanning}
              onClick={() => handleSendScout('REGIONAL')}
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                activeTier === 'REGIONAL'
                  ? 'bg-blue-900/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" /> Base Regional
                </span>
                <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded text-cyan-300 font-mono font-bold">
                  R$ 4.000
                </span>
              </div>
              <p className="text-[10px] text-slate-300">Garimpo nas categorias de base locais (OVR 66-71).</p>
            </button>

            {/* Tier 2: Nacional */}
            <button
              type="button"
              disabled={isScanning}
              onClick={() => handleSendScout('NACIONAL')}
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                activeTier === 'NACIONAL'
                  ? 'bg-blue-900/60 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> Olheiro Nacional
                </span>
                <span className="text-[10px] bg-amber-950 px-1.5 py-0.5 rounded text-amber-300 font-mono font-bold">
                  R$ 10.000
                </span>
              </div>
              <p className="text-[10px] text-slate-300">Jovens destaques da Copinha e torneios (OVR 72-78).</p>
            </button>

            {/* Tier 3: Internacional */}
            <button
              type="button"
              disabled={isScanning}
              onClick={() => handleSendScout('INTERNACIONAL')}
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                activeTier === 'INTERNACIONAL'
                  ? 'bg-blue-900/60 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Scout Global
                </span>
                <span className="text-[10px] bg-purple-950 px-1.5 py-0.5 rounded text-purple-300 font-mono font-bold">
                  R$ 22.000
                </span>
              </div>
              <p className="text-[10px] text-slate-300">Prodígios de classe mundial (OVR 77-84, Potencial 94+).</p>
            </button>
          </div>
        </div>

        {/* Scouted Talents List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Jovens Talentos Encontrados ({scoutedList.length})
            </span>
            <span className="text-[10px] text-slate-400">Recrute para elevar a média do elenco</span>
          </div>

          {isScanning ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
              <span className="text-sm font-bold text-cyan-300 animate-pulse">
                Olheiro em campo buscando promessas...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {scoutedList.map((player) => {
                const isRecruited = recruitedIds.includes(player.id);

                return (
                  <div
                    key={player.id}
                    className={`relative p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                      isRecruited
                        ? 'bg-emerald-950/40 border-emerald-500/50'
                        : 'bg-[#0E1C3D]/90 border-blue-500/30 hover:border-cyan-400/60 shadow-lg'
                    }`}
                  >
                    {/* Header badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-900 text-cyan-300 border border-blue-400/30">
                        {player.position}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{player.age} anos</span>
                    </div>

                    {/* Player Info */}
                    <div className="flex items-center gap-2.5 my-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shadow-inner border border-white/20 shrink-0 text-white"
                        style={{ backgroundColor: player.avatarColor }}
                      >
                        {player.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-heading font-black text-sm text-white truncate">
                          {player.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-bold text-amber-400">{player.ovr} OVR</span>
                          <span className="text-slate-500">|</span>
                          <span className="text-cyan-300 font-semibold">Pot. {player.potential}⭐</span>
                        </div>
                      </div>
                    </div>

                    {/* Special Trait */}
                    <div className="my-2 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-300 truncate">
                      ✨ <span className="font-medium text-slate-200">{player.specialTrait}</span>
                    </div>

                    {/* Cost & Recruit Button */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 uppercase">Luvas</span>
                        <span className="font-heading font-black text-xs text-emerald-400 font-mono">
                          R$ {player.cost.toLocaleString('pt-BR')}
                        </span>
                      </div>

                      {isRecruited ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Contratado</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRecruit(player)}
                          className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-heading font-black text-[10px] uppercase tracking-wider shadow transition-all active:scale-95 flex items-center gap-1"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>CONTRATAR</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
