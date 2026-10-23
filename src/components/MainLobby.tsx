import React, { useState, useRef } from 'react';
import {
  AvatarConfig,
  CalendarDay,
  ClubInfo,
  OpponentTeam,
  TransferOffer,
} from '../types/game';
import { AvatarDisplay } from './AvatarDisplay';
import { playSound } from '../utils/audio';
import {
  Heart,
  MessageCircle,
  Briefcase,
  Gift,
  Trophy,
  Eye,
  ChevronRight,
  Zap,
  Calendar,
  Users,
  Menu as MenuIcon,
  Play,
  RotateCcw,
  Target,
  Search,
} from 'lucide-react';

interface MainLobbyProps {
  avatar: AvatarConfig;
  currentClub?: ClubInfo;
  onOpenAvatarEditor: () => void;
  onEnterField: () => void; // Opens calendar
  onSimulateDirectly: () => void; // Simulates match instantly
  onOpenSocialFeed: () => void; // Opens social network
  onOpenTrophyRoom: () => void; // Opens Trophy Room
  onOpenNegotiationRoom: () => void; // Opens Transfer Negotiation Room
  onOpenTraining: () => void; // Opens Training drills
  onOpenScouting: () => void; // Opens Scouting modal
  isCalledUpToSelecao?: boolean;
  activeTransferOffersCount?: number;
  pendingTransferOffer?: TransferOffer | null;
  onRest: () => void;
  onOpenTactics: () => void;
  onOpenStats: () => void;
  onPlaySelecaoMatch?: (globalIndex?: number) => void;
  onSimulateSelecaoMatch?: (globalIndex?: number) => void;
  nextSelecaoMatchDay?: CalendarDay | null;
  cash: number;
  energy: number;
  currentDayData: CalendarDay;
  nextMatchDay?: CalendarDay;
  unlockedTrophyCount?: number;
  isTrainingAvailable?: boolean;
  heroOvr?: number;
}

export const MainLobby: React.FC<MainLobbyProps> = ({
  avatar,
  currentClub,
  onOpenAvatarEditor,
  onEnterField,
  onSimulateDirectly,
  onOpenSocialFeed,
  onOpenTrophyRoom,
  onOpenNegotiationRoom,
  onOpenTraining,
  onOpenScouting,
  isCalledUpToSelecao = false,
  activeTransferOffersCount = 0,
  pendingTransferOffer,
  onRest,
  onOpenTactics,
  onOpenStats,
  onPlaySelecaoMatch,
  onSimulateSelecaoMatch,
  nextSelecaoMatchDay,
  cash,
  energy,
  currentDayData,
  nextMatchDay,
  unlockedTrophyCount = 0,
  isTrainingAvailable = true,
  heroOvr = 59,
}) => {
  const [activeTab, setActiveTab] = useState<'central' | 'calendario' | 'tatica' | 'rede' | 'menu'>('central');
  const [energyToast, setEnergyToast] = useState<string | null>(null);

  const [avatarRotation, setAvatarRotation] = useState<number>(0);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState<boolean>(false);
  const dragAvatarStartX = useRef<number>(0);
  const dragAvatarStartAngle = useRef<number>(0);

  const opponent: OpponentTeam = nextMatchDay?.opponent || {
    id: 'sp_white',
    name: 'São Paulo White',
    shortName: 'SP White',
    badge: '⚓',
    primaryColor: '#FFFFFF',
    secondaryColor: '#1E3A8A',
    ovr: 62,
    city: 'São Paulo',
    starPlayer: 'Ricardo',
  };

  const formattedCash = `R$ ${(cash / 1000).toFixed(1)}K`;

  // Check if today is an official match day for the player's club
  const isClubMatchDay =
    currentDayData.type === 'MATCH' && currentDayData.competition !== 'Seleção BR';

  // Target upcoming or current Seleção BR fixture
  const isTodaySelecao =
    currentDayData.type === 'MATCH' && currentDayData.competition === 'Seleção BR';
  const targetSelecaoMatch = isTodaySelecao ? currentDayData : nextSelecaoMatchDay;

  return (
    <div className="relative w-full min-h-screen bg-[#070D1F] flex flex-col justify-between overflow-hidden select-none">
      {/* Top Status Bar */}
      <header className="relative z-30 w-full max-w-xl mx-auto px-3 pt-3 pb-2 flex items-center justify-between">
        {/* Left: Overall Shield & Player Name */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center bg-[#15254A]/90 border border-blue-400/30 rounded-r-xl pr-3 pl-1 py-1 shadow-lg backdrop-blur-xs">
            <div className="w-9 h-10 bg-gradient-to-b from-[#8C5D35] to-[#59391D] border-2 border-[#D4A373] rounded-md flex flex-col items-center justify-center shadow-md mr-2">
              <span className="text-[8px] font-bold tracking-tight text-amber-200 leading-none">Geral</span>
              <span className="text-sm font-black font-heading text-white leading-tight">{heroOvr}</span>
            </div>
            <span className="font-heading font-black text-sm text-white tracking-wide truncate max-w-[105px]">
              {avatar.name || 'Gabriel M.'}
            </span>
          </div>

          {/* Seleção BR Convocado Badge */}
          {isCalledUpToSelecao && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500/20 to-green-600/20 border border-yellow-400/50 rounded-lg px-2 py-1 shadow animate-pulse">
              <span className="text-xs">🇧🇷</span>
              <span className="text-[9px] font-heading font-black text-yellow-300 uppercase tracking-tight hidden sm:inline">
                Seleção BR
              </span>
            </div>
          )}
        </div>

        {/* Center/Right: Cash & Energy Meters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#0C1A38]/90 border border-blue-500/30 rounded-xl px-2.5 py-1.5 shadow-md backdrop-blur-xs">
            <span className="text-sm">💵</span>
            <span className="font-heading font-black text-xs text-emerald-400 font-mono tracking-tight">
              {formattedCash}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0C1A38]/90 border border-blue-500/30 rounded-xl px-2.5 py-1.5 shadow-md backdrop-blur-xs">
            <Zap className="w-4 h-4 text-cyan-400 fill-current" />
            <span className={`font-heading font-black text-xs font-mono ${energy <= 0 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
              {energy}%
            </span>
          </div>
        </div>
      </header>

      {/* Main Avatar Stage & Right Floating Quick Icons */}
      <main className="relative flex-1 w-full max-w-xl mx-auto flex flex-col justify-end overflow-hidden">
        {/* 2D/2.5D Avatar with touch/mouse rotation drag */}
        <div
          className="absolute inset-0 cursor-ew-resize touch-none"
          onPointerDown={(e) => {
            setIsDraggingAvatar(true);
            dragAvatarStartX.current = e.clientX;
            dragAvatarStartAngle.current = avatarRotation;
          }}
          onPointerMove={(e) => {
            if (!isDraggingAvatar) return;
            const deltaX = e.clientX - dragAvatarStartX.current;
            setAvatarRotation(Math.round(dragAvatarStartAngle.current + deltaX * 1.1));
          }}
          onPointerUp={() => setIsDraggingAvatar(false)}
          onPointerCancel={() => setIsDraggingAvatar(false)}
        >
          <AvatarDisplay config={avatar} showBackdrop={true} rotationY={avatarRotation} />
        </div>

        {/* Interactive Floating Rotation & Athlete Customization Toolbar Pill */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[14.5rem] z-20 flex items-center gap-1.5 sm:gap-2 bg-[#09152E]/95 border border-blue-400/50 rounded-full px-3 py-1.5 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setAvatarRotation((r) => r - 45);
            }}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-blue-600 text-white flex items-center justify-center transition-all active:scale-90"
            title="Virar p/ Esquerda"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              setAvatarRotation(0);
            }}
            className="text-[10px] font-mono font-bold text-slate-300 hover:text-white flex items-center gap-1 px-1"
            title="Centralizar de Frente"
          >
            <span className="text-amber-400">↺</span>
            <span className="text-cyan-300">{Math.round(((avatarRotation % 360) + 360) % 360)}°</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              setAvatarRotation((r) => r + 45);
            }}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-blue-600 text-white flex items-center justify-center transition-all active:scale-90"
            title="Virar p/ Direita"
          >
            <RotateCcw className="w-3.5 h-3.5 -scale-x-100" />
          </button>

          <div className="w-[1px] h-4 bg-blue-400/30 mx-0.5" />

          {/* EDITAR ATLETA button neatly integrated */}
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onOpenAvatarEditor();
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-300/40 rounded-full text-white font-heading font-black text-[11px] uppercase tracking-wider shadow-md transition-all active:scale-95"
            title="Personalizar Cabelo, Barba, Chuteira e Uniforme"
          >
            <span>EDITAR</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* Right Floating Vertical Buttons */}
        <div className="absolute right-3 top-4 z-20 flex flex-col gap-2.5">
          {/* Olheiro / Scouting button */}
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onOpenScouting();
            }}
            className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 border border-cyan-300/50 flex items-center justify-center text-white shadow-lg transition-transform active:scale-90"
            title="Olheiro / Scouting: Recrutar Jovens Promessas"
          >
            <Search className="w-5 h-5 text-cyan-200 stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full" />
          </button>

          {/* Social Network / Messages button */}
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onOpenSocialFeed();
            }}
            className="relative w-10 h-10 rounded-xl bg-[#1A2C5B]/90 hover:bg-[#253D7D] border border-blue-400/30 flex items-center justify-center text-white shadow-lg transition-transform active:scale-90"
            title="Rede Social da Torcida"
          >
            <MessageCircle className="w-5 h-5 text-cyan-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
              4
            </span>
          </button>

          {/* Mercado da Bola / Sala de Negociação button */}
          <button
            type="button"
            onClick={() => {
              playSound('paper');
              onOpenNegotiationRoom();
            }}
            className="relative w-10 h-10 rounded-xl bg-[#1A2C5B]/90 hover:bg-[#253D7D] border border-emerald-400/40 flex items-center justify-center text-white shadow-lg transition-transform active:scale-90"
            title="Mercado da Bola / Sala de Negociação"
          >
            <Briefcase className="w-5 h-5 text-emerald-400" />
            {activeTransferOffersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center animate-pulse shadow">
                {activeTransferOffersCount}
              </span>
            )}
          </button>

          {/* Centro de Treinamento button */}
          <button
            type="button"
            disabled={!isTrainingAvailable}
            onClick={() => {
              if (!isTrainingAvailable) return;
              playSound('whistle');
              onOpenTraining();
            }}
            className={`relative w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
              isTrainingAvailable
                ? 'bg-gradient-to-br from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 border-amber-300/50 text-slate-950'
                : 'bg-slate-900/80 border-slate-700/60 text-slate-500 cursor-not-allowed'
            }`}
            title={
              isTrainingAvailable
                ? 'Centro de Treinamento (Disponível!)'
                : 'Treino bloqueado: jogue ou simule uma partida para liberar!'
            }
          >
            <Target className="w-5 h-5 stroke-[2.5]" />
            {!isTrainingAvailable ? (
              <span className="absolute -top-1 -right-1 text-[9px] bg-slate-950 px-0.5 rounded-full border border-slate-700">🔒</span>
            ) : (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse border border-slate-950 shadow" />
            )}
          </button>

          {/* Sala de Troféus button */}
          <button
            type="button"
            onClick={() => {
              playSound('goal');
              onOpenTrophyRoom();
            }}
            className="relative w-10 h-10 rounded-xl bg-[#1A2C5B]/90 hover:bg-[#253D7D] border border-amber-400/40 flex items-center justify-center text-white shadow-lg transition-transform active:scale-90"
            title="Sala de Troféus"
          >
            <Trophy className="w-5 h-5 text-amber-400" />
            {unlockedTrophyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center shadow">
                {unlockedTrophyCount}
              </span>
            )}
          </button>
        </div>

        {/* Matchup & Action Card - Compact Redesign */}
        <div className="relative z-20 w-full px-3 pb-1">
          {/* Energy Warning / Recovery Toast */}
          {energyToast && (
            <div className="mb-1 py-1.5 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-center text-[11px] font-bold shadow-lg animate-fade-in flex items-center justify-center gap-1.5 border border-cyan-300/40">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
              <span>{energyToast}</span>
            </div>
          )}

          {/* SELEÇÃO BRASILEIRA CARD (Appears when player is called up to Seleção BR) */}
          {isCalledUpToSelecao && (
            <div className="mb-2 bg-gradient-to-r from-yellow-500/20 via-emerald-600/20 to-yellow-500/20 border-2 border-yellow-400/80 rounded-xl p-2 sm:p-2.5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-yellow-400/30">
                <div className="flex items-center gap-1.5">
                  <span className="text-base animate-bounce">🇧🇷</span>
                  <div>
                    <div className="text-[10px] font-heading font-black text-yellow-300 uppercase tracking-wider flex items-center gap-1">
                      <span>SELEÇÃO BRASILEIRA</span>
                      <span className="bg-yellow-400 text-slate-950 px-1 py-0.2 rounded text-[8px] font-extrabold">CONVOCADO</span>
                    </div>
                    <div className="text-[9px] text-slate-300 font-medium">
                      {targetSelecaoMatch
                        ? `${targetSelecaoMatch.title}`
                        : 'Próxima convocação internacional em breve'}
                    </div>
                  </div>
                </div>
                {targetSelecaoMatch && (
                  <span className="text-[9px] font-bold text-yellow-300 font-mono bg-black/50 px-1.5 py-0.5 rounded border border-yellow-500/30">
                    {targetSelecaoMatch.monthName} · D{targetSelecaoMatch.dayNumber}
                  </span>
                )}
              </div>

              {/* Action Button: ONLY available when it is NOT a club match day! */}
              {isClubMatchDay ? (
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled
                    className="w-full py-1.5 px-2 bg-slate-800/90 border border-slate-700/80 rounded-lg text-slate-400 font-heading font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed opacity-75"
                    title={`Bloqueado: Hoje você joga pelo ${currentClub?.name || 'seu clube'}`}
                  >
                    <span>🔒 JOGAR PARTIDA DA SELEÇÃO BR</span>
                  </button>
                  <div className="text-[9px] text-amber-300 text-center flex items-center justify-center gap-1 bg-amber-950/60 py-0.5 px-2 rounded border border-amber-500/30 font-medium">
                    <span>⚠️</span>
                    <span>Hoje é dia de jogo pelo clube ({currentClub?.name || 'Seu Clube'}). A Seleção só joga em dias livres!</span>
                  </div>
                </div>
              ) : targetSelecaoMatch ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (energy <= 0) {
                          playSound('card');
                          setEnergyToast('⚠️ Sem energia! Clique em DESCANSAR para recuperar 100% de energia.');
                          setTimeout(() => setEnergyToast(null), 3500);
                          return;
                        }
                        playSound('whistle');
                        if (onPlaySelecaoMatch) {
                          onPlaySelecaoMatch(targetSelecaoMatch.globalDayIndex);
                        } else {
                          onEnterField();
                        }
                      }}
                      className="flex-1 py-1.5 px-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-emerald-500 hover:from-yellow-300 hover:to-emerald-400 rounded-lg text-slate-950 font-heading font-black text-[11px] uppercase tracking-wider shadow-lg shadow-yellow-500/20 transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <span className="text-sm">🇧🇷</span>
                      <span>JOGAR PARTIDA DA SELEÇÃO BR</span>
                    </button>
                    {onSimulateSelecaoMatch && (
                      <button
                        type="button"
                        onClick={() => {
                          if (energy <= 0) {
                            playSound('card');
                            setEnergyToast('⚠️ Sem energia! Clique em DESCANSAR para recuperar 100% de energia.');
                            setTimeout(() => setEnergyToast(null), 3500);
                            return;
                          }
                          playSound('whistle');
                          onSimulateSelecaoMatch(targetSelecaoMatch.globalDayIndex);
                        }}
                        className="py-1.5 px-2.5 bg-emerald-700/90 hover:bg-emerald-600 border border-emerald-400/40 rounded-lg text-white font-heading font-bold text-[10px] uppercase tracking-wide transition-all active:scale-95 flex items-center gap-1"
                        title="Simular Partida da Seleção BR (Gasta 1 de energia)"
                      >
                        <Zap className="w-3 h-3 text-yellow-300" />
                        <span>SIMULAR</span>
                      </button>
                    )}
                  </div>
                  <div className="text-[9px] text-emerald-300 text-center flex items-center justify-center gap-1 bg-emerald-950/60 py-0.5 px-2 rounded border border-emerald-500/30 font-medium">
                    <span>✅</span>
                    <span>Dia livre no clube! Você está 100% liberado para jogar pela Seleção Brasileira.</span>
                  </div>
                </div>
              ) : (
                <div className="text-[9px] text-yellow-200/90 text-center py-1">
                  🇧🇷 Todas as partidas da convocação atual foram disputadas! Aguarde os próximos amistosos internacionais.
                </div>
              )}
            </div>
          )}

          <div className="bg-gradient-to-b from-[#0F224D]/95 to-[#0A1738]/95 border border-blue-500/40 rounded-xl p-2 sm:p-2.5 shadow-xl backdrop-blur-md">
            {/* Tournament Ribbon Header */}
            <div className="flex items-center justify-between text-[11px] font-heading font-black text-white pb-1 mb-1.5 border-b border-blue-500/20">
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="text-amber-400">W1</span> {nextMatchDay?.competition || 'Taça Samba'}
                <span className="text-[9px] text-slate-400 font-normal">
                  ({nextMatchDay?.matchIndexInComp || 1}/9)
                </span>
              </span>
              <span className="text-slate-300 uppercase tracking-wider text-[9px]">
                {currentDayData.monthName} · Dia {currentDayData.dayNumber}
              </span>
            </div>

            {/* Team vs Team Row (Compact) */}
            <div className="flex items-center justify-between px-1 mb-1.5">
              {/* Casa: Current Club */}
              <div className="flex flex-col items-center text-center w-24">
                <span className="text-[9px] text-slate-400 uppercase font-semibold">Casa</span>
                <div
                  className="w-7 h-7 rounded-md text-slate-950 flex items-center justify-center text-sm font-black shadow border border-white/20 my-0.5"
                  style={{ backgroundColor: currentClub?.primaryColor || '#F7D002' }}
                >
                  {currentClub?.badge || '👑'}
                </div>
                <span className="text-[11px] font-bold text-white leading-tight truncate w-full">
                  {currentClub?.name || 'Manaus Gold'}
                </span>
                <div className="flex gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-xs ${
                        i < 3 ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Center VS */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Hoje</span>
                <span className="font-heading font-black text-lg text-white tracking-wider my-0 leading-none">VS</span>
                <span className="text-[8px] text-slate-400">{currentDayData.monthName}</span>
              </div>

              {/* Fora: Opponent */}
              <div className="flex flex-col items-center text-center w-24">
                <span className="text-[9px] text-slate-400 uppercase font-semibold">Fora</span>
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold shadow border border-slate-700 my-0.5"
                  style={{
                    backgroundColor: opponent.primaryColor,
                    color: opponent.secondaryColor,
                  }}
                >
                  {opponent.badge}
                </div>
                <span className="text-[11px] font-bold text-white leading-tight truncate w-full">
                  {opponent.name}
                </span>
                <div className="flex gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-xs ${
                        i % 2 === 0 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons: Compact 2-row layout */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                {/* ENTRAR EM CAMPO button */}
                <button
                  type="button"
                  onClick={() => {
                    if (energy <= 0) {
                      playSound('card');
                      setEnergyToast('⚠️ Sem energia! Clique em DESCANSAR para recuperar 100% de energia.');
                      setTimeout(() => setEnergyToast(null), 3500);
                      return;
                    }
                    playSound('whistle');
                    onEnterField();
                  }}
                  className="flex-1 py-1.5 px-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-white font-heading font-black text-[11px] uppercase tracking-wider shadow-md shadow-blue-900/40 transition-all hover:scale-[1.01] active:scale-95 text-center flex items-center justify-center gap-1"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>ENTRAR EM CAMPO</span>
                </button>

                {/* DESCANSAR button (Recovers 100% of energy) */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    onRest();
                    setEnergyToast('⚡ 100% de Energia Recuperada com Sucesso!');
                    setTimeout(() => setEnergyToast(null), 3000);
                  }}
                  className="py-1.5 px-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-lg text-white font-heading font-black text-[10px] uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-cyan-200 fill-current" />
                  <span>DESCANSAR</span>
                </button>
              </div>

              {/* Row 2: Simular Rápido + Treinar Pênalti/Falta side by side */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (energy <= 0) {
                      playSound('card');
                      setEnergyToast('⚠️ Sem energia! Clique em DESCANSAR para recuperar 100% de energia.');
                      setTimeout(() => setEnergyToast(null), 3500);
                      return;
                    }
                    playSound('whistle');
                    onSimulateDirectly();
                  }}
                  className="py-1 px-1.5 bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 hover:from-teal-600 hover:to-emerald-600 border border-emerald-500/30 rounded-lg text-white font-heading font-bold text-[10px] uppercase tracking-wide shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1 truncate"
                  title="Simular Partida Automaticamente (Gasta 1 de energia)"
                >
                  <Zap className="w-3 h-3 text-amber-300 shrink-0" />
                  <span className="truncate">SIMULAR RÁPIDO</span>
                </button>

                <button
                  type="button"
                  disabled={!isTrainingAvailable}
                  onClick={() => {
                    if (!isTrainingAvailable) return;
                    playSound('whistle');
                    onOpenTraining();
                  }}
                  className={`py-1 px-1.5 rounded-lg font-heading font-black text-[10px] uppercase tracking-wide shadow-xs transition-all flex items-center justify-center gap-1 truncate ${
                    isTrainingAvailable
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 border border-amber-300/50 text-slate-950 active:scale-95'
                      : 'bg-slate-850 border border-slate-700/60 text-slate-400 cursor-not-allowed opacity-80'
                  }`}
                  title={
                    isTrainingAvailable
                      ? 'Treinar Finalização e Pênalti'
                      : 'Jogue ou simule uma partida para liberar o treino!'
                  }
                >
                  <Target className="w-3 h-3 stroke-[2.5] shrink-0" />
                  <span className="truncate">
                    {isTrainingAvailable ? 'TREINAR PÊNALTI/FALTA' : '🔒 JOGUE P/ TREINAR'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Tabs */}
      <nav className="relative z-30 w-full max-w-xl mx-auto bg-[#0A1636] border-t border-blue-500/20 px-2 py-1.5 flex items-center justify-around">
        <button
          type="button"
          onClick={() => {
            playSound('click');
            setActiveTab('central');
          }}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-all ${
            activeTab === 'central'
              ? 'text-cyan-400 bg-blue-900/40 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-base">⚽</span>
          <span className="text-[10px] font-heading">Central</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playSound('whistle');
            onEnterField();
          }}
          className="flex flex-col items-center py-1 px-2.5 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
        >
          <Calendar className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-heading">Calendário</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playSound('click');
            onOpenTactics();
          }}
          className="relative flex flex-col items-center py-1 px-2.5 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
        >
          <Users className="w-5 h-5 text-cyan-300" />
          <span className="text-[10px] font-heading">Escalar</span>
          <span className="absolute -top-0.5 right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center">
            11
          </span>
        </button>

        {/* Rede Social Tab */}
        <button
          type="button"
          onClick={() => {
            playSound('click');
            onOpenSocialFeed();
          }}
          className="relative flex flex-col items-center py-1 px-2.5 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
        >
          <MessageCircle className="w-5 h-5 text-purple-300" />
          <span className="text-[10px] font-heading">Torcida</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playSound('click');
            onOpenStats();
          }}
          className="flex flex-col items-center py-1 px-2.5 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
        >
          <MenuIcon className="w-5 h-5" />
          <span className="text-[10px] font-heading">Tabela</span>
        </button>
      </nav>
    </div>
  );
};
