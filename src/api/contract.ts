export type PublicRoomPhase = 'waiting' | 'quiz' | 'auction' | 'results'
export type PublicPlayerRole = 'BAT' | 'BOWL' | 'AR' | 'WK'
export type PublicAuctionState = 'idle' | 'active' | 'paused' | 'sold' | 'unsold'
export type PublicEventType =
  | 'room'
  | 'participant'
  | 'quiz'
  | 'auction'
  | 'bid'
  | 'sold'
  | 'results'
  | 'simulation'

export interface PublicAuctionPlayer {
  id: string
  name: string
  callSign: string
  role: PublicPlayerRole
  overseas: boolean
  basePrice: number
}

export interface PublicAuction {
  player: PublicAuctionPlayer
  state: PublicAuctionState
  endsAt: number | null
  pausedRemainingMs: number | null
  highestBid: number
  leadingTeam: {
    displayName: string
    teamName: string
  } | null
}

export interface PublicTeam {
  displayName: string
  teamName: string
  squadSize: number
  balance: number
}

export interface PublicLatestEvent {
  type: PublicEventType
  message: string
  createdAt: number
}

export interface PublicResult {
  rank: number
  displayName: string
  teamName: string
  score: number
}

export interface PublicRoomFeed {
  code: string
  name: string
  phase: PublicRoomPhase
  version: number
  serverTime: number
  currentAuction: PublicAuction | null
  teams: PublicTeam[]
  latestEvent: PublicLatestEvent | null
  results: PublicResult[] | null
}

export type PublicRoomFeedResponse =
  | { ok: true; feed: PublicRoomFeed }
  | { ok: false; error: string }
