import type {
  PublicAuctionState,
  PublicEventType,
  PublicPlayerRole,
  PublicRoomPhase,
} from '../api/contract'

export interface AuctionView {
  playerId: string
  playerName: string
  playerCallSign: string
  playerRole: PublicPlayerRole
  overseas: boolean
  basePrice: number
  state: PublicAuctionState
  endsAt: number | null
  pausedRemainingMs: number | null
  highestBid: number
  leadingTeam: {
    displayName: string
    teamName: string
  } | null
}

export interface TeamStandingView {
  displayName: string
  teamName: string
  squadSize: number
  balance: number
}

export interface LatestEventView {
  type: PublicEventType
  message: string
  createdAt: number
}

export interface ResultPlacementView {
  rank: number
  displayName: string
  teamName: string
  score: number
}

export interface ScoreboardRoom {
  roomCode: string
  name: string
  phase: PublicRoomPhase
  version: number
  serverTime: number
  auction: AuctionView | null
  teams: TeamStandingView[]
  latestEvent: LatestEventView | null
  results: ResultPlacementView[] | null
}
