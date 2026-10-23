import React, { useState, useEffect, useRef } from 'react';
import {
  AvatarConfig,
  MatchStats,
  OpponentTeam,
  TacticsSettings,
  TeamPlayer,
  HighlightScenarioType,
  RefereeIntervention,
} from '../types/game';
import { playSound } from '../utils/audio';
import { Play, Pause, FastForward, Zap, Shield, Sparkles, ChevronRight } from 'lucide-react';
import { HighlightGameplayCanvas } from './HighlightGameplayCanvas';

interface MatchSimulationViewProps {
  opponent: OpponentTeam;
  isHome: boolean;
  avatar: AvatarConfig;
  players: TeamPlayer[];
  tactics: TacticsSettings;
  onFinishMatch: (finalStats: MatchStats) => void;
  onBackToCalendar: () => void;
  homeTeamName?: string;
  homeTeamBadge?: string;
  competitionName?: string;
}

export const MatchSimulationView: React.FC<MatchSimulationViewProps> = ({
  opponent,
  isHome,
  avatar,
  players,
  tactics,
  onFinishMatch,
  onBackToCalendar,
  homeTeamName = 'Manaus Gold',
  homeTeamBadge = '🦁',
  competitionName,
}) => {
  const [minute, setMinute] = useState<number>(0);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<1 | 2 | 6>(2);
  const [playerRating, setPlayerRating] = useState<number>(6.0);
  const [playerGoals, setPlayerGoals] = useState<number>(0);
  const [playerAssists, setPlayerAssists] = useState<number>(0);
  const [playerEnergy, setPlayerEnergy] = useState<number>(96);

  // Mode: SIMULATION or PLAYABLE_HIGHLIGHT
  const [isHighlightActive, setIsHighlightActive] = useState<boolean>(false);
  const [highlightsPlayed, setHighlightsPlayed] = useState<number>(0);
  const [highlightScenario, setHighlightScenario] = useState<HighlightScenarioType>('OPEN_PLAY');
  const [highlightReferee, setHighlightReferee] = useState<RefereeIntervention | null>(null);

  // Live Portuguese commentary ticker matching Screenshot 2
  const [commentary, setCommentary] = useState<string>(
    '0\' · Apita o árbitro! Começa o duelo com muita disputa em campo!'
  );
  const [eventsLog, setEventsLog] = useState<MatchStats['events']>([]);

  // 2D Token Positions on Field
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Home player tokens (Manaus Gold - Yellow)
  const [homeTokens, setHomeTokens] = useState([
    { id: '1', num: 1, name: 'Mathios', x: 50, y: 88 },
    { id: '4', num: 4, name: 'Rodrigo', x: 38, y: 74 },
    { id: '5', num: 5, name: 'Wallace', x: 62, y: 74 },
    { id: '3', num: 3, name: 'G. Silva', x: 18, y: 70 },
    { id: '2', num: 2, name: 'B. Lima', x: 82, y: 70 },
    { id: '6', num: 6, name: 'Ricerda', x: 34, y: 55 },
    { id: '8', num: 8, name: 'P. Henrique', x: 66, y: 55 },
    { id: '10', num: 10, name: 'Ronald', x: 50, y: 44 },
    { id: '7', num: 7, name: 'Luan', x: 80, y: 32 },
    { id: '11', num: 11, name: 'Yuri', x: 20, y: 32 },
    { id: '9', num: avatar.number || 9, name: avatar.name || 'Messias', x: 50, y: 28, isHero: true },
  ]);

  // Away player tokens (Opponent - White)
  const [awayTokens, setAwayTokens] = useState([
    { id: 'a1', num: 1, name: 'Goleiro', x: 50, y: 12 },
    { id: 'a4', num: 4, name: 'Zaga', x: 60, y: 24 },
    { id: 'a5', num: 5, name: 'Zaga', x: 40, y: 24 },
    { id: 'a3', num: 3, name: 'Lateral', x: 25, y: 28 },
    { id: 'a2', num: 2, name: 'Lateral', x: 75, y: 28 },
    { id: 'a7', num: 7, name: 'Meia', x: 28, y: 45 },
    { id: 'a6', num: 6, name: 'Volante', x: 50, y: 48 },
    { id: 'a8', num: 8, name: 'Meia', x: 72, y: 45 },
    { id: 'a10', num: 10, name: opponent.starPlayer, x: 52, y: 58 },
    { id: 'a11', num: 11, name: 'Ponta', x: 38, y: 64 },
    { id: 'a9', num: 9, name: 'Atacante', x: 32, y: 68 },
  ]);

  // Handle Match Simulation Clock
  useEffect(() => {
    if (isPaused || isHighlightActive) return;

    const intervalTime = speed === 6 ? 250 : speed === 2 ? 650 : 1200;

    const timer = setInterval(() => {
      setMinute((prev) => {
        const nextMin = prev + 1;

        // Drain energy gradually
        if (nextMin % 10 === 0) {
          setPlayerEnergy((e) => Math.max(70, e - 1));
        }

        // Animate 2D tokens and ball randomly around pitch
        setBallPos({
          x: Math.max(15, Math.min(85, 50 + (Math.random() - 0.5) * 60)),
          y: Math.max(15, Math.min(85, 50 + (Math.random() - 0.5) * 60)),
        });

        setHomeTokens((tokens) =>
          tokens.map((t) => ({
            ...t,
            x: Math.max(10, Math.min(90, t.x + (Math.random() - 0.5) * 3)),
            y: Math.max(10, Math.min(90, t.y + (Math.random() - 0.5) * 3)),
          }))
        );

        setAwayTokens((tokens) =>
          tokens.map((t) => ({
            ...t,
            x: Math.max(10, Math.min(90, t.x + (Math.random() - 0.5) * 3)),
            y: Math.max(10, Math.min(90, t.y + (Math.random() - 0.5) * 3)),
          }))
        );

        // Check for interactive highlight trigger moments!
        // At 24', 58', 84' trigger an interactive gameplay moment!
        if (nextMin === 24 && highlightsPlayed < 3) {
          // 24': Falta perigosa cometida pelo adversário com Cartão Amarelo (Falta leve/tática)
          const intervention: RefereeIntervention = {
            type: 'YELLOW_CARD',
            reason: `Falta tática perigosa! O zagueiro adversário puxou ${avatar.name || 'Gabriel M.'} na meia-lua da grande área!`,
            offendingPlayer: `Zagueiro (${opponent.shortName})`,
            offendingTeam: opponent.name,
            foulSeverity: 'LIGHT',
            awardedAction: 'FREE_KICK',
          };
          playSound('referee_whistle');
          setHighlightScenario('FREE_KICK');
          setHighlightReferee(intervention);
          setIsHighlightActive(true);
          setHighlightsPlayed((h) => h + 1);
          setCommentary(
            `${nextMin}' · FALTA MARCADA! Árbitro aplica CARTÃO AMARELO para o zagueiro do ${opponent.name}! ${avatar.name || 'Gabriel M.'} na cobrança!`
          );
          setEventsLog((logs) => [
            ...logs,
            {
              minute: nextMin,
              team: 'away',
              type: 'yellow_card',
              player: `Zagueiro (${opponent.shortName})`,
              description: `Cartão Amarelo por puxão em ${avatar.name || 'Gabriel M.'}`,
            },
          ]);
          return nextMin;
        }

        if (nextMin === 58 && highlightsPlayed < 3) {
          // 58': Jogada corrida aberta com triangulação rápida
          playSound('whistle');
          setHighlightScenario('OPEN_PLAY');
          setHighlightReferee(null);
          setIsHighlightActive(true);
          setHighlightsPlayed((h) => h + 1);
          setCommentary(
            `${nextMin}' · GRANDE CHANCE! Bela triangulação no ataque e ${avatar.name || 'Gabriel M.'} recebe com espaço na entrada da área!`
          );
          return nextMin;
        }

        if (nextMin === 84 && highlightsPlayed < 3) {
          // 84': Pênalti a favor com falta grave e Cartão Vermelho direto!
          const intervention: RefereeIntervention = {
            type: 'RED_CARD',
            reason: `PÊNALTI E EXPULSÃO! Entrada violenta por trás de carrinho em ${avatar.name || 'Gabriel M.'} cara a cara com o goleiro!`,
            offendingPlayer: `Zagueiro Central (${opponent.shortName})`,
            offendingTeam: opponent.name,
            foulSeverity: 'SEVERE',
            awardedAction: 'PENALTY',
          };
          playSound('referee_whistle');
          setHighlightScenario('PENALTY');
          setHighlightReferee(intervention);
          setIsHighlightActive(true);
          setHighlightsPlayed((h) => h + 1);
          setCommentary(
            `${nextMin}' · PÊNALTI MARCADO! O árbitro expulsa o defensor com CARTÃO VERMELHO DIRETO! ${avatar.name || 'Gabriel M.'} na marca da cal!`
          );
          setEventsLog((logs) => [
            ...logs,
            {
              minute: nextMin,
              team: 'away',
              type: 'red_card',
              player: `Zagueiro Central (${opponent.shortName})`,
              description: `Cartão Vermelho direto e Pênalti cometido em ${avatar.name || 'Gabriel M.'}`,
            },
          ]);
          return nextMin;
        }

        // Random commentary narrative events
        if (nextMin % 6 === 0) {
          const commentaries = [
            `${nextMin}' · Mathios tenta furar a defesa com passes verticais.`,
            `${nextMin}' · Manaus Gold avança pelo meio com triangulação rápida.`,
            `${nextMin}' · ${avatar.name || 'Messias'} briga com os zagueiros e ganha escanteio!`,
            `${nextMin}' · ${opponent.name} pressiona na marcação alta!`,
            `${nextMin}' · Ricerda desarma no meio de campo com categoria.`,
            `${nextMin}' · Bela tabela entre os atacantes do Manaus Gold!`,
            `${nextMin}' · Falta perigosa cavada na intermediária!`,
          ];
          const text = commentaries[Math.floor(Math.random() * commentaries.length)];
          setCommentary(text);
        }

        // Random opponent goal chance (low probability)
        if (nextMin === 36 && awayScore === 0 && Math.random() < 0.4) {
          setAwayScore((s) => s + 1);
          playSound('kick');
          setCommentary(`${nextMin}' · GOL DO ${opponent.name.toUpperCase()}! ${opponent.starPlayer} finalizou cruzado.`);
          setEventsLog((logs) => [
            ...logs,
            {
              minute: nextMin,
              team: 'away',
              type: 'goal',
              player: opponent.starPlayer,
              description: `Gol de ${opponent.starPlayer}`,
            },
          ]);
        }

        // Full Time Whistle at 90'
        if (nextMin >= 90) {
          clearInterval(timer);
          playSound('whistle');

          const finalStats: MatchStats = {
            homeScore,
            awayScore,
            homeShots: 11 + (playerGoals > 0 ? playerGoals : 0),
            awayShots: 6 + awayScore,
            homeShotsOnTarget: 6 + playerGoals,
            awayShotsOnTarget: 3 + awayScore,
            homePossession: 56,
            awayPossession: 44,
            homePassAccuracy: 84,
            awayPassAccuracy: 78,
            homeFouls: 7,
            awayFouls: 9,
            homeCorners: 5,
            awayCorners: 3,
            playerRating: Number(playerRating.toFixed(1)),
            playerGoals,
            playerAssists,
            events: eventsLog,
          };

          setTimeout(() => {
            onFinishMatch(finalStats);
          }, 1500);
          return 90;
        }

        return nextMin;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, speed, isHighlightActive, homeScore, awayScore, highlightsPlayed, playerGoals, playerRating, avatar, opponent, eventsLog, onFinishMatch]);

  // When goal is scored during Interactive Highlight
  const handleHighlightGoal = () => {
    setHomeScore((s) => s + 1);
    setPlayerGoals((g) => g + 1);
    setPlayerRating((r) => Math.min(10, r + 1.2));
    setEventsLog((prev) => [
      ...prev,
      {
        minute,
        team: 'home',
        type: 'goal',
        player: avatar.name || 'Messias',
        description: `GOLAÇO de ${avatar.name || 'Messias'} com curva incrível!`,
      },
    ]);
  };

  // When interactive highlight finishes, resume simulation
  const handleHighlightFinished = (outcome: 'GOAL' | 'SAVED' | 'MISSED') => {
    setIsHighlightActive(false);
    if (outcome === 'GOAL') {
      setCommentary(`${minute}' · GOOOL DO MANAUS GOLD! Explosão da torcida nas arquibancadas!`);
    } else if (outcome === 'SAVED') {
      setCommentary(`${minute}' · Quase o gol! O goleiro espalmou para escanteio!`);
    } else {
      setCommentary(`${minute}' · Finalização perigosa que saiu raspando a trave!`);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#070E20] text-white flex flex-col justify-between overflow-hidden">
      {/* If Interactive Highlight is active (Screenshot 3 view) */}
      {isHighlightActive ? (
        <HighlightGameplayCanvas
          avatar={avatar}
          onGoalScored={handleHighlightGoal}
          onHighlightFinished={handleHighlightFinished}
          homeTeamName={homeTeamName}
          awayTeamName={opponent.name}
          currentMinute={minute}
          scenario={highlightScenario}
          refereeIntervention={highlightReferee}
        />
      ) : (
        /* Tactical 2D Pitch View matching Screenshot 2 */
        <div className="flex-1 flex flex-col justify-between max-w-xl w-full mx-auto p-2 sm:p-3">
          {/* Top Header Match Scoreboard matching Screenshot 2 */}
          <div className="w-full flex flex-col gap-2 z-20">
            {/* Team Names & Big Score Header */}
            <div className="grid grid-cols-3 items-center bg-[#0B152F] border border-blue-500/20 rounded-xl px-2 py-1.5 shadow-lg">
              {/* Home Team */}
              <div
                className="flex items-center gap-2 font-bold px-3 py-1.5 rounded-lg shadow-sm"
                style={{
                  backgroundColor: competitionName === 'Seleção BR' ? '#FACC15' : '#F59E0B',
                  color: '#020617',
                }}
              >
                <span className="text-base">{homeTeamBadge}</span>
                <span className="text-xs sm:text-sm font-heading font-black tracking-wide truncate">
                  {homeTeamName.toUpperCase()}
                </span>
              </div>

              {/* Score & Minute Box */}
              <div className="flex items-center justify-center gap-2">
                <span className="font-heading font-black text-xl sm:text-2xl text-white">
                  {homeScore} - {awayScore}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono text-xs font-bold border border-blue-700/40">
                  {minute}'
                </span>
              </div>

              {/* Opponent */}
              <div
                className="flex items-center justify-end gap-2 px-3 py-1.5 rounded-lg shadow-sm font-bold truncate text-right"
                style={{
                  backgroundColor: opponent.primaryColor,
                  color: opponent.secondaryColor,
                }}
              >
                <span className="text-xs sm:text-sm font-heading font-black tracking-wide truncate">
                  {opponent.shortName.toUpperCase()}
                </span>
                <span className="text-base">{opponent.badge}</span>
              </div>
            </div>

            {/* Tactical Controls Row matching Screenshot 2 */}
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1 text-xs">
              {/* Tactical mode buttons */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-1 font-medium">
                  <span className="text-blue-400">📊</span> Normal ···
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-1 font-medium">
                  <span className="text-amber-400">⇄</span> {tactics.posture} ···
                </span>
              </div>

              {/* Speed & Pause Controls */}
              <div className="flex items-center gap-2">
                {/* Speed toggle (1x, 2x, 6x) */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setSpeed((s) => (s === 1 ? 2 : s === 2 ? 6 : 1));
                  }}
                  className="px-2 py-0.5 rounded bg-blue-600/80 hover:bg-blue-600 font-mono font-bold text-xs text-white"
                >
                  {speed}x
                </button>

                {/* Pause/Resume button */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setIsPaused(!isPaused);
                  }}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* 2D Football Pitch View (Top-Down with Tokens matching Screenshot 2) */}
          <div className="relative my-2 w-full aspect-[3/4.2] max-h-[500px] bg-[#1C7326] border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
            {/* Pitch Grass Texture & Lines */}
            <div className="absolute inset-0 flex flex-col pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 w-full"
                  style={{ backgroundColor: i % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'transparent' }}
                />
              ))}
            </div>

            {/* Pitch Markings */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/50 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/50 rounded-full pointer-events-none" />
            {/* Top Penalty Box (Opponent) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-b-2 border-x-2 border-white/50 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-7 border-b-2 border-x-2 border-white/50 pointer-events-none" />
            {/* Bottom Penalty Box (Manaus Gold) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-t-2 border-x-2 border-white/50 pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-7 border-t-2 border-x-2 border-white/50 pointer-events-none" />

            {/* Stadium Stands in miniature on top and bottom borders like Screenshot 2 */}
            <div className="w-full h-3 bg-slate-900 flex justify-around opacity-70">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-amber-500 rounded-xs" />
              ))}
            </div>

            {/* Moving Ball */}
            <div
              style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border border-black shadow-md z-30 transition-all duration-300"
            />

            {/* Opponent Tokens (White with dark border) */}
            {awayTokens.map((t) => (
              <div
                key={t.id}
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-all duration-300"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-slate-950 border-2 border-slate-700 flex items-center justify-center font-heading font-black text-[11px] shadow-md">
                  {t.num}
                </div>
                {t.name === opponent.starPlayer && (
                  <span className="mt-0.5 px-1 py-0.2 bg-black/80 text-white rounded text-[8px] font-bold">
                    {t.name}
                  </span>
                )}
              </div>
            ))}

            {/* Manaus Gold Tokens (Yellow with black border & Hero highlighted) */}
            {homeTokens.map((t) => {
              const isHero = t.isHero;
              return (
                <div
                  key={t.id}
                  style={{ left: `${t.x}%`, top: `${t.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300 ${
                    isHero ? 'z-20 scale-110' : 'z-10'
                  }`}
                >
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-heading font-black text-[11px] shadow-md ${
                      isHero
                        ? 'bg-amber-400 text-slate-950 border-2 border-black ring-3 ring-amber-300 ring-offset-1 ring-offset-black animate-pulse'
                        : 'bg-[#F7D002] text-slate-950 border-2 border-black'
                    }`}
                  >
                    {t.num}
                  </div>
                  {isHero && (
                    <span className="mt-0.5 px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded text-[9px] font-black uppercase tracking-wider shadow">
                      {t.name}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Bottom mini stands */}
            <div className="w-full h-3 bg-slate-900 flex justify-around opacity-70">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-amber-500 rounded-xs" />
              ))}
            </div>
          </div>

          {/* Live Commentary Ticker matching Screenshot 2 */}
          <div className="w-full bg-[#0B152F] border border-blue-500/20 rounded-xl p-2.5 shadow-lg flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-blue-600/30 text-blue-400 font-mono text-xs font-black">
              LIVE
            </span>
            <p className="flex-1 text-xs text-slate-200 line-clamp-1 font-medium">
              {commentary}
            </p>
            {/* Quick manual trigger to Play Highlight Lance right now! */}
            <button
              type="button"
              onClick={() => {
                playSound('whistle');
                setIsHighlightActive(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase shadow transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Jogar Lance</span>
            </button>
          </div>

          {/* Bottom Player Performance Stats Bar matching Screenshot 2 */}
          <div className="w-full mt-2 grid grid-cols-3 bg-[#0B152F] border border-slate-800 rounded-xl px-4 py-2 text-xs">
            {/* Star Rating */}
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400">★ ★ ★ ★ ☆</span>
              <span className="font-bold text-white font-mono">{playerRating.toFixed(1)}</span>
            </div>

            {/* Goals / Assists */}
            <div className="flex items-center justify-center gap-1 text-slate-300 font-bold">
              <span>⚽</span>
              <span className="font-mono">{playerGoals}/{playerAssists}</span>
            </div>

            {/* Energy */}
            <div className="flex items-center justify-end gap-1.5 text-blue-400 font-bold font-mono">
              <Zap className="w-4 h-4 fill-current text-blue-400" />
              <span>{playerEnergy}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
