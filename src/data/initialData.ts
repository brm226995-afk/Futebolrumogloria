import {
  AvatarConfig,
  CalendarDay,
  ClubInfo,
  OpponentTeam,
  SocialPost,
  TacticsSettings,
  TeamPlayer,
  TransferOffer,
  TrophyItem,
} from '../types/game';

export const DEFAULT_CLUB: ClubInfo = {
  id: 'manaus_gold',
  name: 'Manaus Gold',
  shortName: 'Manaus Gold',
  badge: '👑',
  primaryColor: '#F7D002',
  secondaryColor: '#1A2C5B',
  city: 'Manaus',
};

export const INITIAL_AVATAR: AvatarConfig = {
  name: 'Gabriel M.',
  number: 9,
  skinTone: '#EAC096',
  hairColor: '#F2E8CF',
  hairStyle: 'short_fade',
  beardStyle: 'goatee',
  bootColor: '#1A1A1A',
  jerseyColor: '#F7D002', // Manaus Gold
};

export const INITIAL_PLAYERS: TeamPlayer[] = [
  { id: 'p1', name: 'Mathios', number: 1, position: 'GOL', ovr: 65, energy: 95, isStarter: true },
  { id: 'p2', name: 'B. Lima', number: 2, position: 'LAT', ovr: 60, energy: 90, isStarter: true },
  { id: 'p3', name: 'G. Silva', number: 3, position: 'LAT', ovr: 62, energy: 92, isStarter: true },
  { id: 'p4', name: 'Rodrigo', number: 4, position: 'ZAG', ovr: 63, energy: 88, isStarter: true },
  { id: 'p5', name: 'Wallace', number: 5, position: 'ZAG', ovr: 64, energy: 91, isStarter: true },
  { id: 'p6', name: 'Ricerda', number: 6, position: 'VOL', ovr: 61, energy: 89, isStarter: true },
  { id: 'p7', name: 'Luan', number: 7, position: 'MEI', ovr: 63, energy: 94, isStarter: true },
  { id: 'p8', name: 'P. Henrique', number: 8, position: 'VOL', ovr: 62, energy: 90, isStarter: true },
  { id: 'p9', name: 'Gabriel M.', number: 9, position: 'ATA', ovr: 59, energy: 100, isStarter: true, isCustomHero: true },
  { id: 'p10', name: 'Ronald', number: 10, position: 'MEI', ovr: 66, energy: 93, isStarter: true },
  { id: 'p11', name: 'Yuri', number: 11, position: 'ATA', ovr: 62, energy: 87, isStarter: true },
  // Reservas
  { id: 'p12', name: 'C. Alencar', number: 12, position: 'GOL', ovr: 58, energy: 100, isStarter: false },
  { id: 'p13', name: 'Danilo', number: 13, position: 'ZAG', ovr: 59, energy: 100, isStarter: false },
  { id: 'p14', name: 'F. Melo', number: 14, position: 'VOL', ovr: 60, energy: 100, isStarter: false },
  { id: 'p15', name: 'L. Moura', number: 15, position: 'MEI', ovr: 61, energy: 100, isStarter: false },
  { id: 'p16', name: 'V. Rocha', number: 16, position: 'ATA', ovr: 59, energy: 100, isStarter: false },
];

// Pool 1: Times exclusivos da TAÇA SAMBA (Copa Tradicional de 10 Clubes)
export const TACA_SAMBA_OPPONENTS: OpponentTeam[] = [
  { id: 'spw', name: 'São Paulo White', shortName: 'SP White', badge: '⚓', primaryColor: '#FFFFFF', secondaryColor: '#1E3A8A', ovr: 62, city: 'São Paulo', starPlayer: 'Ricardo' },
  { id: 'rfl', name: 'Rio Flames', shortName: 'Flames', badge: '🔥', primaryColor: '#DC2626', secondaryColor: '#000000', ovr: 64, city: 'Rio de Janeiro', starPlayer: 'Vini' },
  { id: 'bhi', name: 'Belo Horizonte Iron', shortName: 'BH Iron', badge: '⚔️', primaryColor: '#4B5563', secondaryColor: '#111827', ovr: 61, city: 'Belo Horizonte', starPlayer: 'Everton' },
  { id: 'pab', name: 'Porto Alegre Blue', shortName: 'PA Blue', badge: '⚡', primaryColor: '#2563EB', secondaryColor: '#000000', ovr: 66, city: 'Porto Alegre', starPlayer: 'Suárez Jr.' },
  { id: 'ctf', name: 'Curitiba Forest', shortName: 'CT Forest', badge: '🌲', primaryColor: '#059669', secondaryColor: '#FFFFFF', ovr: 63, city: 'Curitiba', starPlayer: 'Rafinha' },
  { id: 'sbr', name: 'Salvador Bahia Rays', shortName: 'Bahia Rays', badge: '☀️', primaryColor: '#0284C7', secondaryColor: '#E11D48', ovr: 65, city: 'Salvador', starPlayer: 'Cauly' },
  { id: 'bsc', name: 'Brasília Capital', shortName: 'Capital FC', badge: '🏛️', primaryColor: '#D97706', secondaryColor: '#1E293B', ovr: 67, city: 'Brasília', starPlayer: 'Henrique' },
  { id: 'rec', name: 'Recife Sharks', shortName: 'Recife Sharks', badge: '🦈', primaryColor: '#B91C1C', secondaryColor: '#F59E0B', ovr: 68, city: 'Recife', starPlayer: 'Diego Souza' },
  { id: 'sto', name: 'Santos Ocean', shortName: 'Santos Ocean', badge: '🌊', primaryColor: '#FFFFFF', secondaryColor: '#000000', ovr: 70, city: 'Santos', starPlayer: 'Ney Jr.' },
];

// Pool 2: Times exclusivos do CAMPEONATO NACIONAL (Diferentes da Taça Samba!)
export const CAMP_NACIONAL_OPPONENTS: OpponentTeam[] = [
  { id: 'ftz', name: 'Fortaleza Solar', shortName: 'Fortaleza Sol', badge: '🌅', primaryColor: '#EA580C', secondaryColor: '#1E40AF', ovr: 64, city: 'Fortaleza', starPlayer: 'Pikachu' },
  { id: 'goi', name: 'Goiana Emeralds', shortName: 'Goiana Eme', badge: '💎', primaryColor: '#10B981', secondaryColor: '#064E3B', ovr: 63, city: 'Goiânia', starPlayer: 'Tadeu' },
  { id: 'blm', name: 'Belém Amazônia', shortName: 'Belém Amaz', badge: '🐆', primaryColor: '#15803D', secondaryColor: '#CA8A04', ovr: 62, city: 'Belém', starPlayer: 'Rony' },
  { id: 'cmp', name: 'Campinas Vipers', shortName: 'CP Vipers', badge: '🐍', primaryColor: '#7C3AED', secondaryColor: '#000000', ovr: 60, city: 'Campinas', starPlayer: 'Lucca' },
  { id: 'fln', name: 'Floripa Waves', shortName: 'Floripa W', badge: '🏄', primaryColor: '#06B6D4', secondaryColor: '#0F172A', ovr: 63, city: 'Florianópolis', starPlayer: 'Marquinhos' },
  { id: 'cui', name: 'Cuiabá Pantanal', shortName: 'Pantanal FC', badge: '🐾', primaryColor: '#84CC16', secondaryColor: '#14532D', ovr: 61, city: 'Cuiabá', starPlayer: 'Deyver' },
  { id: 'nat', name: 'Natal Dunes', shortName: 'Natal Dunes', badge: '🏜️', primaryColor: '#F59E0B', secondaryColor: '#9A3412', ovr: 59, city: 'Natal', starPlayer: 'Wallyson' },
  { id: 'vit', name: 'Vitória Falcons', shortName: 'Vitória Falc', badge: '🦅', primaryColor: '#9333EA', secondaryColor: '#F3F4F6', ovr: 62, city: 'Vitória', starPlayer: 'Alisson' },
  { id: 'mac', name: 'Maceió Coral', shortName: 'Maceió Cor', badge: '🪸', primaryColor: '#F43F5E', secondaryColor: '#FFFFFF', ovr: 61, city: 'Maceió', starPlayer: 'Anselmo' },
  { id: 'cax', name: 'Caxias Mountain', shortName: 'Caxias Mt', badge: '🏔️', primaryColor: '#64748B', secondaryColor: '#0F172A', ovr: 60, city: 'Caxias do Sul', starPlayer: 'Nenê' },
  { id: 'lon', name: 'Londrina Thunder', shortName: 'Londrina Thu', badge: '⛈️', primaryColor: '#0284C7', secondaryColor: '#FFFFFF', ovr: 61, city: 'Londrina', starPlayer: 'Paulinho' },
  { id: 'pvt', name: 'Porto Velho Titans', shortName: 'PV Titans', badge: '🛡️', primaryColor: '#B45309', secondaryColor: '#1C1917', ovr: 58, city: 'Porto Velho', starPlayer: 'Cabixi' },
  { id: 'ara', name: 'Aracaju Palms', shortName: 'Aracaju Plm', badge: '🌴', primaryColor: '#059669', secondaryColor: '#FEF08A', ovr: 60, city: 'Aracaju', starPlayer: 'Tiquinho' },
  { id: 'pal', name: 'Palmas Sun', shortName: 'Palmas Sun', badge: '☀️', primaryColor: '#EAB308', secondaryColor: '#7C2D12', ovr: 59, city: 'Palmas', starPlayer: 'Valdo' },
  { id: 'ter', name: 'Teresina Royals', shortName: 'Teresina Roy', badge: '👑', primaryColor: '#4338CA', secondaryColor: '#FDE047', ovr: 60, city: 'Teresina', starPlayer: 'Eduardo' },
  { id: 'bvs', name: 'Boa Vista Stars', shortName: 'BV Stars', badge: '⭐', primaryColor: '#2563EB', secondaryColor: '#FFFFFF', ovr: 58, city: 'Boa Vista', starPlayer: 'Ramon' },
  { id: 'cgr', name: 'Campo Grande Storm', shortName: 'CG Storm', badge: '🌪️', primaryColor: '#334155', secondaryColor: '#38BDF8', ovr: 61, city: 'Campo Grande', starPlayer: 'Chicão' },
  { id: 'joi', name: 'Joinville Eagles', shortName: 'Joinville Eag', badge: '🦅', primaryColor: '#BE123C', secondaryColor: '#000000', ovr: 62, city: 'Joinville', starPlayer: 'Lima' },
];

// Pool 3: Times da COPA LIBERTUDORES (Classificados nacionais + Gigantes sul-americanos com nomes fictícios)
export const LIBERTUDORES_OPPONENTS: OpponentTeam[] = [
  // Fictional South American Giants
  { id: 'bap', name: 'Buenos Aires Plate', shortName: 'BA Plate', badge: '🦅', primaryColor: '#FFFFFF', secondaryColor: '#DC2626', ovr: 77, city: 'Buenos Aires', starPlayer: 'Enzo P.' },
  { id: 'bcp', name: 'Boca Portenha', shortName: 'Boca Port.', badge: '⚓', primaryColor: '#1E3A8A', secondaryColor: '#FACC15', ovr: 78, city: 'Buenos Aires', starPlayer: 'Cavani Jr.' },
  { id: 'mvc', name: 'Montevideo Carbon', shortName: 'Montevideo C.', badge: '🚂', primaryColor: '#000000', secondaryColor: '#FACC15', ovr: 74, city: 'Montevidéu', starPlayer: 'Forlán S.' },
  { id: 'mdv', name: 'Medellín Verde', shortName: 'Medellín V.', badge: '🏔️', primaryColor: '#15803D', secondaryColor: '#FFFFFF', ovr: 73, city: 'Medellín', starPlayer: 'Moreno' },
  { id: 'sta', name: 'Santiago Albo', shortName: 'Santiago A.', badge: '⚔️', primaryColor: '#FFFFFF', secondaryColor: '#000000', ovr: 72, city: 'Santiago', starPlayer: 'Vidal C.' },
  { id: 'qtc', name: 'Quito Cordilheira', shortName: 'Quito Cord.', badge: '⚡', primaryColor: '#FFFFFF', secondaryColor: '#2563EB', ovr: 73, city: 'Quito', starPlayer: 'Valencia' },
  { id: 'asg', name: 'Asunción Guaraní', shortName: 'Asunción G.', badge: '🏹', primaryColor: '#F59E0B', secondaryColor: '#000000', ovr: 71, city: 'Assunção', starPlayer: 'Santacruz' },
  { id: 'lmc', name: 'Lima Cristalino', shortName: 'Lima Crist.', badge: '💎', primaryColor: '#38BDF8', secondaryColor: '#FFFFFF', ovr: 70, city: 'Lima', starPlayer: 'Guerrero' },
  // Qualified Brazilian Teams from Standings
  { id: 'sto', name: 'Santos Ocean', shortName: 'Santos Ocean', badge: '🌊', primaryColor: '#FFFFFF', secondaryColor: '#000000', ovr: 76, city: 'Santos', starPlayer: 'Ney Jr.' },
  { id: 'spw', name: 'São Paulo White', shortName: 'SP White', badge: '⚓', primaryColor: '#FFFFFF', secondaryColor: '#1E3A8A', ovr: 75, city: 'São Paulo', starPlayer: 'Ricardo' },
  { id: 'rfl', name: 'Rio Flames', shortName: 'Flames', badge: '🔥', primaryColor: '#DC2626', secondaryColor: '#000000', ovr: 77, city: 'Rio de Janeiro', starPlayer: 'Vini' },
  { id: 'pab', name: 'Porto Alegre Blue', shortName: 'PA Blue', badge: '⚡', primaryColor: '#2563EB', secondaryColor: '#000000', ovr: 76, city: 'Porto Alegre', starPlayer: 'Suárez Jr.' },
];

export const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'];
export const DAYS_PER_MONTH = 30;

// Function to generate calendar with separate tournaments & different opponents
export function generateFullCalendar(): CalendarDay[] {
  const allDays: CalendarDay[] = [];
  let globalIndex = 1;

  // 1. JANEIRO (30 dias) -> TAÇA SAMBA (9 partidas com os times tradicionais da Taça Samba)
  const tacaSambaMatchDays = [2, 5, 8, 12, 15, 18, 22, 26, 30]; // 9 partidas

  for (let d = 1; d <= DAYS_PER_MONTH; d++) {
    const matchIdx = tacaSambaMatchDays.indexOf(d);
    if (matchIdx !== -1) {
      const opp = TACA_SAMBA_OPPONENTS[matchIdx];
      const matchNum = matchIdx + 1;
      const stageName =
        matchNum === 9
          ? 'GRANDE FINAL DA TAÇA SAMBA'
          : matchNum === 8
          ? 'Semifinal da Taça Samba'
          : matchNum === 7
          ? 'Quartas da Taça Samba'
          : `Taça Samba · Rodada ${matchNum}/9`;

      allDays.push({
        dayNumber: d,
        monthName: 'Janeiro',
        globalDayIndex: globalIndex++,
        type: 'MATCH',
        competition: 'Taça Samba',
        matchIndexInComp: matchNum,
        opponent: opp,
        isHome: matchNum % 2 === 1,
        title: `${stageName} vs ${opp.shortName}`,
        status: globalIndex === 2 ? 'CURRENT' : 'PENDING',
      });
    } else if (d % 3 === 0) {
      allDays.push({
        dayNumber: d,
        monthName: 'Janeiro',
        globalDayIndex: globalIndex++,
        type: 'TRAINING',
        title: 'Treino Tático & Finalização',
        status: 'PENDING',
      });
    } else if (d % 4 === 0) {
      allDays.push({
        dayNumber: d,
        monthName: 'Janeiro',
        globalDayIndex: globalIndex++,
        type: 'EVENT',
        title: 'Coletiva & Ativação de Marca',
        status: 'PENDING',
      });
    } else {
      allDays.push({
        dayNumber: d,
        monthName: 'Janeiro',
        globalDayIndex: globalIndex++,
        type: 'REST',
        title: 'Dia Livre & Descanso Muscular',
        status: 'PENDING',
      });
    }
  }

  // 2. FEVEREIRO, MARÇO, ABRIL -> CAMPEONATO NACIONAL (18 partidas com os times do Campeonato)
  const campNacionalMonths = ['Fevereiro', 'Março', 'Abril'];
  let compMatchCounter = 0;

  campNacionalMonths.forEach((month) => {
    // 6 match days per month = 18 matches total
    const monthMatchDays = [4, 9, 14, 19, 24, 29];

    for (let d = 1; d <= DAYS_PER_MONTH; d++) {
      const matchPos = monthMatchDays.indexOf(d);
      if (matchPos !== -1 && compMatchCounter < 18) {
        const opp = CAMP_NACIONAL_OPPONENTS[compMatchCounter % CAMP_NACIONAL_OPPONENTS.length];
        const matchNum = compMatchCounter + 1;
        compMatchCounter++;

        allDays.push({
          dayNumber: d,
          monthName: month,
          globalDayIndex: globalIndex++,
          type: 'MATCH',
          competition: 'Campeonato Nacional',
          matchIndexInComp: matchNum,
          opponent: opp,
          isHome: matchNum % 2 === 0,
          title: `Campeonato Nacional · Rodada ${matchNum}/18 vs ${opp.shortName}`,
          status: 'PENDING',
        });
      } else if (d % 3 === 0) {
        allDays.push({
          dayNumber: d,
          monthName: month,
          globalDayIndex: globalIndex++,
          type: 'TRAINING',
          title: 'Treino Tático & Físico',
          status: 'PENDING',
        });
      } else if (d % 5 === 0) {
        allDays.push({
          dayNumber: d,
          monthName: month,
          globalDayIndex: globalIndex++,
          type: 'EVENT',
          title: 'Entrevista com a Imprensa',
          status: 'PENDING',
        });
      } else {
        allDays.push({
          dayNumber: d,
          monthName: month,
          globalDayIndex: globalIndex++,
          type: 'REST',
          title: 'Recuperação Muscular',
          status: 'PENDING',
        });
      }
    }
  });

  // 3. MAIO & JUNHO -> COPA LIBERTUDORES (Fase de Grupos em Maio + Mata-Mata Continental em Junho)
  // Maio: 6 partidas da Fase de Grupos
  const maioMatchDays = [4, 9, 14, 19, 24, 29];
  maioMatchDays.forEach((matchDay, idx) => {
    // Fill days before match day
    const prevDay = idx === 0 ? 1 : maioMatchDays[idx - 1] + 1;
    for (let d = prevDay; d < matchDay; d++) {
      allDays.push({
        dayNumber: d,
        monthName: 'Maio',
        globalDayIndex: globalIndex++,
        type: d % 3 === 0 ? 'TRAINING' : d % 5 === 0 ? 'EVENT' : 'REST',
        title: d % 3 === 0 ? 'Treino Continental Pré-Jogo' : 'Concentração & Recuperação',
        status: 'PENDING',
      });
    }

    const opp = LIBERTUDORES_OPPONENTS[idx % LIBERTUDORES_OPPONENTS.length];
    allDays.push({
      dayNumber: matchDay,
      monthName: 'Maio',
      globalDayIndex: globalIndex++,
      type: 'MATCH',
      competition: 'Copa Libertudores',
      matchIndexInComp: idx + 1,
      opponent: opp,
      isHome: idx % 2 === 0,
      title: `Copa Libertudores · Grupos ${idx + 1}/6 vs ${opp.shortName}`,
      status: 'PENDING',
    });
  });
  // Fill remainder of Maio (day 30)
  allDays.push({
    dayNumber: 30,
    monthName: 'Maio',
    globalDayIndex: globalIndex++,
    type: 'REST',
    title: 'Classificação para o Mata-Mata Continental',
    status: 'PENDING',
  });

  // Junho: Mata-Mata da Copa Libertudores (Oitavas, Quartas, Semi Ida, Semi Volta, Grande Final)
  const junhoKnockoutDays = [
    { day: 5, stage: 'Oitavas de Final Continental', matchIdx: 7, opp: LIBERTUDORES_OPPONENTS[6] },
    { day: 12, stage: 'Quartas de Final Continental', matchIdx: 8, opp: LIBERTUDORES_OPPONENTS[2] },
    { day: 18, stage: 'Semifinal da Libertudores (Ida)', matchIdx: 9, opp: LIBERTUDORES_OPPONENTS[1] },
    { day: 24, stage: 'Semifinal da Libertudores (Volta)', matchIdx: 10, opp: LIBERTUDORES_OPPONENTS[1] },
    { day: 30, stage: '🏆 GRANDE FINAL DA COPA LIBERTUDORES', matchIdx: 11, opp: LIBERTUDORES_OPPONENTS[0] },
  ];

  let lastJunhoDay = 1;
  junhoKnockoutDays.forEach((ko) => {
    for (let d = lastJunhoDay; d < ko.day; d++) {
      allDays.push({
        dayNumber: d,
        monthName: 'Junho',
        globalDayIndex: globalIndex++,
        type: d % 3 === 0 ? 'TRAINING' : d % 4 === 0 ? 'EVENT' : 'REST',
        title: d % 3 === 0 ? 'Treino Tático Libertudores' : 'Foco na Glória Eterna',
        status: 'PENDING',
      });
    }
    allDays.push({
      dayNumber: ko.day,
      monthName: 'Junho',
      globalDayIndex: globalIndex++,
      type: 'MATCH',
      competition: 'Copa Libertudores',
      matchIndexInComp: ko.matchIdx,
      opponent: ko.opp,
      isHome: ko.matchIdx % 2 === 1,
      title: `${ko.stage} vs ${ko.opp.shortName}`,
      status: 'PENDING',
    });
    lastJunhoDay = ko.day + 1;
  });

  return allDays;
}

export const INITIAL_TACTICS: TacticsSettings = {
  formation: '4-3-3',
  posture: 'Equilíbrio',
  passing: 'Curto',
  pace: 'Normal',
};

// Initial list of trophies that can be earned and placed in the Trophy Room
export const INITIAL_TROPHIES: TrophyItem[] = [
  {
    id: 'trophy_taca_samba',
    title: 'Taça Samba Oficial',
    category: 'CHAMPIONSHIP',
    description: 'Vença a grande final da Taça Samba (9 partidas disputadas).',
    unlocked: false,
    icon: '🏆',
    tier: 'GOLD',
    rewardCash: 50000,
    rewardXp: 500,
  },
  {
    id: 'trophy_camp_nacional',
    title: 'Troféu do Campeonato Nacional',
    category: 'CHAMPIONSHIP',
    description: 'Conquiste o título de Campeão Nacional disputando 18 rodadas!',
    unlocked: false,
    icon: '👑',
    tier: 'PLATINUM',
    rewardCash: 120000,
    rewardXp: 1000,
  },
  {
    id: 'trophy_copa_libertudores',
    title: 'Copa Libertudores Continental',
    category: 'CHAMPIONSHIP',
    description: 'Conquiste a Glória Eterna na final continental da Copa Libertudores!',
    unlocked: false,
    icon: '⭐🏆',
    tier: 'PLATINUM',
    rewardCash: 250000,
    rewardXp: 2000,
  },
  {
    id: 'trophy_artilheiro',
    title: 'Chuteira de Ouro',
    category: 'INDIVIDUAL',
    description: 'Marque 5 ou mais gols com o seu craque na temporada.',
    unlocked: false,
    icon: '👟',
    tier: 'GOLD',
    rewardCash: 25000,
    rewardXp: 300,
  },
  {
    id: 'trophy_curva_perfeita',
    title: 'Mestre da Curva e Trivela',
    category: 'SPECIAL',
    description: 'Marque um golaço nos Melhores Momentos utilizando a barra de curva.',
    unlocked: false,
    icon: '⚽',
    tier: 'SILVER',
    rewardCash: 15000,
    rewardXp: 200,
  },
  {
    id: 'trophy_muralha',
    title: 'Defesa de Aço',
    category: 'SPECIAL',
    description: 'Vença uma partida sem sofrer nenhum gol (clean sheet).',
    unlocked: false,
    icon: '🛡️',
    tier: 'SILVER',
    rewardCash: 10000,
    rewardXp: 150,
  },
  {
    id: 'trophy_craque_supremo',
    title: 'Nota 10 da Galera',
    category: 'INDIVIDUAL',
    description: 'Receba nota 8.5 ou superior em uma partida oficial.',
    unlocked: false,
    icon: '⭐',
    tier: 'GOLD',
    rewardCash: 20000,
    rewardXp: 250,
  },
];

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'sp_1',
    author: 'Torcida Fúria Dourada',
    authorHandle: '@furiadourada_oficial',
    avatarIcon: '🦁',
    badge: 'Torcida Oficial',
    content: 'O nosso camisa 9 tem tudo para ser o artilheiro do time na Taça Samba! A torcida quer ver raça e gols em campo!',
    likes: 342,
    retweets: 89,
    timeAgo: '15 min atrás',
    replies: [
      {
        id: 'r_1',
        author: 'Marcos Silva',
        authorAvatar: '⚽',
        isHero: false,
        content: 'Concordo! Aquele chute colocado dele no ângulo é indefensável.',
        likes: 24,
        timeAgo: '10 min atrás',
      },
    ],
  },
  {
    id: 'sp_2',
    author: 'Futebol em Debate Brasil',
    authorHandle: '@debate_boleiros',
    avatarIcon: '🎙️',
    badge: 'Jornalista Esportivo',
    content: 'Análise tática: Manaus Gold tem transição rápida. Se o atacante souber se movimentar na área, os adversários não vão segurar!',
    likes: 512,
    retweets: 120,
    timeAgo: '1h atrás',
    replies: [],
  },
  {
    id: 'sp_3',
    author: 'Lucas Nação',
    authorHandle: '@lucas_goldfan',
    avatarIcon: '🔥',
    content: 'Hoje é dia de entrar em campo e atropelar! Quem vai ao estádio apoiar o nosso clube?',
    likes: 184,
    retweets: 15,
    timeAgo: '2h atrás',
    replies: [],
  },
  {
    id: 'sp_4',
    author: 'Central da Rodada',
    authorHandle: '@central_futebol',
    avatarIcon: '🏆',
    badge: 'Imprensa',
    content: 'A Taça Samba começa pegando fogo com 9 partidas decisivas! Quem leva o caneco este ano?',
    likes: 640,
    retweets: 92,
    timeAgo: '3h atrás',
    replies: [],
  },
];

export const CLUB_PRESIDENTS: Record<string, { name: string; title: string; greeting: string; personality: 'ambitious' | 'diplomatic' | 'demanding' }> = {
  sto: { name: 'Dr. Marcelo Guimarães', title: 'Presidente do Santos Ocean', greeting: 'A Vila Belmiro precisa do seu talento para voltar a encantar o país. Queremos você como nosso camisa 9 titular!', personality: 'ambitious' },
  rfl: { name: 'Comendador Landim', title: 'Presidente do Rio Flames', greeting: 'A Maior Torcida do Mundo quer ver você decidindo os clássicos no Maracanã! Montamos um projeto campeão.', personality: 'demanding' },
  spw: { name: 'Dr. Júlio Casares', title: 'Presidente do SP White', greeting: 'O Morumbi te espera de braços abertos. Temos um plano de carreira estruturado pronto para você liderar.', personality: 'diplomatic' },
  pab: { name: 'Alberto Guerra', title: 'Presidente do PA Blue', greeting: 'No Sul jogamos com raça, alma e técnica. Seu estilo guerreiro e decisivo é exatamente o que procuramos!', personality: 'demanding' },
  sbr: { name: 'Ferran Soriano', title: 'Presidente do Bahia Rays', greeting: 'A Fonte Nova vai explodir com os seus gols! Preparamos uma proposta de alto padrão para você vir agora.', personality: 'ambitious' },
  ftz: { name: 'Marcelo Paz', title: 'Presidente do Fortaleza Sol', greeting: 'Nosso clube é exemplo de gestão e ambição. Queremos você como nosso grande ídolo nesta temporada!', personality: 'diplomatic' },
  blm: { name: 'Fábio Bentes', title: 'Presidente do Belém Amazônia', greeting: 'A paixão do torcedor no Mangueirão não tem igual. Venha ser a estrela maior do nosso futebol!', personality: 'ambitious' },
  ctf: { name: 'Glenn Stenger', title: 'Presidente do CT Forest', greeting: 'Estruturamos nosso centro de treinamento para receber reforços de peso. O contrato está pronto na mesa.', personality: 'diplomatic' },
  bsc: { name: 'Godofredo Ramos', title: 'Presidente do Capital FC', greeting: 'A capital federal precisa de um artilheiro decisivo para erguer taças. Vamos fechar negócio hoje mesmo!', personality: 'ambitious' },
  rec: { name: 'Yuri Romão', title: 'Presidente do Recife Sharks', greeting: 'A Ilha ferve a cada rodada. Venha sentir o calor dessa torcida e comandar nosso ataque!', personality: 'demanding' },
  bhi: { name: 'Sérgio Coelho', title: 'Presidente do BH Iron', greeting: 'Nossa comissão técnica analisou seus lances e aprovou por unanimidade. A camisa 9 já tem seu nome.', personality: 'diplomatic' },
  goi: { name: 'Paulo Rogério', title: 'Presidente do Goiana Emeralds', greeting: 'Temos estabilidade financeira e estrutura de primeiro mundo. Seja o protagonista do nosso projeto!', personality: 'ambitious' },
};

export function createTransferOffer(
  club: OpponentTeam,
  heroOvr: number = 60,
  globalDayIndex: number = 1
): TransferOffer {
  const presidentInfo = CLUB_PRESIDENTS[club.id] || {
    name: `Dr. Armando Valente`,
    title: `Presidente do ${club.name}`,
    greeting: `Acompanhamos de perto suas atuações na temporada e queremos você no nosso elenco!`,
    personality: 'ambitious',
  };

  const baseSalary = 24000 + (heroOvr - 55) * 1800;
  const baseBonus = 80000 + (heroOvr - 55) * 6000;

  return {
    id: `offer_${club.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    club,
    presidentName: presidentInfo.name,
    presidentTitle: presidentInfo.title,
    salaryMonthly: Math.max(18000, Math.round(baseSalary / 1000) * 1000),
    contractYears: 3,
    signingBonus: Math.max(50000, Math.round(baseBonus / 5000) * 5000),
    goalBonus: 4000,
    status: 'PENDING',
    pitchMessage: presidentInfo.greeting,
    createdAtGlobalIndex: globalDayIndex,
  };
}

// Initial active transfer offer to start negotiations
export const INITIAL_TRANSFER_OFFERS: TransferOffer[] = [
  createTransferOffer(TACA_SAMBA_OPPONENTS[0], 60, 1), // SP White
];

