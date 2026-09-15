import type { PublicRoomFeedResponse } from './contract'

const activeRoom: PublicRoomFeedResponse = {
  ok: true,
  feed: {
    code: 'LIVE24',
    name: 'Code Premier League · Season 04',
    phase: 'auction',
    version: 42,
    serverTime: 1_789_531_938_000,
    currentAuction: {
      player: {
        id: 'player-01',
        name: 'Aarav Mehta',
        callSign: 'AM',
        role: 'BAT',
        overseas: false,
        basePrice: 500,
      },
      state: 'active',
      endsAt: 1_789_531_954_000,
      pausedRemainingMs: null,
      highestBid: 1_250,
      leadingTeam: {
        displayName: 'Maya',
        teamName: 'Runtime Royals',
      },
    },
    teams: [
      {
        displayName: 'Ishan',
        teamName: 'Boundary Breakers',
        squadSize: 8,
        balance: 2_850,
      },
      {
        displayName: 'Noor',
        teamName: 'Merge Mavericks',
        squadSize: 8,
        balance: 3_100,
      },
      {
        displayName: 'Maya',
        teamName: 'Runtime Royals',
        squadSize: 7,
        balance: 3_750,
      },
      {
        displayName: 'Theo',
        teamName: 'Stack Strikers',
        squadSize: 6,
        balance: 4_450,
      },
    ],
    latestEvent: {
      type: 'bid',
      message: 'Runtime Royals bid 1,250 DevLakh.',
      createdAt: 1_789_531_934_000,
    },
    results: null,
  },
}

const resultsRoom: PublicRoomFeedResponse = {
  ok: true,
  feed: {
    code: 'RESULTS',
    name: 'Code Premier League · Season 03',
    phase: 'results',
    version: 87,
    serverTime: 1_789_493_700_000,
    currentAuction: null,
    teams: [
      {
        displayName: 'Ishan',
        teamName: 'Boundary Breakers',
        squadSize: 10,
        balance: 775,
      },
      {
        displayName: 'Noor',
        teamName: 'Merge Mavericks',
        squadSize: 10,
        balance: 610,
      },
      {
        displayName: 'Maya',
        teamName: 'Runtime Royals',
        squadSize: 11,
        balance: 180,
      },
      {
        displayName: 'Theo',
        teamName: 'Stack Strikers',
        squadSize: 11,
        balance: 425,
      },
    ],
    latestEvent: {
      type: 'results',
      message: 'Final results were published by the auction desk.',
      createdAt: 1_789_493_688_000,
    },
    results: [
      {
        rank: 1,
        displayName: 'Theo',
        teamName: 'Stack Strikers',
        score: 118,
      },
      {
        rank: 2,
        displayName: 'Maya',
        teamName: 'Runtime Royals',
        score: 104,
      },
      {
        rank: 3,
        displayName: 'Noor',
        teamName: 'Merge Mavericks',
        score: 96,
      },
      {
        rank: 4,
        displayName: 'Ishan',
        teamName: 'Boundary Breakers',
        score: 89,
      },
    ],
  },
}

const emptyRoom: PublicRoomFeedResponse = {
  ok: true,
  feed: {
    code: 'EMPTY',
    name: 'Code Premier League · Practice Room',
    phase: 'waiting',
    version: 1,
    serverTime: 1_789_531_800_000,
    currentAuction: null,
    teams: [],
    latestEvent: null,
    results: null,
  },
}

const fixtures: Record<string, PublicRoomFeedResponse> = {
  LIVE24: activeRoom,
  RESULTS: resultsRoom,
  EMPTY: emptyRoom,
}

export function getFixture(roomCode: string): PublicRoomFeedResponse | null {
  return fixtures[roomCode] ?? null
}
