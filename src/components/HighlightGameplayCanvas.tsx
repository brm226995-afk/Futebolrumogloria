import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { AvatarConfig, HighlightScenarioType, RefereeIntervention, TrainingDrillType } from '../types/game';
import { playSound } from '../utils/audio';
import { RotateCcw, Clock, ShieldAlert, Award, Target, Flame } from 'lucide-react';

interface HighlightGameplayProps {
  avatar: AvatarConfig;
  onGoalScored: () => void;
  onHighlightFinished: (outcome: 'GOAL' | 'SAVED' | 'MISSED') => void;
  homeTeamName: string;
  awayTeamName: string;
  currentMinute: number;
  scenario?: HighlightScenarioType;
  refereeIntervention?: RefereeIntervention | null;
  isTrainingMode?: boolean;
  trainingDrill?: TrainingDrillType;
  onTrainingFinish?: (score: number, goals: number, totalShots: number) => void;
}

interface PlayerActor {
  id: string;
  name: string;
  number: number;
  x: number; // 0 to 100% of canvas width
  y: number; // 0 to 100% of canvas height
  team: 'HERO' | 'TEAMMATE' | 'DEFENDER' | 'GOALKEEPER';
  vx?: number;
  vy?: number;
  targetX?: number;
  targetY?: number;
}

export const HighlightGameplayCanvas: React.FC<HighlightGameplayProps> = ({
  avatar,
  onGoalScored,
  onHighlightFinished,
  homeTeamName,
  awayTeamName,
  currentMinute,
  scenario = 'OPEN_PLAY',
  refereeIntervention = null,
  isTrainingMode = false,
  trainingDrill = 'FINISHING',
  onTrainingFinish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Curve slider: -50 (curve left) to +50 (curve right), 0 is straight
  const [curve, setCurve] = useState<number>(0);
  const [announcement, setAnnouncement] = useState<string>('');
  const [goalCelebration, setGoalCelebration] = useState<boolean>(false);
  const [actionDone, setActionDone] = useState<boolean>(false);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [hasReplay, setHasReplay] = useState<boolean>(false);
  const recordedFramesRef = useRef<{ x: number; y: number; z: number; gkOffset: number }[]>([]);
  const replayTickRef = useRef<number>(0);
  const replayIndexRef = useRef<number>(0);

  // Referee Modal Intro Overlay
  const [showRefereeModal, setShowRefereeModal] = useState<boolean>(!!refereeIntervention);

  // Training state (5 attempts)
  const [trainingAttempt, setTrainingAttempt] = useState<number>(1);
  const [trainingScore, setTrainingScore] = useState<number>(0);
  const [trainingGoals, setTrainingGoals] = useState<number>(0);
  const totalTrainingShots = 5;

  // 10-Minute Highlight Countdown Timer
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(10 * 60);

  // Determine effective scenario
  const effectiveScenario: HighlightScenarioType = isTrainingMode
    ? trainingDrill === 'PENALTY'
      ? 'PENALTY'
      : 'OPEN_PLAY'
    : scenario;

  // Initial actor setup helper based on scenario
  const getInitialSetup = useCallback(() => {
    if (effectiveScenario === 'PENALTY') {
      return {
        ball: { x: 50, y: 55, vx: 0, vy: 0, isMoving: false, spin: 0, z: 0, vz: 0, ownerId: 'hero' },
        players: [
          { id: 'hero', name: avatar.name || 'Messias', number: avatar.number || 9, x: 50, y: 59, team: 'HERO' as const },
          { id: 'gk', name: 'Goleiro', number: 1, x: 50, y: 15, team: 'GOALKEEPER' as const },
          { id: 'def_1', name: 'Zagueiro', number: 3, x: 28, y: 65, team: 'DEFENDER' as const },
          { id: 'def_2', name: 'Zagueiro', number: 4, x: 72, y: 65, team: 'DEFENDER' as const },
        ],
        text: 'PÊNALTI! ARRASTE A BOLA EM DIREÇÃO AO GOL PARA COBRAR NA GAVETA OU NO CANTO!',
      };
    }

    if (effectiveScenario === 'FREE_KICK') {
      return {
        ball: { x: 48, y: 62, vx: 0, vy: 0, isMoving: false, spin: 0, z: 0, vz: 0, ownerId: 'hero' },
        players: [
          { id: 'hero', name: avatar.name || 'Messias', number: avatar.number || 9, x: 48, y: 66, team: 'HERO' as const },
          { id: 'gk', name: 'Goleiro', number: 1, x: 62, y: 15, team: 'GOALKEEPER' as const },
          // 4-man defensive wall
          { id: 'wall_1', name: 'Barreira 1', number: 4, x: 41, y: 42, team: 'DEFENDER' as const },
          { id: 'wall_2', name: 'Barreira 2', number: 3, x: 45, y: 42, team: 'DEFENDER' as const },
          { id: 'wall_3', name: 'Barreira 3', number: 5, x: 49, y: 42, team: 'DEFENDER' as const },
          { id: 'wall_4', name: 'Barreira 4', number: 2, x: 53, y: 42, team: 'DEFENDER' as const },
        ],
        text: 'FALTA PERIGOSA NA ENTRADA DA ÁREA! CONTORNE A BARREIRA COM CURVA OU COLOQUE NO ÂNGULO!',
      };
    }

    // Default: OPEN_PLAY
    return {
      ball: { x: 48, y: 75, vx: 0, vy: 0, isMoving: false, spin: 0, z: 0, vz: 0, ownerId: 'hero' },
      players: [
        { id: 'hero', name: avatar.name || 'Messias', number: avatar.number || 9, x: 48, y: 73, team: 'HERO' as const },
        { id: 'teammate_left', name: 'Ronald', number: 10, x: 26, y: 64, team: 'TEAMMATE' as const },
        { id: 'teammate_right', name: 'Yuri', number: 11, x: 74, y: 66, team: 'TEAMMATE' as const },
        { id: 'def_1', name: 'Zagueiro 1', number: 4, x: 38, y: 46, team: 'DEFENDER' as const },
        { id: 'def_2', name: 'Zagueiro 2', number: 3, x: 62, y: 48, team: 'DEFENDER' as const },
        { id: 'gk', name: 'Goleiro', number: 1, x: 50, y: 15, team: 'GOALKEEPER' as const },
      ],
      text: isTrainingMode
        ? 'TREINO DE FINALIZAÇÃO: MIRE NAS GAVETAS OU NOS CANTOS DO GOL!'
        : 'ARRASTE A BOLA EM DIREÇÃO AO GOL PARA CHUTAR OU TOQUE DUAS VEZES NO PARCEIRO!',
    };
  }, [effectiveScenario, avatar, isTrainingMode]);

  const ballRef = useRef(getInitialSetup().ball);
  const playersRef = useRef<PlayerActor[]>(getInitialSetup().players);

  // Goalkeeper dive state
  const gkDiveRef = useRef<{ isDiving: boolean; diveDir: 'left' | 'right' | 'center'; diveProgress: number }>({
    isDiving: false,
    diveDir: 'center',
    diveProgress: 0,
  });

  // Touch / Drag trajectory state
  const dragRef = useRef<{
    isDraggingBall: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  }>({
    isDraggingBall: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const lastTapRef = useRef<{ time: number; targetId: string | null }>({
    time: 0,
    targetId: null,
  });

  useEffect(() => {
    const setup = getInitialSetup();
    ballRef.current = setup.ball;
    playersRef.current = setup.players;
    setAnnouncement(setup.text);

    if (refereeIntervention) {
      playSound('referee_whistle');
      setTimeout(() => {
        playSound('card');
      }, 350);
    }
  }, [getInitialSetup, refereeIntervention]);

  // 10-Minute Highlight Countdown Timer
  useEffect(() => {
    if (actionDone || isTrainingMode) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setActionDone(true);
          playSound('whistle');
          setAnnouncement('TEMPO ESGOTADO! FIM DOS 10 MINUTOS DO LANCE!');
          setTimeout(() => {
            onHighlightFinished('MISSED');
          }, 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 250);

    return () => clearInterval(timer);
  }, [actionDone, onHighlightFinished, isTrainingMode]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Triggers goal scored
  const triggerGoal = useCallback(
    (extraPoints = 250) => {
      playSound('goal');
      setAnnouncement('GOOOOOOOOOOOL DE PLACA NO ÂNGULO!');
      setGoalCelebration(true);
      setHasReplay(true);

      try {
        confetti({
          particleCount: 110,
          spread: 85,
          origin: { y: 0.3 },
        });
      } catch {
        // ignore
      }

      if (isTrainingMode) {
        setTrainingGoals((g) => g + 1);
        setTrainingScore((s) => s + extraPoints);

        setTimeout(() => {
          if (!isReplaying) {
            setGoalCelebration(false);
            if (trainingAttempt >= totalTrainingShots) {
              setActionDone(true);
              onTrainingFinish?.(trainingScore + extraPoints, trainingGoals + 1, totalTrainingShots);
            } else {
              setTrainingAttempt((a) => a + 1);
              const setup = getInitialSetup();
              ballRef.current = setup.ball;
              gkDiveRef.current = { isDiving: false, diveDir: 'center', diveProgress: 0 };
              setAnnouncement(`TENTATIVA ${trainingAttempt + 1} DE ${totalTrainingShots}! CHUTE NO GOL!`);
            }
          }
        }, 3200);
      } else {
        setActionDone(true);
        onGoalScored();
        setTimeout(() => {
          if (!isReplaying) {
            onHighlightFinished('GOAL');
          }
        }, 4500);
      }
    },
    [isTrainingMode, trainingAttempt, totalTrainingShots, trainingScore, trainingGoals, onTrainingFinish, onGoalScored, onHighlightFinished, getInitialSetup, isReplaying]
  );

  // Return ball to player when kicked out of bounds so player can shoot again
  const resetBallToPlayer = useCallback(
    (reason: string, wasSaved = false) => {
      if (isTrainingMode) {
        setTimeout(() => {
          if (trainingAttempt >= totalTrainingShots) {
            setActionDone(true);
            onTrainingFinish?.(trainingScore, trainingGoals, totalTrainingShots);
          } else {
            setTrainingAttempt((a) => a + 1);
            const setup = getInitialSetup();
            ballRef.current = setup.ball;
            gkDiveRef.current = { isDiving: false, diveDir: 'center', diveProgress: 0 };
            setAnnouncement(`${reason} Tentativa ${trainingAttempt + 1} de ${totalTrainingShots}!`);
          }
        }, 1200);
        return;
      }

      const ball = ballRef.current;
      const players = playersRef.current;
      const owner = players.find((p) => p.id === ball.ownerId) || players.find((p) => p.team === 'HERO')!;

      ball.isMoving = false;
      ball.vx = 0;
      ball.vy = 0;
      ball.vz = 0;
      ball.z = 0;
      ball.x = owner.x;
      ball.y = owner.y + 2.5;
      ball.ownerId = owner.id;
      gkDiveRef.current = { isDiving: false, diveDir: 'center', diveProgress: 0 };

      if (wasSaved) {
        setAnnouncement(`${reason} O goleiro espalmou! A bola voltou para você tentar de novo!`);
      } else {
        setAnnouncement(`${reason} A bola voltou para você tentar de novo!`);
      }
    },
    [isTrainingMode, trainingAttempt, totalTrainingShots, trainingScore, trainingGoals, onTrainingFinish, getInitialSetup]
  );

  // Main Canvas Rendering & Physics Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Stadium Stands & Audience
      const standsH = height * 0.14;
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, width, standsH);

      const rows = 5;
      const cols = 28;
      const seatW = width / cols;
      const seatH = (standsH - 18) / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sx = c * seatW;
          const sy = r * seatH;
          ctx.fillStyle = '#EAB308';
          ctx.fillRect(sx + 1, sy + 1, seatW - 2, seatH - 2);

          const fanColor = (r + c) % 3 === 0 ? '#111827' : (r + c) % 2 === 0 ? '#F59E0B' : '#E5E7EB';
          ctx.fillStyle = fanColor;
          ctx.fillRect(sx + 2, sy + 4, seatW - 4, seatH - 5);

          ctx.fillStyle = (r + c) % 4 === 0 ? '#D49D6A' : '#FCD5B5';
          ctx.beginPath();
          ctx.arc(sx + seatW / 2, sy + 3, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Authentic Stadium LED Board
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, standsH - 18, width, 18);
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 9px "Outfit", sans-serif';
      const ledText = isTrainingMode
        ? 'CENTRO DE TREINAMENTO OFICIAL    ★    FINALIZAÇÃO & PÊNALTIS    ★    DESENVOLVIMENTO DE ATLETA'
        : 'MANAUS PRIME    ★    NIKE BRASIL    ★    TAÇA SAMBA OFICIAL    ★    COPA DO BRASIL';
      ctx.fillText(ledText, 8, standsH - 5);

      // 2. Pitch Grass
      const pitchY = standsH;
      const pitchH = height - pitchY;

      const grassGrad = ctx.createLinearGradient(0, pitchY, 0, height);
      grassGrad.addColorStop(0, '#2b8a3e');
      grassGrad.addColorStop(1, '#237834');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, pitchY, width, pitchH);

      const stripeH = pitchH / 8;
      for (let s = 0; s < 8; s++) {
        if (s % 2 === 0) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
          ctx.fillRect(0, pitchY + s * stripeH, width, stripeH);
        }
      }

      // Worn patch in front of goal box
      ctx.save();
      ctx.fillStyle = 'rgba(101, 80, 50, 0.28)';
      ctx.beginPath();
      ctx.ellipse(width * 0.5, pitchY + pitchH * 0.16, width * 0.22, pitchH * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Pitch Markings (White lines)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3;

      const smallBoxW = width * 0.42;
      const smallBoxH = pitchH * 0.15;
      ctx.strokeRect((width - smallBoxW) / 2, pitchY, smallBoxW, smallBoxH);

      const penBoxW = width * 0.76;
      const penBoxH = pitchH * 0.42;
      ctx.strokeRect((width - penBoxW) / 2, pitchY, penBoxW, penBoxH);

      // Penalty Arc (D)
      ctx.beginPath();
      ctx.arc(width * 0.5, pitchY + penBoxH, width * 0.14, 0, Math.PI);
      ctx.stroke();

      // Penalty Spot (Marca da cal)
      const penSpotY = pitchY + pitchH * 0.28;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(width * 0.5, penSpotY, 4, 0, Math.PI * 2);
      ctx.fill();

      // 4. Goal Structure & Net (Top Center)
      const goalW = width * 0.38;
      const goalH = 24;
      const goalX = (width - goalW) / 2;
      const goalY = pitchY - goalH + 4;

      // Net pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      for (let nx = goalX; nx <= goalX + goalW; nx += 7) {
        ctx.beginPath();
        ctx.moveTo(nx, goalY);
        ctx.lineTo(nx, pitchY + 2);
        ctx.stroke();
      }
      for (let ny = goalY; ny <= pitchY + 2; ny += 5) {
        ctx.beginPath();
        ctx.moveTo(goalX, ny);
        ctx.lineTo(goalX + goalW, ny);
        ctx.stroke();
      }

      // Goal Frame (White posts & crossbar)
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(goalX, pitchY + 3);
      ctx.lineTo(goalX, goalY);
      ctx.lineTo(goalX + goalW, goalY);
      ctx.lineTo(goalX + goalW, pitchY + 3);
      ctx.stroke();

      // Target Rings in Training Mode (Gavetas e Cantos)
      if (isTrainingMode) {
        const drawTarget = (tx: number, ty: number, label: string, color: string) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(tx, ty, 10, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(tx, ty, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = 'bold 8px sans-serif';
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.fillText(label, tx, ty - 12);
        };

        // Top Left Angle (Gaveta Esquerda)
        drawTarget(goalX + 16, goalY + 8, '+300', '#F59E0B');
        // Top Right Angle (Gaveta Direita)
        drawTarget(goalX + goalW - 16, goalY + 8, '+300', '#F59E0B');
        // Low Left
        drawTarget(goalX + 18, pitchY - 4, '+200', '#10B981');
        // Low Right
        drawTarget(goalX + goalW - 18, pitchY - 4, '+200', '#10B981');
      }

      // 5. Update & Draw Players
      const players = playersRef.current;
      const ball = ballRef.current;

      if (!ball.isMoving) {
        const owner = players.find((p) => p.id === ball.ownerId) || players.find((p) => p.team === 'HERO')!;
        ball.x = owner.x;
        ball.y = owner.y + 2.5;
      }

      // Goalkeeper logic - "o goleiro seja um pouquinho burro e da para gente fazer gol nele na partida"
      const gk = players.find((p) => p.team === 'GOALKEEPER');
      if (gk) {
        if (ball.isMoving) {
          // Slow, clumsy goalkeeper reaction (0.05 speed so he reacts late and is easy to beat)
          const targetGkX = Math.max(34, Math.min(66, ball.x));
          gk.x += (targetGkX - gk.x) * 0.048;

          // Clumsy dive motion
          if (targetGkX < gk.x - 3) {
            gkDiveRef.current.isDiving = true;
            gkDiveRef.current.diveDir = 'left';
            gkDiveRef.current.diveProgress = Math.min(1, gkDiveRef.current.diveProgress + 0.08);
          } else if (targetGkX > gk.x + 3) {
            gkDiveRef.current.isDiving = true;
            gkDiveRef.current.diveDir = 'right';
            gkDiveRef.current.diveProgress = Math.min(1, gkDiveRef.current.diveProgress + 0.08);
          }
        } else {
          // Slight hesitation on line
          gk.x = 50 + Math.sin(Date.now() / 700) * (effectiveScenario === 'PENALTY' ? 3 : 1.8);
          gkDiveRef.current.isDiving = false;
          gkDiveRef.current.diveProgress = 0;
        }
      }

      // Defensive Wall / Defender subtle movement
      const defs = players.filter((p) => p.team === 'DEFENDER');
      defs.forEach((def, i) => {
        if (effectiveScenario === 'FREE_KICK') {
          // Wall jumps when ball is launched!
          if (ball.isMoving && ball.y < 58 && ball.y > 38) {
            def.y = 42 - Math.sin((Date.now() / 150) + i) * 1.5;
          } else {
            def.y = 42;
          }
        } else if (!ball.isMoving) {
          def.x += Math.sin(Date.now() / 800 + i) * 0.15;
        }
      });

      // Player positioning movement
      const hero = players.find((p) => p.team === 'HERO');
      if (hero && hero.targetX !== undefined && hero.targetY !== undefined) {
        const dx = hero.targetX - hero.x;
        const dy = hero.targetY - hero.y;
        if (Math.hypot(dx, dy) > 0.8) {
          hero.x += dx * 0.12;
          hero.y += dy * 0.12;
        } else {
          hero.targetX = undefined;
          hero.targetY = undefined;
        }
      }

      // Render players
      players.forEach((p) => {
        const px = (p.x / 100) * width;
        const py = (p.y / 100) * height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(px, py + 12, 11, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        const hasBall = ball.ownerId === p.id && !ball.isMoving;

        if (p.team === 'HERO') {
          ctx.fillStyle = avatar.jerseyColor || '#F7D002';
          ctx.beginPath();
          ctx.arc(px, py, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#111827';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = avatar.hairColor || '#F2E8CF';
          ctx.beginPath();
          ctx.arc(px, py - 6, 7, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#111827';
          ctx.font = 'bold 9px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(p.number), px, py + 4);

          ctx.strokeStyle = hasBall ? '#38BDF8' : 'rgba(250, 204, 21, 0.8)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(px, py, 16 + Math.sin(Date.now() / 250) * 2, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(px - 24, py + 15, 48, 13);
          ctx.fillStyle = '#FDE047';
          ctx.font = 'bold 8px sans-serif';
          ctx.fillText(p.name, px, py + 24);
        } else if (p.team === 'TEAMMATE') {
          ctx.fillStyle = avatar.jerseyColor || '#F7D002';
          ctx.beginPath();
          ctx.arc(px, py, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#451A03';
          ctx.beginPath();
          ctx.arc(px, py - 5, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#111827';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(p.number), px, py + 4);

          if (hasBall) {
            ctx.strokeStyle = '#38BDF8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, 15, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(px - 18, py + 14, 36, 12);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 8px sans-serif';
          ctx.fillText(p.name, px, py + 23);
        } else if (p.team === 'DEFENDER') {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(px, py, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#1E3A8A';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#1F2937';
          ctx.beginPath();
          ctx.arc(px, py - 5, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#1E3A8A';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(p.number), px, py + 4);

          if (effectiveScenario === 'FREE_KICK') {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
            ctx.fillRect(px - 16, py + 13, 32, 10);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 7px sans-serif';
            ctx.fillText('Barreira', px, py + 21);
          }
        } else if (p.team === 'GOALKEEPER') {
          // Goalkeeper with smart dive animation
          const dive = gkDiveRef.current;
          let gkOffsetX = 0;
          if (dive.isDiving) {
            gkOffsetX = dive.diveDir === 'left' ? -dive.diveProgress * 8 : dive.diveProgress * 8;
          }

          ctx.fillStyle = '#0284C7';
          ctx.beginPath();
          ctx.arc(px + gkOffsetX, py, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Goalkeeper Gloves
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(px + gkOffsetX - 11, py + 2, 4, 0, Math.PI * 2);
          ctx.arc(px + gkOffsetX + 11, py + 2, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FCD5B5';
          ctx.beginPath();
          ctx.arc(px + gkOffsetX, py - 5, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('1', px + gkOffsetX, py + 4);
        }
      });

      // 6. Draw Aiming Arc directly towards user's swipe
      if (dragRef.current.isDraggingBall && !ball.isMoving) {
        const drag = dragRef.current;
        const ballPx = (ball.x / 100) * width;
        const ballPy = (ball.y / 100) * height;

        const swipeDx = drag.currentX - drag.startX;
        const swipeDy = drag.currentY - drag.startY;

        const lengthMultiplier = 1.4;
        const targetEndX = ballPx + swipeDx * lengthMultiplier;
        const targetEndY = ballPy + swipeDy * lengthMultiplier;

        const curveOffset = (curve / 50) * 55;
        const midX = (ballPx + targetEndX) * 0.5 + curveOffset;
        const midY = (ballPy + targetEndY) * 0.5;

        ctx.save();
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(ballPx, ballPy);
        ctx.quadraticCurveTo(midX, midY, targetEndX, targetEndY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.beginPath();
        ctx.arc(targetEndX, targetEndY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.arc(targetEndX, targetEndY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 7. Update Ball Physics
      if (ball.isMoving) {
        const curveForce = (ball.spin / 50) * 0.045;
        ball.vx += curveForce;

        ball.x += ball.vx;
        ball.y += ball.vy;

        ball.z += ball.vz;
        ball.vz -= 0.12;
        if (ball.z < 0) {
          ball.z = 0;
          ball.vz = -ball.vz * 0.4;
        }

        ball.vx *= 0.985;
        ball.vy *= 0.985;

        const goalTopY = (pitchY / height) * 100;
        const goalLeftX = (goalX / width) * 100;
        const goalRightX = ((goalX + goalW) / width) * 100;

        // Check Goal vs Clumsy Goalkeeper (User: "o goleiro seja um pouquinho burro e da para gente fazer gol nele na partida")
        if (ball.y <= goalTopY + 2 && ball.y >= goalTopY - 4) {
          if (ball.x >= goalLeftX && ball.x <= goalRightX) {
            const distToGk = Math.abs(ball.x - (gk?.x || 50));
            const isCornerShot = ball.x <= goalLeftX + 4.5 || ball.x >= goalRightX - 4.5;
            const hasCurveOrPower = Math.abs(ball.spin) > 8 || Math.hypot(ball.vx, ball.vy) > 1.2;

            // Only save if ball is kicked directly dead-center into the goalkeeper's hands
            const saveThreshold = isTrainingMode ? 2.8 : 1.8;
            const canSave = gk && distToGk < saveThreshold && !isCornerShot && !hasCurveOrPower;

            if (canSave) {
              // Rare save when kicked right at his hands
              playSound('save');
              resetBallToPlayer('O GOLEIRO ESPALMOU! A bola bateu nele e sobrou no rebote!', true);
            } else {
              // GOOOOOOL! Very rewarding, easy to score on the keeper
              ball.isMoving = false;
              ball.vx = 0;
              ball.vy = 0;
              const pointsEarned = isCornerShot ? 300 : hasCurveOrPower ? 260 : 200;
              triggerGoal(pointsEarned);
            }
          } else {
            playSound('whistle');
            resetBallToPlayer('PASSOU RASPANDO A TRAVE E FOI PRA FORA!');
          }
        }

        // Post check
        if (
          Math.abs(ball.y - goalTopY) < 3 &&
          (Math.abs(ball.x - goalLeftX) < 2 || Math.abs(ball.x - goalRightX) < 2)
        ) {
          playSound('post');
          resetBallToPlayer('BATEU NA TRAVEEEEE!');
        }

        // Wall or Defender block check
        defs.forEach((def) => {
          // If free kick and ball height z > 2, it flies over the wall!
          const fliesOverWall = effectiveScenario === 'FREE_KICK' && ball.z > 1.8;
          if (!fliesOverWall && Math.abs(ball.x - def.x) < 3.8 && Math.abs(ball.y - def.y) < 4) {
            playSound('kick');
            resetBallToPlayer('A BARREIRA BLOQUEOU O CHUTE! Tente usar mais curva ou altura!');
          }
        });

        // Ball went off pitch
        if (ball.x < 2 || ball.x > 98 || ball.y > 96) {
          playSound('whistle');
          resetBallToPlayer('BOLA SAIU DO CAMPO!');
        }

        // Teammate pass arrival (open play)
        if (ball.ownerId && ball.ownerId !== 'hero' && ball.isMoving) {
          const targetPlayer = players.find((p) => p.id === ball.ownerId);
          if (targetPlayer && Math.hypot(ball.x - targetPlayer.x, ball.y - targetPlayer.y) < 3) {
            ball.isMoving = false;
            ball.vx = 0;
            ball.vy = 0;
            ball.x = targetPlayer.x;
            ball.y = targetPlayer.y + 2.5;
            setAnnouncement(`BOLA DOMINADA POR ${targetPlayer.name}! CHUTE OU TOQUE DE VOLTA!`);
          }
        }

        // Stopped moving
        if (Math.abs(ball.vx) < 0.02 && Math.abs(ball.vy) < 0.02 && ball.y > goalTopY + 2) {
          ball.isMoving = false;
          setAnnouncement('BOLA PARADA! ARRASTE EM DIREÇÃO AO GOL PARA CHUTAR!');
        }
      }

      // Draw Ball
      const ballCanvasX = (ball.x / 100) * width;
      const ballCanvasY = (ball.y / 100) * height;
      const ballRadius = 6 + ball.z * 0.2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(ballCanvasX, ballCanvasY + 4, ballRadius * 1.1, ballRadius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      const ballGrad = ctx.createRadialGradient(
        ballCanvasX - 2,
        ballCanvasY - ball.z - 2,
        1,
        ballCanvasX,
        ballCanvasY - ball.z,
        ballRadius
      );
      ballGrad.addColorStop(0, '#FFFFFF');
      ballGrad.addColorStop(0.8, '#E2E8F0');
      ballGrad.addColorStop(1, '#94A3B8');

      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(ballCanvasX, ballCanvasY - ball.z, ballRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(ballCanvasX, ballCanvasY - ball.z, 2, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [curve, triggerGoal, resetBallToPlayer, avatar, effectiveScenario, isTrainingMode]);

  // Touch / Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (actionDone || showRefereeModal) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const now = Date.now();
    const players = playersRef.current;
    const ball = ballRef.current;

    // Double tap pass only allowed in OPEN_PLAY
    if (effectiveScenario === 'OPEN_PLAY') {
      const clickedPlayer = players.find(
        (p) => (p.team === 'TEAMMATE' || p.team === 'HERO') && Math.hypot(p.x - x, p.y - y) < 12
      );

      if (clickedPlayer) {
        if (
          lastTapRef.current.targetId === clickedPlayer.id &&
          now - lastTapRef.current.time < 450
        ) {
          const currentOwner = players.find((p) => p.id === ball.ownerId) || players.find((p) => p.team === 'HERO')!;
          ball.x = currentOwner.x;
          ball.y = currentOwner.y + 2;

          const dx = clickedPlayer.x - ball.x;
          const dy = clickedPlayer.y - ball.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 1) {
            playSound('pass');
            setAnnouncement(`PASSE PERFEITO PARA ${clickedPlayer.name}!`);

            ball.vx = (dx / dist) * 1.9;
            ball.vy = (dy / dist) * 1.9;
            ball.isMoving = true;
            ball.spin = 0;
            ball.z = 0.5;
            ball.vz = 0.3;
            ball.ownerId = clickedPlayer.id;

            const hero = players.find((p) => p.team === 'HERO');
            if (hero && clickedPlayer.id !== 'hero') {
              hero.targetX = 50;
              hero.targetY = 52;
            }
          }

          lastTapRef.current = { time: 0, targetId: null };
          return;
        } else {
          lastTapRef.current = { time: now, targetId: clickedPlayer.id };
          setAnnouncement(`Toque duas vezes para tocar a bola para ${clickedPlayer.name}!`);
          return;
        }
      }
    }

    // Dragging near ball to shoot
    const distToBall = Math.hypot(ball.x - x, ball.y - y);
    if (distToBall < 25 && !ball.isMoving) {
      dragRef.current = {
        isDraggingBall: true,
        startX: (ball.x / 100) * canvas.width,
        startY: (ball.y / 100) * canvas.height,
        currentX: (x / 100) * canvas.width,
        currentY: (y / 100) * canvas.height,
      };
      return;
    }

    // Reposition player in open play
    if (effectiveScenario === 'OPEN_PLAY') {
      const hero = players.find((p) => p.team === 'HERO');
      if (hero) {
        hero.targetX = Math.max(15, Math.min(85, x));
        hero.targetY = Math.max(35, Math.min(88, y));
        if (!ball.isMoving && ball.ownerId === 'hero') {
          ball.x = hero.x;
          ball.y = hero.y + 2;
        }
        setAnnouncement(`${hero.name} se posicionando no ataque!`);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.isDraggingBall) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;

    dragRef.current.currentX = px;
    dragRef.current.currentY = py;
  };

  const handlePointerUp = () => {
    if (!dragRef.current.isDraggingBall) return;
    dragRef.current.isDraggingBall = false;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ball = ballRef.current;
    const drag = dragRef.current;

    const dx = drag.currentX - drag.startX;
    const dy = drag.currentY - drag.startY;
    const dist = Math.hypot(dx, dy);

    if (dist > 12) {
      playSound('kick');
      const speed = Math.min(dist * 0.022, 2.5);
      const angle = Math.atan2(dy, dx);

      ball.vx = Math.cos(angle) * speed;
      ball.vy = Math.sin(angle) * speed;
      ball.isMoving = true;
      ball.spin = curve;
      ball.z = 1.4;
      ball.vz = 1.6;

      if (effectiveScenario === 'PENALTY') {
        setAnnouncement('BATEU O PÊNALTI FIRME NO CANTO!');
      } else if (effectiveScenario === 'FREE_KICK') {
        setAnnouncement('COBROU A FALTA POR CIMA DA BARREIRA!');
      } else {
        setAnnouncement('BOMBAAA EM DIREÇÃO AO GOL!');
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between bg-[#081022] overflow-hidden select-none touch-none">
      {/* Top Header Bar */}
      <div className="w-full z-20 bg-slate-900/95 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isTrainingMode ? (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black tracking-wider uppercase text-[10px] flex items-center gap-1">
              <Target className="w-3 h-3" /> TREINAMENTO
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black animate-pulse">
              AO VIVO {currentMinute}'
            </span>
          )}

          <span className="font-heading font-black text-amber-400 uppercase tracking-wider text-[11px] sm:text-xs">
            {effectiveScenario === 'PENALTY'
              ? '🎯 PÊNALTI A FAVOR'
              : effectiveScenario === 'FREE_KICK'
              ? '⚽ FALTA PERIGOSA'
              : isTrainingMode
              ? 'CENTRO DE FINALIZAÇÃO'
              : 'MELHORES MOMENTOS'}
          </span>
        </div>

        {/* Training Counter or 10-Minute Countdown */}
        {isTrainingMode ? (
          <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1 rounded-xl border border-white/10 font-mono text-xs">
            <span className="text-slate-400">Tentativa:</span>
            <span className="text-amber-400 font-bold">
              {trainingAttempt}/{totalTrainingShots}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-bold">{trainingScore} pts</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold text-slate-300">Tempo do Lance:</span>
            <span className="font-mono font-black text-xs text-amber-300 tracking-wider">
              {formatTime(timeRemainingSeconds)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="font-bold text-xs">{homeTeamName}</span>
          <span className="px-1.5 py-0.5 bg-black/50 rounded font-mono font-bold text-amber-300 text-[10px]">VS</span>
          <span className="font-bold text-xs">{awayTeamName}</span>
        </div>
      </div>

      {/* Dynamic Announcement Ticker */}
      <div className="w-full z-20 px-4 py-1.5 bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-blue-900/80 text-center border-b border-blue-500/30">
        <span className="text-xs sm:text-sm font-bold text-amber-300 tracking-wide drop-shadow animate-pulse">
          ⚽ {announcement}
        </span>
      </div>

      {/* Main Interactive Field Canvas */}
      <div className="relative flex-1 w-full max-w-xl flex items-center justify-center p-1">
        <canvas
          ref={canvasRef}
          width={400}
          height={520}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full max-h-[540px] rounded-2xl shadow-2xl border-2 border-white/20 cursor-crosshair touch-none"
        />

        {/* Goal Banner Overlay */}
        {goalCelebration && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs z-30 animate-bounce">
            <div className="px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.8)] border-4 border-white text-center">
              <h2 className="font-heading text-4xl sm:text-5xl font-black text-slate-950 uppercase tracking-widest drop-shadow-lg">
                GOOOOOOL!
              </h2>
              <p className="text-sm font-black text-slate-900 mt-1">
                GOLAÇO DE {avatar.name || 'MESSIAS'} #{avatar.number || 9}!
              </p>
            </div>
          </div>
        )}

        {/* REFEREE INTERVENTION POPUP MODAL (FOUL + YELLOW / RED CARD) */}
        {showRefereeModal && refereeIntervention && (
          <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-scale-up">
            <div className="w-full max-w-sm bg-gradient-to-b from-[#0F1C36] to-[#0A1224] border-2 border-amber-400/80 rounded-2xl p-4 shadow-2xl text-center relative overflow-hidden">
              {/* Referee Card Glow Effect */}
              <div
                className={`w-16 h-24 mx-auto rounded-xl shadow-2xl flex items-center justify-center border-2 border-white/40 mb-3 transform rotate-6 animate-pulse ${
                  refereeIntervention.type === 'YELLOW_CARD'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_30px_rgba(250,204,21,0.7)]'
                    : 'bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.8)]'
                }`}
              >
                <span className="font-heading font-black text-2xl">
                  {refereeIntervention.type === 'YELLOW_CARD' ? '🟨' : '🟥'}
                </span>
              </div>

              {/* Title & Badge */}
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-xl">👨‍⚖️</span>
                <span
                  className={`text-xs font-heading font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    refereeIntervention.type === 'YELLOW_CARD'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {refereeIntervention.type === 'YELLOW_CARD'
                    ? 'CARTÃO AMARELO (FALTA LEVE)'
                    : 'CARTÃO VERMELHO DIRETO (FALTA GRAVE)'}
                </span>
              </div>

              <h3 className="font-heading font-black text-white text-base sm:text-lg mb-1">
                {refereeIntervention.awardedAction === 'PENALTY'
                  ? 'PÊNALTI MARCADO PELO ÁRBITRO!'
                  : 'FALTA PERIGOSA MARCADA!'}
              </h3>

              <p className="text-xs text-slate-300 mb-3 px-2">
                {refereeIntervention.reason}
              </p>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/10 mb-4 text-left text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Infrator:</span>
                  <span className="text-amber-300 font-bold">{refereeIntervention.offendingPlayer}</span>
                </div>
                <div className="flex justify-between text-slate-400 mt-1">
                  <span>Equipe:</span>
                  <span className="text-white">{refereeIntervention.offendingTeam}</span>
                </div>
                <div className="flex justify-between text-slate-400 mt-1">
                  <span>Cobrador Oficial:</span>
                  <span className="text-emerald-400 font-bold">{avatar.name || 'Messias'} #{avatar.number || 9}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playSound('whistle');
                  setShowRefereeModal(false);
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-slate-950 font-heading font-black text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 ${
                  refereeIntervention.awardedAction === 'PENALTY'
                    ? 'bg-gradient-to-r from-red-500 to-amber-400 text-slate-950'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-300'
                }`}
              >
                {refereeIntervention.awardedAction === 'PENALTY' ? '🎯 BATER PÊNALTI' : '⚽ COBRAR FALTA'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Pill */}
      <div className="w-full max-w-md z-20 p-3 flex flex-col items-center gap-2">
        {/* Curva Slider Pill Container */}
        <div className="w-full bg-[#111A2E]/95 border border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-2xl flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span>⚽</span> Curva do Chute
            </span>
            <span className="font-mono text-slate-300">
              {curve < 0 ? `Curva Esquerda (${curve})` : curve > 0 ? `Curva Direita (+${curve})` : 'Chute Reto'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min={-50}
              max={50}
              value={curve}
              onChange={(e) => {
                setCurve(parseInt(e.target.value));
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <RotateCcw className="w-4 h-4 text-slate-400 -scale-x-100" />
          </div>
        </div>

        {/* Tutorial Hint pill */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-amber-300">
            <Flame className="w-3.5 h-3.5" />
            {effectiveScenario === 'PENALTY'
              ? 'Arraste a bola para o canto desejado!'
              : effectiveScenario === 'FREE_KICK'
              ? 'Use a curva para contornar a barreira!'
              : 'Arraste em direção ao gol para chutar!'}
          </span>
        </div>
      </div>
    </div>
  );
};
