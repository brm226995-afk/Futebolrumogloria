import {
  AvatarConfig,
  CalendarDay,
  ClubInfo,
  SocialPost,
  TacticsSettings,
  TeamPlayer,
  TransferOffer,
  TrophyItem,
} from '../types/game';

const STORAGE_KEY = 'craque_da_bola_saved_state_v1';

export interface PersistedGameState {
  avatar: AvatarConfig;
  players: TeamPlayer[];
  tactics: TacticsSettings;
  calendarDays: CalendarDay[];
  currentGlobalIndex: number;
  cash: number;
  energy: number;
  socialPosts: SocialPost[];
  trophies: TrophyItem[];
  currentClub?: ClubInfo;
  activeTransferOffers?: TransferOffer[];
  isCalledUpToSelecao?: boolean;
}

export function saveGameState(state: PersistedGameState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error('Failed to auto-save game state to localStorage:', err);
  }
}

export function loadGameState(): Partial<PersistedGameState> | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized) as Partial<PersistedGameState>;
  } catch (err) {
    console.error('Failed to load game state from localStorage:', err);
    return null;
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear game state:', err);
  }
}
