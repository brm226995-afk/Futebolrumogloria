import React, { useState, useEffect } from 'react';
import { CalendarDay, ClubInfo, TeamPlayer, TransferOffer } from '../types/game';
import {
  Calendar as CalendarIcon,
  Trophy,
  Users,
  BarChart2,
  Play,
  ArrowLeft,
  Flame,
  CheckCircle2,
  Dumbbell,
  Coffee,
  ChevronRight,
  Shield,
  FastForward,
  Zap,
  Briefcase,
} from 'lucide-react';
import { playSound } from '../utils/audio';

interface SeasonCalendarProps {
  days: CalendarDay[];
  currentGlobalIndex: number;
  currentClub?: ClubInfo;
  onSelectMatch: (globalIndex: number, mode: 'PLAY' | 'SIMULATE') => void;
  onOpenTactics: () => void;
  onOpenStats: () => void;
  onBackToLobby: () => void;
  onOpenNegotiationRoom?: () => void;
  pendingTransferOffer?: TransferOffer | null;
  onTrain: () => void;
  onRest: () => void;
  onAutoAdvanceDay: (globalIndex: number) => void;
  players: TeamPlayer[];
  userCash: number;
  userEnergy: number;
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril'];

export const SeasonCalendar: React.FC<SeasonCalendarProps> = ({
  days,
  currentGlobalIndex,
  currentClub,
  onSelectMatch,
  onOpenTactics,
  onOpenStats,
  onBackToLobby,
  onOpenNegotiationRoom,
  pendingTransferOffer,
  onTrain,
  onRest,
  onAutoAdvanceDay,
  players,
  userCash,
  userEnergy,
}) => {
  const currentDayData =
    days.find((d) => d.globalDayIndex === currentGlobalIndex) || days[0];

  const [activeMonth, setActiveMonth] = useState<string>(
    currentDayData.monthName || 'Janeiro'
  );
  const [selectedGlobalIndex, setSelectedGlobalIndex] = useState<number>(currentGlobalIndex);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState<boolean>(true);
  const [advanceToast, setAdvanceToast] = useState<string | null>(null);

  const selectedDay =
    days.find((d) => d.globalDayIndex === selectedGlobalIndex) || currentDayData;

  const starters = players.filter((p) => p.isStarter);
  const teamOvr = Math.round(
    starters.reduce((acc, p) => acc + p.ovr, 0) / (starters.length || 1)
  );

  // Filter days for the active real month
  const monthDays = days.filter((d) => d.monthName === activeMonth);

  const isCurrentDayMatchPending =
    currentDayData.type === 'MATCH' && currentDayData.status !== 'COMPLETED';

  // Keep month and selected day in sync with global progression
  useEffect(() => {
    setSelectedGlobalIndex(currentGlobalIndex);
    if (currentDayData.monthName && currentDayData.monthName !== activeMonth) {
      setActiveMonth(currentDayData.monthName);
    }
  }, [currentGlobalIndex, currentDayData.monthName]);

  // Automatic Day-Passing Timer
  useEffect(() => {
    if (!isAutoAdvancing) return;

    // IF current day is a pending match, PAUSE and do not pass!
    if (isCurrentDayMatchPending) {
      return;
    }

    // IF reached end of season, stop
    if (currentGlobalIndex >= days.length && currentDayData.status === 'COMPLETED') {
      return;
    }

    const timer = setTimeout(() => {
      if (currentDayData.type === 'TRAINING') {
        playSound('click');
        setAdvanceToast(`${currentDayData.monthName} · Dia ${currentDayData.dayNumber}: Treino Tático realizado (+1 OVR / +XP)`);
      } else if (currentDayData.type === 'REST') {
        playSound('click');
        setAdvanceToast(`${currentDayData.monthName} · Dia ${currentDayData.dayNumber}: Recuperação Física (+Energia)`);
      } else if (currentDayData.type === 'EVENT') {
        playSound('click');
        setAdvanceToast(`${currentDayData.monthName} · Dia ${currentDayData.dayNumber}: Evento & Patrocínio (+€2K)`);
      }

      onAutoAdvanceDay(currentGlobalIndex);
    }, 700);

    return () => clearTimeout(timer);
  }, [currentGlobalIndex, isAutoAdvancing, isCurrentDayMatchPending, currentDayData, onAutoAdvanceDay, days.length]);

  return (
    <div className="relative w-full min-h-screen bg-[#070D1E] text-white flex flex-col overflow-x-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0B152E]/95 backdrop-blur-md border-b border-blue-500/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              onBackToLobby();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Lobby
          </button>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-heading text-base sm:text-lg font-bold text-white tracking-wide">
                CALENDÁRIO DA TEMPORADA
              </h1>
              <p className="text-[11px] text-slate-400">
                {currentDayData.monthName} · Dia {currentDayData.dayNumber} de 30 · {currentDayData.competition || 'Taça Samba'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-2">
          {/* Auto advance toggle */}
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setIsAutoAdvancing(!isAutoAdvancing);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
              isCurrentDayMatchPending
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                : isAutoAdvancing
                ? 'bg-emerald-600/80 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isCurrentDayMatchPending ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Pausado (Dia de Jogo)</span>
              </>
            ) : isAutoAdvancing ? (
              <>
                <FastForward className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                <span className="hidden sm:inline">Passando Dias...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-300" />
                <span className="hidden sm:inline">Avançar Dias</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              onOpenTactics();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md"
          >
            <Users className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Escalar Time</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              onOpenStats();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Tabela</span>
          </button>
        </div>
      </header>

      {/* Advance Toast Banner */}
      {advanceToast && (
        <div className="w-full bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-blue-900/90 py-1.5 px-4 text-center border-b border-cyan-500/30">
          <span className="text-xs font-bold text-cyan-300 animate-pulse">
            ⚡ {advanceToast}
          </span>
        </div>
      )}

      {/* MATCH DAY LOCK ALERT BANNER */}
      {isCurrentDayMatchPending && (
        <div className="w-full bg-amber-950/70 border-b border-amber-500/50 py-2 px-4 text-center">
          <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wide">
            🚨 DIA DE JOGO: O calendário está pausado aguardando a partida contra {currentDayData.opponent?.name}! Escolha jogar ou simular automaticamente.
          </span>
        </div>
      )}

      {/* Real Month Selector Tabs */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {MONTHS.map((month) => {
            const isSelected = activeMonth === month;
            const compLabel = month === 'Janeiro' ? 'Taça Samba (9 Jogos)' : 'Camp. Nacional (18 Jogos)';

            return (
              <button
                key={month}
                type="button"
                onClick={() => {
                  playSound('click');
                  setActiveMonth(month);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-black transition-all flex flex-col items-start ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-lg scale-105'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{month} (30 dias)</span>
                <span className={`text-[9px] font-normal ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  {compLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-5">
        {/* Left Side: 30-Day Grid for Active Month */}
        <div className="flex-1 flex flex-col bg-[#0B152E] border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Mês de {activeMonth} (30 Dias)
              </span>
            </div>
            <div className="text-xs text-amber-400 font-bold">
              {activeMonth === 'Janeiro' ? 'Taça Samba (9 Partidas)' : 'Campeonato Nacional (18 Partidas)'}
            </div>
          </div>

          {/* Days Grid: 6 rows x 5 cols for 30 days */}
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
            {monthDays.map((day) => {
              const isCurrent = day.globalDayIndex === currentGlobalIndex;
              const isSelected = day.globalDayIndex === selectedGlobalIndex;
              const isCompleted = day.status === 'COMPLETED';
              const isMatch = day.type === 'MATCH';

              return (
                <button
                  key={day.globalDayIndex}
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setSelectedGlobalIndex(day.globalDayIndex);
                  }}
                  className={`relative flex flex-col items-center justify-between p-2 rounded-xl border transition-all text-left min-h-[76px] sm:min-h-[86px] ${
                    isSelected
                      ? 'ring-2 ring-amber-400 shadow-lg scale-105 z-10 bg-slate-800'
                      : isCurrent
                      ? 'border-amber-400/80 bg-amber-950/30 shadow-md ring-2 ring-amber-500/40'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : isCompleted
                          ? 'bg-emerald-600/30 text-emerald-300'
                          : 'text-slate-400'
                      }`}
                    >
                      D{day.dayNumber}
                    </span>

                    {isCompleted && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}

                    {isCurrent && !isCompleted && isMatch && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    )}
                  </div>

                  <div className="w-full flex flex-col items-center justify-center my-1">
                    {isMatch ? (
                      <>
                        <span className="text-base sm:text-lg mb-0.5">{day.opponent?.badge || '⚽'}</span>
                        <span className="text-[10px] font-bold text-center text-slate-200 line-clamp-1 w-full">
                          {day.opponent?.shortName}
                        </span>
                      </>
                    ) : day.type === 'TRAINING' ? (
                      <>
                        <Dumbbell className="w-4 h-4 text-cyan-400 mb-0.5" />
                        <span className="text-[9px] text-slate-400">Treino</span>
                      </>
                    ) : day.type === 'REST' ? (
                      <>
                        <Coffee className="w-4 h-4 text-emerald-400 mb-0.5" />
                        <span className="text-[9px] text-slate-400">Descanso</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4 text-purple-400 mb-0.5" />
                        <span className="text-[9px] text-slate-400">Evento</span>
                      </>
                    )}
                  </div>

                  <div className="w-full text-center">
                    {isMatch && isCompleted && day.matchStats ? (
                      <span className="text-[11px] font-bold text-amber-300 font-mono">
                        {day.matchStats.homeScore} x {day.matchStats.awayScore}
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider">
                        {isMatch ? 'JOGO!' : 'HOJE'}
                      </span>
                    ) : (
                      <span className="text-[8px] text-slate-500">
                        {day.type === 'MATCH' ? (day.isHome ? 'Casa' : 'Fora') : 'Livre'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Partida Oficial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Treino (+OVR)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Descanso (+Energia)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Selected Day Card Details */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          <div className="bg-[#0B152E] border border-blue-500/30 rounded-2xl p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {selectedDay.monthName} · Dia {selectedDay.dayNumber}
                </span>
                <h3 className="font-heading text-lg font-bold text-white">
                  {selectedDay.title}
                </h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  selectedDay.status === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : selectedDay.globalDayIndex === currentGlobalIndex
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {selectedDay.status === 'COMPLETED'
                  ? 'Realizado'
                  : selectedDay.globalDayIndex === currentGlobalIndex
                  ? 'Dia Atual'
                  : 'Futuro'}
              </span>
            </div>

            {/* If MATCH day */}
            {selectedDay.type === 'MATCH' && selectedDay.opponent ? (
              <div className="py-4 flex flex-col gap-4">
                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800">
                  <div className="text-[11px] font-bold text-center text-amber-400 uppercase tracking-widest mb-3">
                    {selectedDay.competition || 'Taça Samba'} · {selectedDay.isHome ? 'Jogo em Casa' : 'Jogo Fora'}
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col items-center text-center w-28">
                      <div
                        className="w-12 h-12 rounded-xl text-slate-950 flex items-center justify-center font-black text-xl shadow-lg border border-white/20 mb-1.5"
                        style={{ backgroundColor: currentClub?.primaryColor || '#F7D002' }}
                      >
                        {currentClub?.badge || '👑'}
                      </div>
                      <span className="text-xs font-bold text-white">
                        {currentClub?.name || 'Manaus Gold'}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold">GERAL {teamOvr}</span>
                    </div>

                    <div className="flex flex-col items-center">
                      {selectedDay.status === 'COMPLETED' && selectedDay.matchStats ? (
                        <div className="text-2xl font-black font-heading text-amber-300">
                          {selectedDay.matchStats.homeScore} - {selectedDay.matchStats.awayScore}
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 rounded bg-black/60 border border-slate-700 text-xs font-black text-amber-400">
                          VS
                        </div>
                      )}
                      <span className="text-[10px] text-slate-400 mt-1">90 Minutos</span>
                    </div>

                    <div className="flex flex-col items-center text-center w-28">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg border border-slate-700 mb-1.5"
                        style={{
                          backgroundColor: selectedDay.opponent.primaryColor,
                          color: selectedDay.opponent.secondaryColor,
                        }}
                      >
                        {selectedDay.opponent.badge}
                      </div>
                      <span className="text-xs font-bold text-white">{selectedDay.opponent.name}</span>
                      <span className="text-[10px] text-blue-400 font-bold">GERAL {selectedDay.opponent.ovr}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cidade:</span>
                      <span className="font-medium">{selectedDay.opponent.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Destaque:</span>
                      <span className="font-bold text-amber-300">{selectedDay.opponent.starPlayer}</span>
                    </div>
                  </div>
                </div>

                {/* Match Action Buttons: JOGAR ou SIMULAR AUTOMATICAMENTE */}
                {selectedDay.globalDayIndex === currentGlobalIndex && selectedDay.status !== 'COMPLETED' ? (
                  <div className="flex flex-col gap-2">
                    {/* Option 1: JOGAR PARTIDA (with live simulation and 10-min highlight action) */}
                    <button
                      type="button"
                      onClick={() => {
                        playSound('whistle');
                        onSelectMatch(selectedDay.globalDayIndex, 'PLAY');
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-blue-900/50 transition-all hover:scale-[1.01] active:scale-95 animate-pulse"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      JOGAR PARTIDA COMPLETA
                    </button>

                    {/* Option 2: SIMULAR AUTOMATICAMENTE */}
                    <button
                      type="button"
                      onClick={() => {
                        playSound('whistle');
                        onSelectMatch(selectedDay.globalDayIndex, 'SIMULATE');
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                      <Zap className="w-4 h-4 text-amber-300" />
                      SIMULAR AUTOMATICAMENTE (RESULTADO RÁPIDO)
                    </button>
                  </div>
                ) : selectedDay.status === 'COMPLETED' ? (
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      onSelectMatch(selectedDay.globalDayIndex, 'PLAY');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <BarChart2 className="w-4 h-4" />
                    Ver Estatísticas da Partida
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                    O calendário passará automaticamente até este Dia {selectedDay.dayNumber} quando a partida anterior for jogada!
                  </div>
                )}
              </div>
            ) : selectedDay.type === 'TRAINING' ? (
              <div className="py-4 flex flex-col gap-4">
                <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2">
                    <Dumbbell className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-white mb-1">Sessão de Treinamento</h4>
                  <p className="text-xs text-slate-400">
                    Aprimora atributos e condicionamento técnico dos atletas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4 flex flex-col gap-4">
                <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                    <Coffee className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-white mb-1">Dia de Recuperação</h4>
                  <p className="text-xs text-slate-400">
                    Permite aos atletas descansarem e recuperarem 100% da energia física.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-auto pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  onOpenTactics();
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Ajustar Escalação do Time</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
