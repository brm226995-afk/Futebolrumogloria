import React from 'react';
import { Award, Trophy, Star, Shield, ChevronRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AvatarConfig } from '../types/game';
import { playSound } from '../utils/audio';

interface SelecaoCallUpModalProps {
  isOpen: boolean;
  avatar: AvatarConfig;
  onClose: () => void;
}

export const SelecaoCallUpModal: React.FC<SelecaoCallUpModalProps> = ({
  isOpen,
  avatar,
  onClose,
}) => {
  if (!isOpen) return null;

  const triggerCelebration = () => {
    playSound('goal');
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FACC15', '#15803D', '#2563EB', '#FFFFFF'],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0A2612] via-[#051A0C] to-[#041208] border-2 border-yellow-400/80 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.3)] flex flex-col overflow-hidden text-white text-center p-6">
        {/* Glow backdrop element */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Flag & Stars */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-pulse" />
          ))}
        </div>

        {/* Official Badge */}
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-300 to-green-600 p-1 shadow-2xl flex items-center justify-center my-2">
          <div className="w-full h-full bg-[#051A0C] rounded-xl flex flex-col items-center justify-center">
            <span className="text-3xl">🇧🇷</span>
            <span className="text-[9px] font-heading font-black text-yellow-300 tracking-wider">BRASIL</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="font-heading text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 tracking-wide uppercase mt-1">
          CONVOCAÇÃO OFICIAL!
        </h2>
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mt-0.5">
          SELEÇÃO BRASILEIRA DE FUTEBOL
        </span>

        {/* Player Name Spotlight */}
        <div className="my-4 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl py-3 px-4">
          <p className="text-xs text-yellow-200">O treinador da Seleção convocou oficialmente:</p>
          <h3 className="font-heading text-xl font-black text-white mt-0.5">
            {avatar.name || 'Gabriel M.'} · Camisa 9
          </h3>
          <p className="text-[11px] text-slate-300 mt-1">
            Suas atuações brilhantes renderam a chance máxima de defender a Amarelinha em partidas internacionais!
          </p>
        </div>

        {/* Info Highlights */}
        <div className="grid grid-cols-2 gap-2 text-left my-2 text-xs">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-yellow-500/20">
            <span className="text-[10px] text-yellow-400 font-bold uppercase block">Datas dos Jogos</span>
            <span className="text-slate-200 text-[11px] font-medium leading-tight">
              Em dias livres sem partidas do seu clube!
            </span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-yellow-500/20">
            <span className="text-[10px] text-yellow-400 font-bold uppercase block">Adversários Mundiais</span>
            <span className="text-slate-200 text-[11px] font-medium leading-tight">
              Argélia Celeste, Germânia Panzer, Franco Real e mais!
            </span>
          </div>
        </div>

        {/* Accept Button */}
        <button
          type="button"
          onClick={triggerCelebration}
          className="mt-4 w-full py-3 px-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-950 font-heading font-black text-sm uppercase tracking-wider rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
        >
          <Award className="w-5 h-5 text-slate-950" />
          <span>VESTIR A AMARELINHA DA SELEÇÃO BR</span>
          <ChevronRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
