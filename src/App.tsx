/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  AvatarConfig,
  CalendarDay,
  ClubInfo,
  MatchStats,
  SocialPost,
  SocialReply,
  TacticsSettings,
  TeamPlayer,
  TransferOffer,
  TrophyItem,
  ScoutedPlayer,
  TrainingDrillType,
} from './types/game';
import {
  DEFAULT_CLUB,
  INITIAL_AVATAR,
  INITIAL_PLAYERS,
  INITIAL_SOCIAL_POSTS,
  INITIAL_TACTICS,
  INITIAL_TRANSFER_OFFERS,
  INITIAL_TROPHIES,
  TACA_SAMBA_OPPONENTS,
  CAMP_NACIONAL_OPPONENTS,
  SELECAO_BR_TEAM,
  createTransferOffer,
  generateFullCalendar,
} from './data/initialData';
import { MainLobby } from './components/MainLobby';
import { SeasonCalendar } from './components/SeasonCalendar';
import { AvatarEditorModal } from './components/AvatarEditorModal';
import { TacticsLineupModal } from './components/TacticsLineupModal';
import { MatchSimulationView } from './components/MatchSimulationView';
import { PostMatchModal } from './components/PostMatchModal';
import { StatsOverviewModal } from './components/StatsOverviewModal';
import { SocialFeedModal } from './components/SocialFeedModal';
import { TrophyRoomModal } from './components/TrophyRoomModal';
import { NegotiationRoomModal } from './components/NegotiationRoomModal';
import { TrainingModal } from './components/TrainingModal';
import { ScoutingModal } from './components/ScoutingModal';
import { SelecaoCallUpModal } from './components/SelecaoCallUpModal';
import { playSound } from './utils/audio';
import { loadGameState, saveGameState } from './utils/storage';

type ScreenState = 'LOBBY' | 'CALENDAR' | 'MATCH';

export default function App() {
  // Load saved state from localStorage if available
  const saved = useMemo(() => loadGameState(), []);

  const [screen, setScreen] = useState<ScreenState>('LOBBY');
  const [avatar, setAvatar] = useState<AvatarConfig>(() => saved?.avatar || INITIAL_AVATAR);
  const [players, setPlayers] = useState<TeamPlayer[]>(() => saved?.players || INITIAL_PLAYERS);
  const [tactics, setTactics] = useState<TacticsSettings>(() => saved?.tactics || INITIAL_TACTICS);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>(() => {
    const freshDays = generateFullCalendar();
    if (!saved?.calendarDays || !Array.isArray(saved.calendarDays) || saved.calendarDays.length === 0) {
      return freshDays;
    }
    // Check if saved calendar has Seleção BR fixtures
    const hasSelecao = saved.calendarDays.some((d) => d.competition === 'Seleção BR');
    if (!hasSelecao) {
      // Inject Seleção BR fixtures into non-match/free days from fresh calendar
      return saved.calendarDays.map((d) => {
        const fresh = freshDays.find((fd) => fd.globalDayIndex === d.globalDayIndex);
        if (fresh && fresh.competition === 'Seleção BR') {
          return {
            ...d,
            type: 'MATCH',
            competition: 'Seleção BR',
            isNationalTeamMatch: true,
            opponent: fresh.opponent,
            title: fresh.title,
            matchIndexInComp: fresh.matchIndexInComp,
          };
        }
        return d;
      });
    }
    return saved.calendarDays;
  });
  const [currentGlobalIndex, setCurrentGlobalIndex] = useState<number>(
    () => saved?.currentGlobalIndex || 1
  );
  const [cash, setCash] = useState<number>(
    () => (typeof saved?.cash === 'number' ? saved.cash : 184900)
  );
  const [energy, setEnergy] = useState<number>(
    () => (typeof saved?.energy === 'number' ? saved.energy : 100)
  );
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(
    () => saved?.socialPosts || INITIAL_SOCIAL_POSTS
  );
  const [trophies, setTrophies] = useState<TrophyItem[]>(
    () => saved?.trophies || INITIAL_TROPHIES
  );

  // Transfers & Current Club state
  const [currentClub, setCurrentClub] = useState<ClubInfo>(
    () => saved?.currentClub || DEFAULT_CLUB
  );
  const [transferOffers, setTransferOffers] = useState<TransferOffer[]>(
    () => saved?.activeTransferOffers || INITIAL_TRANSFER_OFFERS
  );
  const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState<boolean>(false);
  const [activeNegotiatingOffer, setActiveNegotiatingOffer] = useState<TransferOffer | null>(
    () => (saved?.activeTransferOffers || INITIAL_TRANSFER_OFFERS)[0] || null
  );

  // Modals state
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState<boolean>(false);
  const [isTacticsModalOpen, setIsTacticsModalOpen] = useState<boolean>(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState<boolean>(false);
  const [isTrophyRoomOpen, setIsTrophyRoomOpen] = useState<boolean>(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState<boolean>(false);
  const [isTrainingAvailable, setIsTrainingAvailable] = useState<boolean>(true);
  const [isScoutingModalOpen, setIsScoutingModalOpen] = useState<boolean>(false);
  const [isCalledUpToSelecao, setIsCalledUpToSelecao] = useState<boolean>(
    () => !!saved?.isCalledUpToSelecao
  );
  const [isSelecaoCallUpModalOpen, setIsSelecaoCallUpModalOpen] = useState<boolean>(false);
  const [postMatchModalData, setPostMatchModalData] = useState<{
    isOpen: boolean;
    stats: MatchStats | null;
    globalIndex: number;
  }>({
    isOpen: false,
    stats: null,
    globalIndex: 1,
  });

  // Finish interactive training session rewards
  const handleFinishTrainingReward = (drill: TrainingDrillType, score: number, goals: number) => {
    const rewardMoney = 2500 + goals * 500;
    setCash((c) => c + rewardMoney);

    // Boost hero overall rating up to exactly 88 OVR maximum as requested
    setPlayers((prev) =>
      prev.map((p) =>
        p.isCustomHero
          ? {
              ...p,
              ovr: Math.min(88, p.ovr + 1),
            }
          : p
      )
    );

    // Lock training until a match is played or simulated
    setIsTrainingAvailable(false);
  };

  // Current playing match day
  const [activeMatchDay, setActiveMatchDay] = useState<CalendarDay | null>(null);

  const currentDayData =
    calendarDays.find((d) => d.globalDayIndex === currentGlobalIndex) || calendarDays[0];

  const nextMatchDay =
    calendarDays.find(
      (d) => d.globalDayIndex >= currentGlobalIndex && d.type === 'MATCH' && d.status !== 'COMPLETED'
    ) || calendarDays.find((d) => d.type === 'MATCH');

  // Guaranteed next or active Seleção BR match when player is called up
  const nextSelecaoMatchDay = useMemo(() => {
    // 1. If today is already a Seleção match
    if (currentDayData.type === 'MATCH' && currentDayData.competition === 'Seleção BR') {
      return currentDayData;
    }
    // 2. Upcoming pending Seleção match
    const upcoming = calendarDays.find(
      (d) =>
        d.globalDayIndex >= currentGlobalIndex &&
        d.type === 'MATCH' &&
        d.competition === 'Seleção BR' &&
        d.status === 'PENDING'
    );
    if (upcoming) return upcoming;

    // 3. Any pending Seleção match in calendar
    const anyPending = calendarDays.find(
      (d) => d.type === 'MATCH' && d.competition === 'Seleção BR' && d.status === 'PENDING'
    );
    if (anyPending) return anyPending;

    // 4. When called up, synthesize next international fixture so player can always play!
    if (isCalledUpToSelecao) {
      const opp = FICTIONAL_NATIONAL_TEAMS[0];
      return {
        dayNumber: currentDayData.dayNumber,
        monthName: currentDayData.monthName,
        globalDayIndex: currentDayData.globalDayIndex,
        type: 'MATCH' as const,
        competition: 'Seleção BR' as const,
        isNationalTeamMatch: true,
        opponent: opp,
        isHome: true,
        title: `🇧🇷 Seleção BR vs ${opp.name} · Superclássico Amistoso`,
        status: 'PENDING' as const,
      };
    }
    return null;
  }, [calendarDays, currentGlobalIndex, currentDayData, isCalledUpToSelecao]);

  // Rest action: recovers 100% of energy as requested!
  const handleRest = () => {
    playSound('cheer');
    setEnergy(100);
  };

  // Training action (+1 to hero OVR up to 88 & +$1500)
  const handleTrain = () => {
    playSound('whistle');
    setPlayers((prev) =>
      prev.map((p) => (p.isCustomHero ? { ...p, ovr: Math.min(88, p.ovr + 1) } : p))
    );
    setCash((c) => c + 1500);
    setIsTrainingAvailable(false);

    setCalendarDays((days) =>
      days.map((d) =>
        d.globalDayIndex === currentGlobalIndex ? { ...d, status: 'COMPLETED' } : d
      )
    );
    if (currentGlobalIndex < calendarDays.length) {
      setCurrentGlobalIndex((n) => n + 1);
    }
  };

  // Auto-advance non-match days in calendar
  const handleAutoAdvanceDay = (globalIndex: number) => {
    const day = calendarDays.find((d) => d.globalDayIndex === globalIndex);
    if (!day) return;

    if (day.type === 'TRAINING') {
      setPlayers((prev) =>
        prev.map((p) => (p.isCustomHero ? { ...p, ovr: Math.min(99, p.ovr + 1) } : p))
      );
      setCash((c) => c + 1500);
    } else if (day.type === 'REST') {
      setEnergy(100);
    } else if (day.type === 'EVENT') {
      setCash((c) => c + 2000);
    }

    setCalendarDays((days) =>
      days.map((d) => (d.globalDayIndex === globalIndex ? { ...d, status: 'COMPLETED' } : d))
    );

    if (globalIndex < calendarDays.length) {
      setCurrentGlobalIndex(globalIndex + 1);
    }
  };

  // Auto-save game state to localStorage
  useEffect(() => {
    saveGameState({
      avatar,
      players,
      tactics,
      calendarDays,
      currentGlobalIndex,
      cash,
      energy,
      socialPosts,
      trophies,
      currentClub,
      activeTransferOffers: transferOffers,
      isCalledUpToSelecao,
    });
  }, [
    avatar,
    players,
    tactics,
    calendarDays,
    currentGlobalIndex,
    cash,
    energy,
    socialPosts,
    trophies,
    currentClub,
    transferOffers,
    isCalledUpToSelecao,
  ]);

  // Recruiting young prospects via Scouting
  const handleRecruitPlayer = (prospect: ScoutedPlayer) => {
    const newPlayer: TeamPlayer = {
      id: prospect.id,
      name: prospect.name,
      number: Math.floor(Math.random() * 80) + 17,
      position: prospect.position,
      ovr: prospect.ovr,
      energy: 100,
      isStarter: false,
      avatarColor: prospect.avatarColor,
    };

    setPlayers((prev) => {
      // Find if we have a non-hero starter in that position with lower OVR, and upgrade them to starter
      const currentStarter = prev.find(
        (p) => p.isStarter && p.position === prospect.position && !p.isCustomHero
      );
      if (currentStarter && prospect.ovr > currentStarter.ovr) {
        return prev
          .map((p) => (p.id === currentStarter.id ? { ...p, isStarter: false } : p))
          .concat({ ...newPlayer, isStarter: true });
      }
      return [...prev, newPlayer];
    });

    // Social post about new recruit
    const recruitPost: SocialPost = {
      id: `post_scout_${Date.now()}`,
      author: `${currentClub.name} Olheiro Oficial`,
      authorHandle: `@${currentClub.shortName.toLowerCase().replace(/\s+/g, '')}_olheiro`,
      avatarIcon: '🔍',
      badge: 'Clube Oficial',
      timeAgo: 'Agora',
      content: `🌟 CONTRATAÇÃO DA BASE: O olheiro garimpou e acertou a contratação de ${prospect.name} (${prospect.ovr} OVR, ${prospect.position}) com luvas de R$ ${prospect.cost.toLocaleString('pt-BR')}! O elenco ganha força para a temporada!`,
      likes: 1540,
      retweets: 320,
      replies: [
        {
          id: `rep_scout_${Date.now()}`,
          author: 'Torcida Dourada',
          authorAvatar: '👑',
          isHero: false,
          content: 'Bela visão do nosso olheiro! O moleque tem muito futuro!',
          likes: 72,
          timeAgo: 'Agora',
        },
      ],
    };
    setSocialPosts((prev) => [recruitPost, ...prev]);
  };

  const handleSpendCash = (amount: number): boolean => {
    if (cash < amount) return false;
    setCash((c) => c - amount);
    return true;
  };

  // Check and trigger Seleção Brasileira call-up when playing well
  const maybeTriggerSelecaoCallUp = (stats: MatchStats) => {
    if (isCalledUpToSelecao) return;

    const heroPlayer = players.find((p) => p.isCustomHero);
    const heroOvr = heroPlayer?.ovr || 59;
    const completedMatches = calendarDays.filter(
      (d) => d.type === 'MATCH' && d.status === 'COMPLETED'
    ).length;

    // Trigger call up if rating >= 7.0, or hero scored, or hero ovr >= 62, or at least 1 match played
    const isDeserving =
      stats.playerRating >= 7.0 ||
      stats.playerGoals >= 1 ||
      heroOvr >= 62 ||
      completedMatches >= 1;

    if (isDeserving) {
      setIsCalledUpToSelecao(true);
      setIsSelecaoCallUpModalOpen(true);
      playSound('cheer');

      // Unlock Convocação trophy
      setTrophies((prev) =>
        prev.map((t) =>
          t.id === 'trophy_selecao_convocacao'
            ? { ...t, unlocked: true, unlockedDate: 'Hoje' }
            : t
        )
      );

      // Social feed breaking news
      const callUpAnnouncement: SocialPost = {
        id: `post_convocacao_${Date.now()}`,
        author: 'CBF & Seleção Brasileira',
        authorHandle: '@cbf_selecao',
        avatarIcon: '🇧🇷',
        badge: 'Oficial CBF',
        timeAgo: 'Agora',
        content: `🚨 CONVOCAÇÃO HISTÓRICA! O técnico da Seleção Brasileira anunciou a lista oficial e ${avatar.name || 'Gabriel M.'} foi CONVOCADO para defender a Amarelinha! O craque jogará em datas internacionais livres do calendário! 🇧🇷⚽`,
        likes: 9800,
        retweets: 3410,
        replies: [
          {
            id: `rep_convocacao_${Date.now()}`,
            author: 'Torcida Canarinho',
            authorAvatar: '🇧🇷',
            isHero: false,
            content: 'CONVOCAÇÃO MERECIDÍSSIMA! O futebol dele tá de encher os olhos!',
            likes: 620,
            timeAgo: 'Agora',
          },
        ],
      };
      setSocialPosts((prev) => [callUpAnnouncement, ...prev]);
    }
  };

  // Generate new transfer interest from championship clubs
  const maybeGenerateTransferOffer = (day: CalendarDay) => {
    const allPool =
      day.competition === 'Taça Samba' ? TACA_SAMBA_OPPONENTS : CAMP_NACIONAL_OPPONENTS;
    const available = allPool.filter(
      (c) => c.name !== currentClub.name && c.id !== currentClub.id
    );
    if (available.length === 0) return;

    // Pick a candidate club
    const candidateClub = available[Math.floor(Math.random() * available.length)];
    const heroPlayer = players.find((p) => p.isCustomHero);
    const heroOvr = heroPlayer?.ovr || 60;
    const newOffer = createTransferOffer(candidateClub, heroOvr, day.globalDayIndex);

    setTransferOffers((prev) => [newOffer, ...prev.filter((o) => o.club.id !== candidateClub.id)]);
    setActiveNegotiatingOffer(newOffer);

    // Publish breaking news rumor on Torcida Social Feed
    const rumorPost: SocialPost = {
      id: `post_rumor_${Date.now()}`,
      author: 'Mercado da Bola TNT',
      authorHandle: '@mercadobolatnt',
      avatarIcon: '📢',
      badge: 'Jornalista Esportivo',
      timeAgo: 'Agora',
      content: `🚨 PROPOSTA OFICIAL NA MESA: A diretoria do ${candidateClub.name} formalizou uma oferta de alto padrão para contratar ${avatar.name || 'Gabriel M.'}! O presidente aguarda o craque na Sala de Negociação.`,
      likes: 1040,
      retweets: 235,
      replies: [
        {
          id: `rep_rumor_${Date.now()}`,
          author: `Torcida ${candidateClub.shortName}`,
          authorAvatar: candidateClub.badge,
          isHero: false,
          content: 'Vem ser feliz aqui, craque! A camisa 9 titular tá reservada pra você!',
          likes: 72,
          timeAgo: 'Agora',
        },
      ],
    };

    setSocialPosts((prev) => [rumorPost, ...prev]);
  };

  // Sign transfer contract officially
  const handleAcceptTransfer = (
    offer: TransferOffer,
    finalSalary: number,
    finalYears: number,
    finalSigningBonus: number
  ) => {
    const newClub: ClubInfo = {
      id: offer.club.id,
      name: offer.club.name,
      shortName: offer.club.shortName,
      badge: offer.club.badge,
      primaryColor: offer.club.primaryColor,
      secondaryColor: offer.club.secondaryColor,
      city: offer.club.city,
    };

    setCurrentClub(newClub);

    // Update player jersey to the new club's primary color
    setAvatar((prev) => ({
      ...prev,
      jerseyColor: offer.club.primaryColor,
    }));

    // Credit signing bonus to cash
    setCash((c) => c + finalSigningBonus);

    // Mark offer as accepted
    setTransferOffers((prev) =>
      prev.map((o) => (o.id === offer.id ? { ...o, status: 'ACCEPTED' as const } : o))
    );

    // Publish official announcement on Torcida Social Network
    const officialAnnouncement: SocialPost = {
      id: `post_official_${Date.now()}`,
      author: `${offer.club.name} Oficial`,
      authorHandle: `@${offer.club.shortName.toLowerCase().replace(/\s+/g, '')}_oficial`,
      avatarIcon: offer.club.badge,
      badge: 'Clube Oficial',
      timeAgo: 'Agora',
      content: `✍️ CONTRATO ASSINADO: ${avatar.name || 'Gabriel M.'} É DO ${offer.club.name.toUpperCase()}! O craque assinou vínculo de ${finalYears} temporadas com salário mensal de R$ ${finalSalary.toLocaleString('pt-BR')}. Sejam bem-vindos à nova era! 🏆⚽`,
      likes: 4890,
      retweets: 1320,
      replies: [
        {
          id: `rep_off_1_${Date.now()}`,
          author: `Torcida Organizada ${offer.club.shortName}`,
          authorAvatar: offer.club.badge,
          isHero: false,
          content: 'QUE CONTRATAÇÃO GIGANTESCA! O título brasileiro já tem dono!',
          likes: 310,
          timeAgo: 'Agora',
        },
        {
          id: `rep_off_2_${Date.now()}`,
          author: 'Central do Futebol Brasileiro',
          authorAvatar: '🎙️',
          isHero: false,
          content: 'Transferência de peso! O atleta chega como protagonista absoluto para liderar o elenco.',
          likes: 145,
          timeAgo: 'Agora',
        },
      ],
    };

    setSocialPosts((prev) => [officialAnnouncement, ...prev]);
  };

  // Reject transfer offer
  const handleRejectTransfer = (offerId: string) => {
    setTransferOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: 'REJECTED' as const } : o))
    );
  };

  // Evaluates trophy unlocks after any match
  const evaluateTrophies = (day: CalendarDay, stats: MatchStats, isWin: boolean) => {
    const updatedDays = calendarDays.map((d) =>
      d.globalDayIndex === day.globalDayIndex
        ? { ...d, status: 'COMPLETED' as const, matchStats: stats }
        : d
    );

    const totalGoals = updatedDays.reduce(
      (acc, d) => acc + (d.matchStats?.playerGoals || 0),
      0
    );

    const nacWins = updatedDays.filter(
      (d) =>
        d.competition === 'Campeonato Nacional' &&
        d.status === 'COMPLETED' &&
        d.matchStats &&
        d.matchStats.homeScore > d.matchStats.awayScore
    ).length;

    let bonusCash = 0;
    const newCelebrationPosts: SocialPost[] = [];

    const updatedTrophies = trophies.map((trophy) => {
      if (trophy.unlocked) return trophy;

      let unlockNow = false;

      // 1. Taça Samba Champion (9 matches tournament)
      if (
        trophy.id === 'trophy_taca_samba' &&
        day.competition === 'Taça Samba' &&
        (day.matchIndexInComp === 9 || day.dayNumber >= 9) &&
        isWin
      ) {
        unlockNow = true;
      }

      // 2. Campeonato Nacional Champion (18 matches tournament)
      if (
        (trophy.id === 'trophy_campeonato_nacional' || trophy.id === 'trophy_camp_nacional') &&
        day.competition === 'Campeonato Nacional' &&
        (nacWins >= 6 || day.matchIndexInComp === 18 || day.dayNumber >= 18) &&
        isWin
      ) {
        unlockNow = true;
      }

      // 2b. Copa Libertudores Continental Champion
      if (
        trophy.id === 'trophy_copa_libertudores' &&
        day.competition === 'Copa Libertudores' &&
        (day.title.includes('FINAL') || day.matchIndexInComp === 11 || day.dayNumber === 30) &&
        isWin
      ) {
        unlockNow = true;
      }

      // 3. Top Scorer
      if (trophy.id === 'trophy_artilheiro' && totalGoals >= 5) {
        unlockNow = true;
      }

      // 4. Curved shot master
      if (trophy.id === 'trophy_curva_magica' && stats.playerGoals >= 1) {
        unlockNow = true;
      }

      // 5. Clean sheet
      if (trophy.id === 'trophy_muralha' && isWin && stats.awayScore === 0) {
        unlockNow = true;
      }

      // 6. High Rating
      if (trophy.id === 'trophy_craque_supremo' && stats.playerRating >= 8.5) {
        unlockNow = true;
      }

      // 7. Seleção BR - Superclássico (vs Argélia Celeste)
      if (
        trophy.id === 'trophy_selecao_superclassico' &&
        day.competition === 'Seleção BR' &&
        day.opponent?.name === 'Argélia Celeste' &&
        isWin
      ) {
        unlockNow = true;
      }

      // 8. Seleção BR - Copa das Nações (Final)
      if (
        trophy.id === 'trophy_selecao_copa_nacoes' &&
        day.competition === 'Seleção BR' &&
        (day.title.includes('FINAL') || day.matchIndexInComp === 6) &&
        isWin
      ) {
        unlockNow = true;
      }

      // 9. Seleção BR - Artilheiro Canarinho (3+ goals with Seleção BR)
      const selecaoGoals = updatedDays
        .filter((d) => d.competition === 'Seleção BR')
        .reduce((acc, d) => acc + (d.matchStats?.playerGoals || 0), 0);
      if (trophy.id === 'trophy_selecao_artilheiro' && selecaoGoals >= 3) {
        unlockNow = true;
      }

      if (unlockNow) {
        bonusCash += trophy.rewardCash;
        newCelebrationPosts.push({
          id: `post_trophy_${trophy.id}_${Date.now()}`,
          author: day.competition === 'Seleção BR' ? 'Seleção Brasileira Oficial' : 'Manaus Gold Notícias',
          authorHandle: day.competition === 'Seleção BR' ? '@cbf_oficial' : '@manausgold_news',
          avatarIcon: day.competition === 'Seleção BR' ? '🇧🇷' : 'trophy',
          badge: 'Clube Oficial',
          timeAgo: 'Agora',
          content: `🏆 CONQUISTA HISTÓRICA! ${avatar.name || 'Gabriel M.'} conquistou o troféu: "${trophy.title}"! Bônus de R$ ${trophy.rewardCash.toLocaleString('pt-BR')} creditado!`,
          likes: 2250,
          retweets: 480,
          replies: [
            {
              id: `rep_trophy_${Date.now()}`,
              author: 'Torcida Apaixonada',
              authorAvatar: '🔥',
              isHero: false,
              content: 'MERECIDO DEMAIS! Orgulho do nosso futebol!',
              likes: 120,
              timeAgo: 'Agora',
            },
          ],
        });
        return {
          ...trophy,
          unlocked: true,
          unlockedDate: 'Hoje',
        };
      }

      return trophy;
    });

    if (bonusCash > 0) {
      playSound('goal');
      setCash((c) => c + bonusCash);
      setTrophies(updatedTrophies);
      if (newCelebrationPosts.length > 0) {
        setSocialPosts((prev) => [...newCelebrationPosts, ...prev]);
      }
    }
  };

  // Instant Match Simulation Algorithm
  const executeInstantMatchSimulation = (day: CalendarDay) => {
    const starters = players.filter((p) => p.isStarter);
    const teamOvr = Math.round(
      starters.reduce((acc, p) => acc + p.ovr, 0) / (starters.length || 1)
    );
    const oppOvr = day.opponent?.ovr || 62;

    // Realistic outcome formula
    const ovrDiff = teamOvr - oppOvr;
    const baseWinChance = 0.5 + ovrDiff * 0.04;
    const rand = Math.random();

    let homeScore = 1;
    let awayScore = 0;
    let heroGoals = 1;

    if (rand < baseWinChance) {
      // Home wins
      homeScore = Math.floor(Math.random() * 3) + 2; // 2 to 4
      awayScore = Math.floor(Math.random() * 2); // 0 or 1
      heroGoals = Math.min(homeScore, Math.floor(Math.random() * 2) + 1);
    } else if (rand < baseWinChance + 0.25) {
      // Draw
      homeScore = Math.floor(Math.random() * 2) + 1;
      awayScore = homeScore;
      heroGoals = Math.min(homeScore, Math.random() < 0.6 ? 1 : 0);
    } else {
      // Opponent wins
      homeScore = Math.floor(Math.random() * 2);
      awayScore = homeScore + 1;
      heroGoals = homeScore > 0 ? 1 : 0;
    }

    const heroRating = Number((6.8 + heroGoals * 1.4 + (homeScore > awayScore ? 0.6 : 0)).toFixed(1));

    const simStats: MatchStats = {
      homeScore,
      awayScore,
      homeShots: 10 + homeScore * 2,
      awayShots: 6 + awayScore * 2,
      homeShotsOnTarget: 5 + homeScore,
      awayShotsOnTarget: 3 + awayScore,
      homePossession: 55,
      awayPossession: 45,
      homePassAccuracy: 86,
      awayPassAccuracy: 79,
      homeFouls: 8,
      awayFouls: 11,
      homeCorners: 6,
      awayCorners: 4,
      playerRating: heroRating,
      playerGoals: heroGoals,
      playerAssists: homeScore > heroGoals ? 1 : 0,
      events: [
        {
          minute: 34,
          team: 'home',
          type: 'goal',
          player: avatar.name || 'Gabriel M.',
          description: `Golaço de ${avatar.name || 'Gabriel M.'} finalizando no canto!`,
        },
      ],
    };

    // Update calendar day with match stats
    setCalendarDays((days) =>
      days.map((d) =>
        d.globalDayIndex === day.globalDayIndex
          ? {
              ...d,
              status: 'COMPLETED',
              matchStats: simStats,
            }
          : d
      )
    );

    // Rewards: Playing or simulating consumes exactly 1 energy as requested!
    const isWin = homeScore > awayScore;
    setCash((c) => c + (isWin ? 8500 : 3000));
    setEnergy((e) => Math.max(0, e - 1));

    // Unlock training after playing or simulating a match
    setIsTrainingAvailable(true);

    // Evaluate trophies
    evaluateTrophies(day, simStats, isWin);

    // Check and trigger Seleção Brasileira call-up when playing well
    maybeTriggerSelecaoCallUp(simStats);

    // Chance to receive new transfer offer throughout the championship
    if (Math.random() < 0.65 || day.globalDayIndex % 3 === 0) {
      maybeGenerateTransferOffer(day);
    }

    // Open Post Match stats modal
    setPostMatchModalData({
      isOpen: true,
      stats: simStats,
      globalIndex: day.globalDayIndex,
    });
  };

  // Start a match from calendar or Seleção trigger (either LIVE play or INSTANT simulation)
  const handleSelectMatch = (globalIndex: number, mode: 'PLAY' | 'SIMULATE') => {
    let day = calendarDays.find((d) => d.globalDayIndex === globalIndex);
    if (!day) {
      if (nextSelecaoMatchDay && nextSelecaoMatchDay.globalDayIndex === globalIndex) {
        day = nextSelecaoMatchDay;
      }
    }

    if (!day) return;

    // If day is not yet configured with an opponent (e.g. converted from free day for Seleção)
    if (day.type !== 'MATCH' || !day.opponent) {
      if (isCalledUpToSelecao) {
        const opp = FICTIONAL_NATIONAL_TEAMS[0];
        day = {
          ...day,
          type: 'MATCH',
          competition: 'Seleção BR',
          isNationalTeamMatch: true,
          opponent: opp,
          title: `🇧🇷 Seleção BR vs ${opp.name} · Amistoso Oficial`,
          isHome: true,
          status: 'PENDING',
        };
        setCalendarDays((prev) =>
          prev.map((d) => (d.globalDayIndex === globalIndex ? day! : d))
        );
      } else {
        return;
      }
    }

    if (day.status === 'COMPLETED' && day.matchStats) {
      setPostMatchModalData({
        isOpen: true,
        stats: day.matchStats,
        globalIndex: day.globalDayIndex,
      });
      return;
    }

    if (mode === 'SIMULATE') {
      playSound('whistle');
      executeInstantMatchSimulation(day);
    } else {
      setActiveMatchDay(day);
      setScreen('MATCH');
    }
  };

  // When live match simulation completes
  const handleFinishMatch = (finalStats: MatchStats) => {
    if (!activeMatchDay) return;

    setCalendarDays((days) =>
      days.map((d) =>
        d.globalDayIndex === activeMatchDay.globalDayIndex
          ? {
              ...d,
              status: 'COMPLETED',
              matchStats: finalStats,
            }
          : d
      )
    );

    // Rewards: Playing consumes exactly 1 energy as requested!
    const isWin = finalStats.homeScore > finalStats.awayScore;
    setCash((c) => c + (isWin ? 8500 : 3000));
    setEnergy((e) => Math.max(0, e - 1));

    // Unlock training after playing or simulating a match
    setIsTrainingAvailable(true);

    // Evaluate trophies
    evaluateTrophies(activeMatchDay, finalStats, isWin);

    // Check and trigger Seleção Brasileira call-up when playing well
    maybeTriggerSelecaoCallUp(finalStats);

    // Chance to receive new transfer offer throughout the championship
    if (Math.random() < 0.65 || activeMatchDay.globalDayIndex % 3 === 0) {
      maybeGenerateTransferOffer(activeMatchDay);
    }

    setPostMatchModalData({
      isOpen: true,
      stats: finalStats,
      globalIndex: activeMatchDay.globalDayIndex,
    });
  };

  // Advance calendar after reviewing post match
  const handleAdvanceCalendar = () => {
    setPostMatchModalData({ isOpen: false, stats: null, globalIndex: 1 });
    setActiveMatchDay(null);
    if (currentGlobalIndex < calendarDays.length) {
      setCurrentGlobalIndex((n) => n + 1);
    }
    setScreen('CALENDAR');
  };

  // Save customized avatar
  const handleSaveAvatar = (newAvatar: AvatarConfig) => {
    setAvatar(newAvatar);
    setPlayers((prev) =>
      prev.map((p) =>
        p.isCustomHero
          ? { ...p, name: newAvatar.name, number: newAvatar.number }
          : p
      )
    );
  };

  // Reply to fan social post
  const handleAddSocialReply = (postId: string, reply: SocialReply) => {
    setSocialPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, replies: [...p.replies, reply], likes: p.likes + 2 }
          : p
      )
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#070D1E] text-white flex flex-col items-center justify-start overflow-x-hidden">
      {/* Screen 1: Main Lobby Hub */}
      {screen === 'LOBBY' && (
        <MainLobby
          avatar={avatar}
          currentClub={currentClub}
          onOpenAvatarEditor={() => setIsAvatarEditorOpen(true)}
          onEnterField={() => setScreen('CALENDAR')}
          onSimulateDirectly={() => {
            if (nextMatchDay) {
              executeInstantMatchSimulation(nextMatchDay);
            }
          }}
          onOpenSocialFeed={() => setIsSocialModalOpen(true)}
          onOpenTrophyRoom={() => setIsTrophyRoomOpen(true)}
          onOpenNegotiationRoom={() => {
            const pending =
              transferOffers.find((o) => o.status === 'PENDING') || transferOffers[0];
            if (pending) {
              setActiveNegotiatingOffer(pending);
              setIsNegotiationModalOpen(true);
            }
          }}
          onOpenTraining={() => setIsTrainingModalOpen(true)}
          onOpenScouting={() => setIsScoutingModalOpen(true)}
          isCalledUpToSelecao={isCalledUpToSelecao}
          onPlaySelecaoMatch={(globalIdx) => {
            const targetIdx = globalIdx ?? nextSelecaoMatchDay?.globalDayIndex;
            if (targetIdx !== undefined) {
              handleSelectMatch(targetIdx, 'PLAY');
            }
          }}
          onSimulateSelecaoMatch={(globalIdx) => {
            const targetIdx = globalIdx ?? nextSelecaoMatchDay?.globalDayIndex;
            if (targetIdx !== undefined) {
              handleSelectMatch(targetIdx, 'SIMULATE');
            }
          }}
          nextSelecaoMatchDay={nextSelecaoMatchDay}
          activeTransferOffersCount={transferOffers.filter((o) => o.status === 'PENDING').length}
          pendingTransferOffer={transferOffers.find((o) => o.status === 'PENDING') || null}
          unlockedTrophyCount={trophies.filter((t) => t.unlocked).length}
          onRest={handleRest}
          onOpenTactics={() => setIsTacticsModalOpen(true)}
          onOpenStats={() => setIsStatsModalOpen(true)}
          cash={cash}
          energy={energy}
          currentDayData={currentDayData}
          nextMatchDay={nextMatchDay}
          isTrainingAvailable={isTrainingAvailable}
          heroOvr={players.find((p) => p.isCustomHero)?.ovr || 59}
        />
      )}

      {/* Screen 2: Season Calendar */}
      {screen === 'CALENDAR' && (
        <SeasonCalendar
          days={calendarDays}
          currentGlobalIndex={currentGlobalIndex}
          currentClub={currentClub}
          onSelectMatch={handleSelectMatch}
          onOpenTactics={() => setIsTacticsModalOpen(true)}
          onOpenStats={() => setIsStatsModalOpen(true)}
          onBackToLobby={() => setScreen('LOBBY')}
          onOpenNegotiationRoom={() => {
            const pending =
              transferOffers.find((o) => o.status === 'PENDING') || transferOffers[0];
            if (pending) {
              setActiveNegotiatingOffer(pending);
              setIsNegotiationModalOpen(true);
            }
          }}
          pendingTransferOffer={transferOffers.find((o) => o.status === 'PENDING') || null}
          onTrain={handleTrain}
          onRest={handleRest}
          onAutoAdvanceDay={handleAutoAdvanceDay}
          players={players}
          userCash={cash}
          userEnergy={energy}
        />
      )}

      {/* Screen 3: Live Match View (2D Tactical Pitch + 10-Min Playable Highlights) */}
      {screen === 'MATCH' && activeMatchDay && activeMatchDay.opponent && (
        <MatchSimulationView
          opponent={activeMatchDay.opponent}
          isHome={activeMatchDay.isHome !== false}
          avatar={
            activeMatchDay.competition === 'Seleção BR'
              ? { ...avatar, jerseyColor: '#FACC15' }
              : avatar
          }
          homeTeamName={
            activeMatchDay.competition === 'Seleção BR'
              ? 'Seleção Brasileira'
              : currentClub.name
          }
          homeTeamBadge={
            activeMatchDay.competition === 'Seleção BR' ? '🇧🇷' : currentClub.badge
          }
          competitionName={activeMatchDay.competition}
          players={players}
          tactics={tactics}
          onFinishMatch={handleFinishMatch}
          onBackToCalendar={() => setScreen('CALENDAR')}
        />
      )}

      {/* MODAL: Player Avatar Editor */}
      <AvatarEditorModal
        initialConfig={avatar}
        isOpen={isAvatarEditorOpen}
        onClose={() => setIsAvatarEditorOpen(false)}
        onSave={handleSaveAvatar}
      />

      {/* MODAL: Tactical Lineup & Formation Manager */}
      <TacticsLineupModal
        isOpen={isTacticsModalOpen}
        onClose={() => setIsTacticsModalOpen(false)}
        players={players}
        tactics={tactics}
        onSave={(updatedPlayers, updatedTactics) => {
          setPlayers(updatedPlayers);
          setTactics(updatedTactics);
        }}
      />

      {/* MODAL: Post-Match Statistics */}
      {postMatchModalData.isOpen && postMatchModalData.stats && (
        <PostMatchModal
          isOpen={postMatchModalData.isOpen}
          stats={postMatchModalData.stats}
          opponent={
            calendarDays.find((d) => d.globalDayIndex === postMatchModalData.globalIndex)?.opponent ||
            activeMatchDay?.opponent ||
            calendarDays[0].opponent!
          }
          isHome={true}
          onClose={() => setPostMatchModalData({ isOpen: false, stats: null, globalIndex: 1 })}
          onAdvanceDay={handleAdvanceCalendar}
        />
      )}

      {/* MODAL: Season Standings & Player Stats */}
      <StatsOverviewModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        days={calendarDays}
        avatar={avatar}
        currentClub={currentClub}
      />

      {/* MODAL: Torcida Social Network (GolSocial) */}
      <SocialFeedModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        avatar={avatar}
        posts={socialPosts}
        onAddReply={handleAddSocialReply}
      />

      {/* MODAL: Sala de Troféus */}
      <TrophyRoomModal
        isOpen={isTrophyRoomOpen}
        onClose={() => setIsTrophyRoomOpen(false)}
        trophies={trophies}
      />

      {/* MODAL: Sala de Negociação & Contrato */}
      {activeNegotiatingOffer && (
        <NegotiationRoomModal
          isOpen={isNegotiationModalOpen}
          onClose={() => setIsNegotiationModalOpen(false)}
          offer={activeNegotiatingOffer}
          avatar={avatar}
          onAcceptTransfer={handleAcceptTransfer}
          onRejectTransfer={handleRejectTransfer}
          allOffers={transferOffers.filter((o) => o.status === 'PENDING')}
          onSelectDifferentOffer={(other) => setActiveNegotiatingOffer(other)}
        />
      )}

      {/* MODAL: Centro de Treinamento (Finalização & Pênaltis) */}
      <TrainingModal
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
        avatar={avatar}
        onFinishTrainingReward={handleFinishTrainingReward}
      />

      {/* MODAL: Olheiro / Scouting de Jovens Talentos */}
      <ScoutingModal
        isOpen={isScoutingModalOpen}
        onClose={() => setIsScoutingModalOpen(false)}
        userCash={cash}
        teamPlayers={players}
        onRecruitPlayer={handleRecruitPlayer}
        onSpendCash={handleSpendCash}
      />

      {/* MODAL: Convocação Oficial para a Seleção Brasileira */}
      <SelecaoCallUpModal
        isOpen={isSelecaoCallUpModalOpen}
        avatar={avatar}
        onClose={() => setIsSelecaoCallUpModalOpen(false)}
      />
    </div>
  );
}
