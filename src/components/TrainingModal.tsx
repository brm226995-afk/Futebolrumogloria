import React, { useState } from 'react';
import { AvatarConfig, TrainingDrillType } from '../types/game';
import { HighlightGameplayCanvas } from './HighlightGameplayCanvas';
import { playSound } from '../utils/audio';
import { X, Target, Award, Sparkles, ChevronRight, RotateCcw, Zap } from 'lucide-react';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatar: AvatarConfig;
  onFinishTrainingReward: (drill: TrainingDrillType, score: number, goals: number) => void;
}

export const TrainingModal: React.FC<TrainingModalProps> = ({
  isOpen,
  onClose,
  avatar,
  onFinishTrainingReward,
}) => {
  const [selectedDrill, setSelectedDrill] = useState<TrainingDrillType | null>(null);
  const [drillCompleted, setDrillCompleted] = useState<{
    score: number;
    goals: number;
    totalShots: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleStartDrill = (drill: TrainingDrillType) => {
    playSound('whistle');
    setSelectedDrill(drill);
    setDrillCompleted(null);
  };

  const handleFinishDrill = (score: number, goals: number, totalShots: number) => {
    playSound('cheer');
    setDrillCompleted({ score, goals, totalShots });
    if (selectedDrill) {
      onFinishTrainingReward(selectedDrill, score, goals);
    }
  };

  const handleRestart = () => {
    playSound('click');
    setDrillCompleted(null);
  };

  const handleBackToMenu = () => {
    playSound('click');
    setSelectedDrill(null);
    setDrillCompleted(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0B1528] to-[#070D1C] border border-blue-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#0E1A33]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow">
              <Target className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-heading font-black text-white text-base sm:text-lg tracking-wide">
                CENTRO DE TREINAMENTO
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Aprimore seus atributos de chute e cobrança de penalidades
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          {/* VIEW 1: DRILL SELECTION */}
          {!selectedDrill && (
            <div className="p-4 sm:p-6 flex flex-col gap-4">
              <div className="text-center py-2">
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold font-mono">
                  ★ TREINO DE HABILIDADES ★
                </span>
                <h3 className="font-heading font-black text-white text-xl sm:text-2xl mt-2">
                  Escolha o seu Fundamento de Hoje
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Treine finalizações de fora da área ou penalidades na cal para subir de nível e ganhar prêmios!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: Treinar Finalização */}
                <div
                  onClick={() => handleStartDrill('FINISHING')}
                  className="group relative bg-[#0F2042]/90 hover:bg-[#152B58] border-2 border-blue-500/30 hover:border-amber-400/80 rounded-2xl p-5 shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-2 rounded-2xl bg-amber-400/20 border border-amber-400/40">
                      ⚽
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-[10px] font-mono font-bold uppercase">
                      5 Finalizações
                    </span>
                  </div>

                  <h4 className="font-heading font-black text-white text-lg group-hover:text-amber-300 transition-colors">
                    Treinar Finalização
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Chutes de média e longa distância com alvos nos cantos do gol. Vença o goleiro e mire nas gavetas!
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> +Finalização & XP
                    </span>
                    <span className="text-amber-400 font-bold flex items-center gap-0.5">
                      Iniciar <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Option 2: Treinar Pênalti */}
                <div
                  onClick={() => handleStartDrill('PENALTY')}
                  className="group relative bg-[#0F2042]/90 hover:bg-[#152B58] border-2 border-emerald-500/30 hover:border-emerald-400/80 rounded-2xl p-5 shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-2 rounded-2xl bg-emerald-400/20 border border-emerald-400/40">
                      🎯
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase">
                      5 Pênaltis
                    </span>
                  </div>

                  <h4 className="font-heading font-black text-white text-lg group-hover:text-emerald-300 transition-colors">
                    Treinar Pênalti
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Cobranças da marca da cal! Desloque o goleiro adversário e coloque com precisão nas redes.
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> +Pênaltis & Bônus
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      Iniciar <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Player Training Card Preview */}
              <div className="bg-slate-900/80 rounded-2xl p-3 border border-white/10 flex items-center justify-between mt-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-heading font-black text-slate-950 text-sm shadow"
                    style={{ backgroundColor: avatar.jerseyColor }}
                  >
                    #{avatar.number}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {avatar.name || 'Gabriel M.'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Posição: Atacante Principal · Finalizador
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">Foco</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">Pontaria 100%</span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: ACTIVE DRILL CANVAS */}
          {selectedDrill && !drillCompleted && (
            <div className="w-full h-[580px] relative">
              <HighlightGameplayCanvas
                avatar={avatar}
                homeTeamName="Treinamento"
                awayTeamName="Goleiro Titular"
                currentMinute={0}
                isTrainingMode={true}
                trainingDrill={selectedDrill}
                onGoalScored={() => {}}
                onHighlightFinished={() => {}}
                onTrainingFinish={handleFinishDrill}
              />
            </div>
          )}

          {/* VIEW 3: DRILL RESULTS SUMMARY */}
          {drillCompleted && (
            <div className="p-6 text-center flex flex-col items-center justify-center animate-scale-up">
              <div className="w-16 h-16 rounded-3xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-xl mb-3">
                🏆
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold uppercase tracking-wider mb-2">
                TREINAMENTO CONCLUÍDO!
              </span>

              <h3 className="font-heading font-black text-white text-2xl">
                Excelente Desempenho!
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mt-1">
                Você acertou {drillCompleted.goals} de {drillCompleted.totalShots} finalizações com{' '}
                {drillCompleted.score} pontos acumulados!
              </p>

              {/* Stars display */}
              <div className="flex items-center gap-1.5 my-4 text-2xl">
                <span className={drillCompleted.goals >= 1 ? 'text-amber-400' : 'text-slate-700'}>★</span>
                <span className={drillCompleted.goals >= 3 ? 'text-amber-400' : 'text-slate-700'}>★</span>
                <span className={drillCompleted.goals >= 4 ? 'text-amber-400' : 'text-slate-700'}>★</span>
              </div>

              {/* Rewards Box */}
              <div className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-2xl p-4 grid grid-cols-3 gap-2 mb-6">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-mono block">Pontuação</span>
                  <span className="font-heading font-black text-amber-400 text-base">
                    {drillCompleted.score} pts
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-mono block">Evolução</span>
                  <span className="font-heading font-black text-emerald-400 text-base">
                    +1 OVR (Máx 88)
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-mono block">Prêmio</span>
                  <span className="font-heading font-black text-cyan-400 text-base">
                    +R$ 2.500
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-amber-300 font-mono bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl mb-4">
                🔒 Treino concluído! Dispute ou simule uma nova partida para liberar a próxima sessão.
              </div>

              <div className="flex items-center gap-3 w-full max-w-md">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Treinar Novamente
                </button>

                <button
                  type="button"
                  onClick={handleBackToMenu}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-heading font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  Outros Treinos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
