import type {
  PublicAuction,
  PublicLatestEvent,
  PublicResult,
  PublicRoomFeed,
  PublicTeam,
} from './contract'
import type { ScoreboardRoom } from '../model/scoreboard'

export class PublicFeedContractError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PublicFeedContractError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || isNumber(value)
}

function readLatestEvent(value: unknown): PublicLatestEvent | null {
  if (value === null) return null
  if (
    !isRecord(value) ||
    ![
      'room',
      'participant',
      'quiz',
      'auction',
      'bid',
      'sold',
      'results',
      'simulation',
    ].includes(String(value.type)) ||
    !isString(value.message) ||
    !isNumber(value.createdAt)
  ) {
    throw new PublicFeedContractError(
      'latestEvent does not match the public feed contract',
    )
  }
  return {
    type: value.type as PublicLatestEvent['type'],
    message: value.message,
    createdAt: value.createdAt,
  }
}

function readResult(value: unknown): PublicResult {
  if (
    !isRecord(value) ||
    !isNumber(value.rank) ||
    !isString(value.displayName) ||
    !isString(value.teamName) ||
    !isNumber(value.score)
  ) {
    throw new PublicFeedContractError(
      'result does not match the public feed contract',
    )
  }
  return {
    rank: value.rank,
    displayName: value.displayName,
    teamName: value.teamName,
    score: value.score,
  }
}

function readTeam(value: unknown): PublicTeam {
  if (
    !isRecord(value) ||
    !isString(value.displayName) ||
    !isString(value.teamName) ||
    !isNumber(value.squadSize) ||
    !isNumber(value.balance)
  ) {
    throw new PublicFeedContractError(
      'team does not match the public feed contract',
    )
  }
  return {
    displayName: value.displayName,
    teamName: value.teamName,
    squadSize: value.squadSize,
    balance: value.balance,
  }
}

function readAuction(value: unknown): PublicAuction | null {
  if (value === null) return null
  if (!isRecord(value) || !isRecord(value.player)) {
    throw new PublicFeedContractError(
      'currentAuction does not match the public feed contract',
    )
  }

  const player = value.player
  const leadingTeam = value.leadingTeam
  if (
    !isString(player.id) ||
    !isString(player.name) ||
    !isString(player.callSign) ||
    !['BAT', 'BOWL', 'AR', 'WK'].includes(String(player.role)) ||
    typeof player.overseas !== 'boolean' ||
    !isNumber(player.basePrice) ||
    !['idle', 'active', 'paused', 'sold', 'unsold'].includes(
      String(value.state),
    ) ||
    !isNullableNumber(value.endsAt) ||
    !isNullableNumber(value.pausedRemainingMs) ||
    !isNumber(value.highestBid) ||
    !(
      leadingTeam === null ||
      (isRecord(leadingTeam) &&
        isString(leadingTeam.displayName) &&
        isString(leadingTeam.teamName))
    )
  ) {
    throw new PublicFeedContractError(
      'currentAuction does not match the public feed contract',
    )
  }

  return {
    player: {
      id: player.id,
      name: player.name,
      callSign: player.callSign,
      role: player.role as PublicAuction['player']['role'],
      overseas: player.overseas,
      basePrice: player.basePrice,
    },
    state: value.state as PublicAuction['state'],
    endsAt: value.endsAt,
    pausedRemainingMs: value.pausedRemainingMs,
    highestBid: value.highestBid,
    leadingTeam:
      leadingTeam === null
        ? null
        : {
            displayName: leadingTeam.displayName as string,
            teamName: leadingTeam.teamName as string,
          },
  }
}

function readFeed(value: unknown): PublicRoomFeed {
  if (
    !isRecord(value) ||
    !isString(value.code) ||
    !isString(value.name) ||
    !['waiting', 'quiz', 'auction', 'results'].includes(String(value.phase)) ||
    !isNumber(value.version) ||
    !isNumber(value.serverTime) ||
    !Array.isArray(value.teams) ||
    !(value.results === null || Array.isArray(value.results))
  ) {
    throw new PublicFeedContractError(
      'feed does not match the public feed contract',
    )
  }

  return {
    code: value.code,
    name: value.name,
    phase: value.phase as PublicRoomFeed['phase'],
    version: value.version,
    serverTime: value.serverTime,
    currentAuction: readAuction(value.currentAuction),
    teams: value.teams.map(readTeam),
    latestEvent: readLatestEvent(value.latestEvent),
    results: value.results === null ? null : value.results.map(readResult),
  }
}

export type AdaptedPublicRoomFeedResponse =
  | { ok: true; room: ScoreboardRoom }
  | { ok: false; error: string }

export function adaptPublicRoomFeedResponse(
  payload: unknown,
): AdaptedPublicRoomFeedResponse {
  if (!isRecord(payload) || typeof payload.ok !== 'boolean') {
    throw new PublicFeedContractError(
      'response does not match the public feed contract',
    )
  }
  if (!payload.ok) {
    if (!isString(payload.error)) {
      throw new PublicFeedContractError(
        'error response does not match the public feed contract',
      )
    }
    return { ok: false, error: payload.error }
  }

  const feed = readFeed(payload.feed)
  return {
    ok: true,
    room: {
      roomCode: feed.code,
      name: feed.name,
      phase: feed.phase,
      version: feed.version,
      serverTime: feed.serverTime,
      auction: feed.currentAuction
        ? {
            playerId: feed.currentAuction.player.id,
            playerName: feed.currentAuction.player.name,
            playerCallSign: feed.currentAuction.player.callSign,
            playerRole: feed.currentAuction.player.role,
            overseas: feed.currentAuction.player.overseas,
            basePrice: feed.currentAuction.player.basePrice,
            state: feed.currentAuction.state,
            endsAt: feed.currentAuction.endsAt,
            pausedRemainingMs: feed.currentAuction.pausedRemainingMs,
            highestBid: feed.currentAuction.highestBid,
            leadingTeam: feed.currentAuction.leadingTeam,
          }
        : null,
      teams: feed.teams.map((team) => ({ ...team })),
      latestEvent: feed.latestEvent ? { ...feed.latestEvent } : null,
      results: feed.results?.map((result) => ({ ...result })) ?? null,
    },
  }
}
