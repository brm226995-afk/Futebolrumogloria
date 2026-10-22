import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Briefcase,
  CheckCircle2,
  DollarSign,
  Calendar as CalendarIcon,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  AlertCircle,
  Shield,
  PenTool,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AvatarConfig, OpponentTeam, TransferOffer } from '../types/game';
import { playSound } from '../utils/audio';

interface NegotiationRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: TransferOffer;
  avatar: AvatarConfig;
  onAcceptTransfer: (
    offer: TransferOffer,
    finalSalary: number,
    finalYears: number,
    finalSigningBonus: number
  ) => void;
  onRejectTransfer: (offerId: string) => void;
  allOffers?: TransferOffer[];
  onSelectDifferentOffer?: (offer: TransferOffer) => void;
}

type NegotiationStage = 'DELIVERING' | 'DISCUSSING' | 'SIGNING' | 'OFFICIAL';

export const NegotiationRoomModal: React.FC<NegotiationRoomModalProps> = ({
  isOpen,
  onClose,
  offer,
  avatar,
  onAcceptTransfer,
  onRejectTransfer,
  allOffers = [],
  onSelectDifferentOffer,
}) => {
  const [stage, setStage] = useState<NegotiationStage>('DELIVERING');
  const [salary, setSalary] = useState<number>(offer.salaryMonthly);
  const [years, setYears] = useState<number>(offer.contractYears);
  const [signingBonus, setSigningBonus] = useState<number>(offer.signingBonus);
  const [goalBonus, setGoalBonus] = useState<number>(offer.goalBonus);

  // Animation states
  const [paperDelivered, setPaperDelivered] = useState<boolean>(false);
  const [signatureProgress, setSignatureProgress] = useState<number>(0);
  const [stampLanded, setStampLanded] = useState<boolean>(false);
  const [presidentMessage, setPresidentMessage] = useState<string>(offer.pitchMessage);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset or initialize when offer changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setStage('DELIVERING');
      setPaperDelivered(false);
      setSignatureProgress(0);
      setStampLanded(false);
      setSalary(offer.salaryMonthly);
      setYears(offer.contractYears);
      setSigningBonus(offer.signingBonus);
      setGoalBonus(offer.goalBonus);
      setPresidentMessage(offer.pitchMessage);

      // Play paper delivery animation after a brief suspense
      const timer = setTimeout(() => {
        playSound('paper');
        setPaperDelivered(true);
        setTimeout(() => {
          setStage('DISCUSSING');
        }, 900);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [isOpen, offer]);

  // Dynamic President feedback based on demands
  useEffect(() => {
    if (stage !== 'DISCUSSING') return;

    const salaryDiffRatio = salary / offer.salaryMonthly;
    const bonusDiffRatio = signingBonus / offer.signingBonus;

    if (salaryDiffRatio > 1.35 || bonusDiffRatio > 1.4) {
      setPresidentMessage(
        'Essa pedida está no teto do nosso planejamento, mas o conselho do clube está disposto a aceitar se você garantir títulos!'
      );
    } else if (salaryDiffRatio > 1.15 || bonusDiffRatio > 1.2) {
      setPresidentMessage(
        'Proposta ousada! Concordamos em valorizar seu talento. Essa camisa tem muito peso e você tem a nossa total confiança.'
      );
    } else if (salaryDiffRatio < 0.9) {
      setPresidentMessage(
        'Excelente postura profissional! Isso demonstra sua gana de vencer com a nossa camisa. As portas estão abertas!'
      );
    } else {
      setPresidentMessage(offer.pitchMessage);
    }
  }, [salary, signingBonus, years, stage, offer]);

  // Animated cursive signature effect
  useEffect(() => {
    if (stage === 'SIGNING') {
      let current = 0;
      playSound('paper');

      const penInterval = setInterval(() => {
        current += 0.05;
        if (current <= 1) {
          setSignatureProgress(current);
          if (Math.random() < 0.35) {
            playSound('pen');
          }
        } else {
          clearInterval(penInterval);
          setSignatureProgress(1);

          // Stamp falls down with audio
          setTimeout(() => {
            playSound('stamp');
            setStampLanded(true);

            // Confetti explosion
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: [offer.club.primaryColor, '#F59E0B', '#10B981', '#FFFFFF'],
            });

            setTimeout(() => {
              playSound('goal');
              setStage('OFFICIAL');
            }, 1000);
          }, 600);
        }
      }, 45);

      return () => clearInterval(penInterval);
    }
  }, [stage, offer.club.primaryColor]);

  if (!isOpen) return null;

  const handleStartSigning = () => {
    playSound('click');
    setStage('SIGNING');
  };

  const handleConfirmOfficialTransfer = () => {
    playSound('cheer');
    onAcceptTransfer(offer, salary, years, signingBonus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl min-h-[580px] bg-gradient-to-b from-[#091122] via-[#0E1A36] to-[#060B17] border border-blue-500/40 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900/90 border-b border-blue-500/20 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Briefcase className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-base sm:text-lg text-white tracking-wide uppercase">
                  SALA DE NEGOCIAÇÃO E CONTRATO
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  MERCADO DA BOLA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Reunião de transferência com a diretoria do {offer.club.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allOffers.length > 1 && stage === 'DISCUSSING' && (
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-white/10 text-xs">
                <span className="text-slate-400">Outros clubes:</span>
                {allOffers
                  .filter((o) => o.id !== offer.id)
                  .map((other) => (
                    <button
                      key={other.id}
                      type="button"
                      onClick={() => onSelectDifferentOffer?.(other)}
                      className="px-2 py-0.5 rounded bg-blue-600/40 hover:bg-blue-600 text-blue-200 text-[11px] font-bold transition-colors"
                      title={other.club.name}
                    >
                      {other.club.shortName}
                    </button>
                  ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Boardroom Scene Container */}
        <div className="relative flex-1 flex flex-col justify-between overflow-hidden p-3 sm:p-5">
          {/* Panoramic Stadium Window Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1630] to-[#040813] pointer-events-none">
            {/* Stadium floodlight beams */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
            {/* Window frame grid */}
            <div className="absolute inset-x-0 top-0 h-44 opacity-20 border-b border-white/10 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute top-10 inset-x-12 flex justify-between items-center opacity-30 text-xs font-mono text-slate-400">
              <span>🏟️ ARENA PANORÂMICA VIP</span>
              <span>SUÍTE EXECUTIVA PRESIDENCIAL</span>
            </div>
          </div>

          {/* STAGE 1 & 2: THE BOARDROOM TABLE & CHARACTERS */}
          {stage !== 'SIGNING' && stage !== 'OFFICIAL' && (
            <div className="relative z-10 flex-1 flex flex-col justify-between max-w-3xl mx-auto w-full">
              {/* TOP: PRESIDENT SEATED ACROSS THE TABLE */}
              <div className="flex flex-col items-center pt-1 pb-2">
                {/* Speech Bubble */}
                <div className="relative mb-2 max-w-lg bg-slate-900/90 border border-amber-400/40 rounded-2xl p-3 shadow-xl text-center animate-fade-in backdrop-blur-md">
                  <div className="text-[11px] font-bold text-amber-400 flex items-center justify-center gap-1.5 uppercase tracking-wider mb-0.5">
                    <span>{offer.club.badge}</span>
                    <span>{offer.presidentName}</span>
                    <span className="text-slate-400 font-normal">({offer.presidentTitle})</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium italic leading-relaxed">
                    "{presidentMessage}"
                  </p>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-r border-b border-amber-400/40 rotate-45" />
                </div>

                {/* President Avatar Graphic & Seating */}
                <div className="flex items-center gap-6">
                  {/* Club Sports Director (Left aide) */}
                  <div className="hidden sm:flex flex-col items-center opacity-65 scale-90">
                    <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xl shadow">
                      👔
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">Diretor Executivo</span>
                  </div>

                  {/* President Illustration */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      {/* Leather executive chair back */}
                      <div className="absolute -inset-2 bg-gradient-to-b from-[#2B1704] to-[#120800] rounded-t-3xl border-2 border-[#54300E] shadow-2xl -z-10" />

                      {/* President Figure */}
                      <div className="relative w-20 h-24 sm:w-24 sm:h-28 flex flex-col items-center justify-end pb-1 overflow-hidden rounded-t-2xl">
                        {/* Silver/grey hair & face */}
                        <div className="w-10 h-10 rounded-full bg-[#EAC096] border-2 border-slate-700 relative shadow-inner">
                          {/* Hair */}
                          <div className="absolute -top-1 inset-x-0 h-4 bg-slate-300 rounded-t-full" />
                          {/* Glasses */}
                          <div className="absolute top-3.5 inset-x-1 flex justify-center gap-1 text-[10px] font-bold text-slate-800">
                            👓
                          </div>
                        </div>
                        {/* Dark tailored suit & club-colored tie */}
                        <div className="w-16 sm:w-20 h-14 bg-slate-900 border-t-2 border-slate-600 rounded-t-xl relative flex justify-center shadow-lg">
                          <div
                            className="w-3.5 h-full rounded-b"
                            style={{ backgroundColor: offer.club.primaryColor }}
                          />
                          {/* Club lapel badge */}
                          <span className="absolute top-2 right-2 text-xs">{offer.club.badge}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10">
                      <span className="text-xs">{offer.club.badge}</span>
                      <span className="text-[11px] font-bold text-white font-heading">
                        {offer.club.name}
                      </span>
                    </div>
                  </div>

                  {/* Club Legal Counsel (Right aide) */}
                  <div className="hidden sm:flex flex-col items-center opacity-65 scale-90">
                    <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xl shadow">
                      💼
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">Jurídico / BID</span>
                  </div>
                </div>
              </div>

              {/* CENTER: THE RICH MAHOGANY BOARDROOM TABLE */}
              <div className="relative my-2 sm:my-3">
                {/* Desk Surface (Mahogany with wood grain and golden edge) */}
                <div className="relative min-h-[160px] sm:min-h-[185px] w-full rounded-2xl bg-gradient-to-b from-[#3D1E0B] via-[#4A260F] to-[#241105] border-t-4 border-amber-600/50 shadow-2xl flex items-center justify-center p-2.5 sm:p-3 overflow-hidden">
                  {/* Wood grain reflection lines */}
                  <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,#000,#000_10px,transparent_10px,transparent_20px)] pointer-events-none" />

                  {/* Golden desk accessories */}
                  <div className="absolute top-2 left-3 sm:left-4 flex items-center gap-2 sm:gap-3 opacity-75 pointer-events-none">
                    <span className="text-base sm:text-lg" title="Água mineral">
                      🥃
                    </span>
                    <span className="text-sm sm:text-base" title="Café expresso">
                      ☕
                    </span>
                  </div>

                  <div className="absolute top-2 right-3 sm:right-4 flex items-center gap-1.5 opacity-75 pointer-events-none">
                    <span className="text-base sm:text-lg" title="Caneta dourada executiva">
                      🖋️
                    </span>
                    <span className="text-[10px] font-mono text-amber-300/60 uppercase hidden sm:inline">
                      Minuta Oficial
                    </span>
                  </div>

                  {/* THE CONTRACT SHEET SLIDING ANIMATION (COMPACT FIT) */}
                  <div
                    className={`relative w-full max-w-[340px] sm:max-w-md bg-stone-50 text-slate-900 rounded-lg sm:rounded-xl p-2 sm:p-2.5 shadow-2xl border border-amber-400/80 transition-all duration-700 ease-out transform ${
                      paperDelivered
                        ? 'translate-y-0 scale-100 opacity-100 rotate-0'
                        : '-translate-y-24 scale-75 opacity-40 -rotate-3'
                    }`}
                  >
                    {/* Club Header on Paper */}
                    <div className="flex items-center justify-between border-b border-stone-200 pb-1 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-base sm:text-lg shrink-0">{offer.club.badge}</span>
                        <div className="min-w-0">
                          <div className="text-[8px] sm:text-[9px] font-mono tracking-widest text-stone-500 uppercase leading-none">
                            PROPOSTA FORMAL DE CONTRATO
                          </div>
                          <div className="text-xs sm:text-sm font-heading font-black text-slate-900 leading-tight truncate">
                            {offer.club.name} FC
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 pl-1">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[8px] sm:text-[9px] font-black uppercase tracking-wider border border-emerald-300">
                          BID OFICIAL
                        </span>
                      </div>
                    </div>

                    {/* Paper Contract Summary Grid - Compact 4-col */}
                    <div className="grid grid-cols-4 gap-1 text-center py-0.5">
                      <div className="bg-stone-100/90 px-1 py-0.5 sm:py-1 rounded border border-stone-200">
                        <span className="text-[7px] sm:text-[8px] text-stone-500 block uppercase font-mono truncate leading-tight">
                          Salário/Mês
                        </span>
                        <span className="font-heading font-black text-[10px] sm:text-xs text-blue-900 block truncate leading-tight">
                          R$ {salary.toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div className="bg-stone-100/90 px-1 py-0.5 sm:py-1 rounded border border-stone-200">
                        <span className="text-[7px] sm:text-[8px] text-stone-500 block uppercase font-mono truncate leading-tight">
                          Duração
                        </span>
                        <span className="font-heading font-black text-[10px] sm:text-xs text-slate-900 block truncate leading-tight">
                          {years} {years === 1 ? 'Ano' : 'Anos'}
                        </span>
                      </div>

                      <div className="bg-stone-100/90 px-1 py-0.5 sm:py-1 rounded border border-stone-200">
                        <span className="text-[7px] sm:text-[8px] text-stone-500 block uppercase font-mono truncate leading-tight">
                          Luvas
                        </span>
                        <span className="font-heading font-black text-[10px] sm:text-xs text-emerald-700 block truncate leading-tight">
                          +R$ {signingBonus.toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div className="bg-stone-100/90 px-1 py-0.5 sm:py-1 rounded border border-stone-200">
                        <span className="text-[7px] sm:text-[8px] text-stone-500 block uppercase font-mono truncate leading-tight">
                          Bônus/Gol
                        </span>
                        <span className="font-heading font-black text-[10px] sm:text-xs text-amber-700 block truncate leading-tight">
                          R$ {goalBonus.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* Paper Footer with Call to Action */}
                    <div className="mt-1 pt-1 border-t border-stone-200 flex items-center justify-between text-[8px] sm:text-[10px] text-stone-600 font-mono leading-none">
                      <span className="truncate pr-1">Atleta: <b>{avatar.name || 'Gabriel M.'}</b></span>
                      <span className="text-amber-700 font-bold flex items-center gap-0.5 shrink-0">
                        <PenTool className="w-2.5 h-2.5" /> Pronto
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM: NEGOTIATION CONTROLS (PLAYER & AGENT PERSPECTIVE) */}
              <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    {/* User Hero Avatar preview */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-black text-slate-950 text-sm shadow-md"
                      style={{ backgroundColor: avatar.jerseyColor }}
                    >
                      #{avatar.number}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Você: {avatar.name || 'Gabriel M.'}</span>
                        <span className="text-emerald-400 font-mono text-[10px]">(Titular)</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Negocie suas cláusulas com a diretoria do {offer.club.shortName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click');
                        onRejectTransfer(offer.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                    >
                      Recusar Oferta
                    </button>

                    <button
                      type="button"
                      onClick={handleStartSigning}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-heading font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <PenTool className="w-4 h-4 stroke-[2.5]" />
                      <span>ASSINAR CONTRATO</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Negotiator Sliders & Steppers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
                  {/* Salário Mensal Stepper */}
                  <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-blue-400" /> Salário Mensal
                      </span>
                      <span className="text-xs font-bold text-blue-400">
                        R$ {salary.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setSalary((s) => Math.max(15000, s - 3000));
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min={15000}
                        max={90000}
                        step={2500}
                        value={salary}
                        onChange={(e) => {
                          setSalary(Number(e.target.value));
                        }}
                        className="flex-1 accent-blue-500 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setSalary((s) => Math.min(90000, s + 3000));
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Tempo de Contrato Selector */}
                  <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-amber-400" /> Duração Contrato
                      </span>
                      <span className="text-xs font-bold text-amber-400 font-mono">
                        {years} {years === 1 ? 'Ano' : 'Anos'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 mt-1">
                      {[1, 2, 3, 4].map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => {
                            playSound('click');
                            setYears(yr);
                          }}
                          className={`py-1 rounded-lg text-xs font-bold transition-all ${
                            years === yr
                              ? 'bg-amber-500 text-slate-950 shadow-md'
                              : 'bg-slate-700/80 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {yr}a
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Luvas / Bônus de Assinatura */}
                  <div className="bg-slate-800/70 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-slate-400 uppercase font-mono flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Luvas à Vista
                      </span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        R$ {signingBonus.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setSigningBonus((b) => Math.max(30000, b - 10000));
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min={30000}
                        max={250000}
                        step={10000}
                        value={signingBonus}
                        onChange={(e) => {
                          setSigningBonus(Number(e.target.value));
                        }}
                        className="flex-1 accent-emerald-500 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setSigningBonus((b) => Math.min(250000, b + 10000));
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: THE SIGNING CEREMONY (ZOOMED INTO DOCUMENT) */}
          {stage === 'SIGNING' && (
            <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-2 sm:p-4 animate-scale-up">
              <div className="w-full max-w-2xl bg-amber-50 text-slate-900 rounded-2xl shadow-2xl p-5 sm:p-7 border-4 border-amber-300 relative overflow-hidden">
                {/* Official Legal Seal Watermark */}
                <div className="absolute right-6 top-6 opacity-10 pointer-events-none text-9xl">
                  {offer.club.badge}
                </div>

                {/* Document Official Heading */}
                <div className="text-center border-b-2 border-slate-300 pb-3 mb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-2xl">{offer.club.badge}</span>
                    <h3 className="font-heading font-black text-sm sm:text-base tracking-wider text-slate-900 uppercase">
                      CONFEDERAÇÃO NACIONAL DE FUTEBOL
                    </h3>
                    <span className="text-2xl">{offer.club.badge}</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-600 uppercase tracking-widest">
                    CONTRATO ESPECIAL DE TRABALHO DESPORTIVO PROFISSIONAL
                  </p>
                </div>

                {/* Clauses Clauses Text */}
                <div className="space-y-2 text-xs text-slate-700 leading-relaxed font-serif">
                  <p>
                    Pelo presente instrumento, o <b>{offer.club.name.toUpperCase()}</b>, representado por seu
                    Presidente <b>{offer.presidentName}</b>, e o atleta profissional{' '}
                    <b>{(avatar.name || 'GABRIEL M.').toUpperCase()}</b> (Camisa #{avatar.number}), acordam as
                    seguintes condições de transferência desportiva:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-2 text-slate-800">
                    <li>
                      <b>Salário Registrado:</b> R$ {salary.toLocaleString('pt-BR')} por mês.
                    </li>
                    <li>
                      <b>Vigência:</b> {years} {years === 1 ? 'temporada desportiva' : 'temporadas desportivas'}.
                    </li>
                    <li>
                      <b>Luvas de Assinatura:</b> R$ {signingBonus.toLocaleString('pt-BR')} (depósito imediato).
                    </li>
                    <li>
                      <b>Premiação por Gol Oficial:</b> R$ {goalBonus.toLocaleString('pt-BR')} por gol.
                    </li>
                  </ul>
                </div>

                {/* SIGNATURE FIELDS SECTION */}
                <div className="mt-6 pt-4 border-t-2 border-slate-300 grid grid-cols-2 gap-4">
                  {/* President Signature */}
                  <div className="flex flex-col items-center">
                    <div className="h-12 flex items-end justify-center font-serif italic text-sm text-slate-700 font-bold opacity-80">
                      {offer.presidentName}
                    </div>
                    <div className="w-full border-t border-slate-400 mt-1" />
                    <span className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">
                      PRESIDENTE DO CLUBE
                    </span>
                  </div>

                  {/* Animated Player Signature Field */}
                  <div className="relative flex flex-col items-center">
                    <div className="h-12 w-full flex items-end justify-center relative">
                      {/* Fountain Pen Icon moving */}
                      <div
                        className="absolute bottom-1 transition-all pointer-events-none text-xl"
                        style={{
                          left: `${Math.min(90, Math.max(10, signatureProgress * 100))}%`,
                          transform: 'translateY(-6px) rotate(-15deg)',
                        }}
                      >
                        🖋️
                      </div>

                      {/* Animated Cursive Name */}
                      <span
                        className="font-serif italic font-black text-xl text-blue-900 tracking-wider overflow-hidden whitespace-nowrap transition-all duration-75 select-none"
                        style={{
                          display: 'inline-block',
                          maxWidth: `${signatureProgress * 100}%`,
                          fontFamily: 'cursive, Georgia, serif',
                        }}
                      >
                        {avatar.name || 'Gabriel M.'}
                      </span>
                    </div>

                    <div className="w-full border-t-2 border-blue-950 mt-1" />
                    <span className="text-[10px] font-bold text-blue-950 uppercase font-mono mt-0.5">
                      ATLETA CONTRATADO: {avatar.name || 'GABRIEL M.'}
                    </span>

                    {/* RED HOMOLOGATION STAMP SLAMMING DOWN */}
                    {stampLanded && (
                      <div className="absolute -top-4 right-2 transform rotate-[-12deg] border-4 border-rose-600 text-rose-600 px-3 py-1 rounded-lg font-black text-xs sm:text-sm tracking-widest uppercase shadow-xl animate-bounce bg-white/70 backdrop-blur-xs select-none">
                        ✓ HOMOLOGADO - BID OFICIAL
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar indication */}
                <div className="mt-5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Assinatura do Atleta em andamento...</span>
                  <span>{Math.round(signatureProgress * 100)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: OFFICIAL CELEBRATION & PRESS CONFERENCE */}
          {stage === 'OFFICIAL' && (
            <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-3 sm:p-6 text-center animate-fade-in max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/30 mb-3">
                🏆
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                CONTRATO ASSINADO E REGISTRADO NO BID!
              </div>

              <h2 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-wide uppercase mb-1">
                BEM-VINDO AO {offer.club.name.toUpperCase()}!
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Você assinou oficialmente por <b>{years} {years === 1 ? 'ano' : 'anos'}</b> com o{' '}
                <b>{offer.club.name}</b>. O novo manto já foi preparado com o seu número #{avatar.number}!
              </p>

              {/* Financial Reward Banner */}
              <div className="w-full bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border border-emerald-500/40 rounded-xl p-3 mb-5 shadow-lg">
                <span className="text-[11px] font-mono text-slate-400 block uppercase">
                  Bônus de Assinatura Depositado em Conta
                </span>
                <span className="font-heading font-black text-xl sm:text-2xl text-emerald-400">
                  + R$ {signingBonus.toLocaleString('pt-BR')}
                </span>
                <span className="text-xs text-slate-300 block mt-0.5">
                  Salário mensal fixado em R$ {salary.toLocaleString('pt-BR')}
                </span>
              </div>

              {/* Action button */}
              <button
                type="button"
                onClick={handleConfirmOfficialTransfer}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-heading font-black text-sm tracking-wider uppercase text-white shadow-xl shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>VESTIR O MANTO E JOGAR</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
