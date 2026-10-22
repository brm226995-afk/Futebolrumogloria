export type HairStyleType =
  | 'short_fade'
  | 'spiky'
  | 'curls'
  | 'buzz'
  | 'mohawk'
  | 'dreadlocks'
  | 'afro'
  | 'samurai'
  | 'long_band'
  | 'platinum_crop'
  | 'bald';

export type BeardStyleType =
  | 'goatee'
  | 'stubble'
  | 'clean'
  | 'full'
  | 'mustache'
  | 'spartan'
  | 'line_up'
  | 'van_dyke';

export interface AvatarConfig {
  name: string;
  number: number;
  skinTone: string;
  hairColor: string;
  hairStyle: HairStyleType;
  beardStyle: BeardStyleType;
  bootColor: string;
  jerseyColor: string;
}

export interface PlayerStats {
  ovr: number;
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
}

export interface TeamPlayer {
  id: string;
  name: string;
  number: number;
  position: 'GOL' | 'ZAG' | 'LAT' | 'VOL' | 'MEI' | 'ATA';
  ovr: number;
  energy: number;
  isStarter: boolean;
  avatarColor?: string;
  isCustomHero?: boolean;
}

export interface OpponentTeam {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  primaryColor: string;
  secondaryColor: string;
  ovr: number;
  city: string;
  starPlayer: string;
}

export interface MatchStats {
  homeScore: number;
  awayScore: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homePossession: number;
  awayPossession: number;
  homePassAccuracy: number;
  awayPassAccuracy: number;
  homeFouls: number;
  awayFouls: number;
  homeCorners: number;
  awayCorners: number;
  playerRating: number;
  playerGoals: number;
  playerAssists: number;
  events: {
    minute: number;
    team: 'home' | 'away';
    type: 'goal' | 'yellow_card' | 'red_card' | 'shot' | 'save' | 'substitution';
    player: string;
    description: string;
  }[];
}

export interface CalendarDay {
  dayNumber: number; // Day of month: 1 to 30 (or 20)
  monthName: string; // 'Janeiro', 'Fevereiro', 'Março', 'Abril'
  globalDayIndex: number; // global calendar progression
  type: 'MATCH' | 'TRAINING' | 'REST' | 'EVENT';
  opponent?: OpponentTeam;
  isHome?: boolean;
  competition?: 'Taça Samba' | 'Campeonato Nacional' | 'Copa Libertudores';
  matchIndexInComp?: number; // e.g. 1 to 9 for Taça Samba, 1 to 18 for Camp Nacional
  title: string;
  status: 'PENDING' | 'CURRENT' | 'COMPLETED';
  matchStats?: MatchStats;
}

export type TacticsPosture = 'Defensivo' | 'Equilíbrio' | 'Ofensivo';
export type TacticsPassing = 'Curto' | 'Misto' | 'Direto';
export type TacticsPace = 'Lento' | 'Normal' | 'Rápido';
export type FormationType = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1';

export interface TacticsSettings {
  formation: FormationType;
  posture: TacticsPosture;
  passing: TacticsPassing;
  pace: TacticsPace;
}

export interface SocialReply {
  id: string;
  author: string;
  authorAvatar: string;
  isHero: boolean;
  content: string;
  likes: number;
  timeAgo: string;
}

export interface SocialPost {
  id: string;
  author: string;
  authorHandle: string;
  avatarIcon: string;
  badge?: string; // 'Torcedor Oficial' | 'Jornalista Esportivo' | 'Clube Oficial'
  content: string;
  likes: number;
  retweets: number;
  timeAgo: string;
  replies: SocialReply[];
}

export interface TrophyItem {
  id: string;
  title: string;
  category: 'CHAMPIONSHIP' | 'INDIVIDUAL' | 'SPECIAL';
  description: string;
  unlocked: boolean;
  unlockedDate?: string;
  icon: string;
  tier: 'GOLD' | 'SILVER' | 'PLATINUM';
  rewardCash: number;
  rewardXp: number;
}

export interface ClubInfo {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  primaryColor: string;
  secondaryColor: string;
  city: string;
}

export interface TransferOffer {
  id: string;
  club: OpponentTeam;
  presidentName: string;
  presidentTitle: string;
  salaryMonthly: number; // e.g. R$ 35.000 / mês
  contractYears: number; // 1 to 4 years
  signingBonus: number; // e.g. R$ 120.000 à vista
  goalBonus: number; // e.g. R$ 3.500 por gol
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  pitchMessage: string;
  createdAtGlobalIndex: number;
}

export type HighlightScenarioType = 'OPEN_PLAY' | 'FREE_KICK' | 'PENALTY';

export interface RefereeIntervention {
  type: 'YELLOW_CARD' | 'RED_CARD';
  reason: string;
  offendingPlayer: string;
  offendingTeam: string;
  foulSeverity: 'LIGHT' | 'SEVERE';
  awardedAction: 'FREE_KICK' | 'PENALTY';
}

export type TrainingDrillType = 'FINISHING' | 'PENALTY';


