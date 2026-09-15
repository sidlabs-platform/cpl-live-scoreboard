import {
  adaptPublicRoomFeedResponse,
  PublicFeedContractError,
} from './adapter'
import { getFixture } from './fixtures'
import type { ScoreboardRoom } from '../model/scoreboard'

export const ROOM_FEED_PATH = (roomCode: string) =>
  `/api/rooms/${encodeURIComponent(roomCode)}/public-feed`

export type FeedErrorCode =
  | 'fixture-error'
  | 'http-error'
  | 'producer-error'
  | 'invalid-response'
  | 'network-error'

export class FeedError extends Error {
  readonly code: FeedErrorCode
  readonly status?: number

  constructor(
    code: FeedErrorCode,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message, { cause: options?.cause })
    this.name = 'FeedError'
    this.code = code
    this.status = options?.status
  }
}

export type FeedLookup =
  | { kind: 'found'; room: ScoreboardRoom }
  | { kind: 'not-found' }

export interface FetchRoomOptions {
  signal?: AbortSignal
  fixtureMode?: boolean
  fetchImpl?: typeof fetch
}

export function normalizeRoomCode(value: string): string {
  return value.trim().toUpperCase()
}

export function isValidRoomCode(value: string): boolean {
  return /^[A-Z0-9]{4,10}$/.test(normalizeRoomCode(value))
}

export function isFixtureModeEnabled(
  search = typeof window === 'undefined' ? '' : window.location.search,
): boolean {
  const queryMode = new URLSearchParams(search).get('fixture')
  return (
    queryMode === '1' ||
    queryMode === 'true' ||
    import.meta.env.VITE_CPL_FIXTURE_MODE === 'true'
  )
}

export async function fetchRoomFeed(
  roomCode: string,
  options: FetchRoomOptions = {},
): Promise<FeedLookup> {
  const normalizedCode = normalizeRoomCode(roomCode)
  const fixtureMode = options.fixtureMode ?? isFixtureModeEnabled()

  if (fixtureMode) {
    if (normalizedCode === 'ERROR') {
      throw new FeedError(
        'fixture-error',
        'The fixture desk is unavailable. Retry when you are ready.',
      )
    }
    const fixture = getFixture(normalizedCode)
    if (!fixture) return { kind: 'not-found' }
    const adapted = adaptPublicRoomFeedResponse(fixture)
    if (!adapted.ok) {
      throw new FeedError('producer-error', adapted.error)
    }
    return { kind: 'found', room: adapted.room }
  }

  const fetchImpl = options.fetchImpl ?? fetch
  let response: Response
  try {
    response = await fetchImpl(ROOM_FEED_PATH(normalizedCode), {
      signal: options.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      credentials: 'omit',
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }
    throw new FeedError(
      'network-error',
      'The scoreboard could not reach the auction desk.',
      { cause: error },
    )
  }

  if (response.status === 404) return { kind: 'not-found' }

  let payload: unknown
  try {
    payload = await response.json()
  } catch (error) {
    throw new FeedError(
      'invalid-response',
      'The auction desk returned an unreadable room feed.',
      { status: response.status, cause: error },
    )
  }

  let adapted
  try {
    adapted = adaptPublicRoomFeedResponse(payload)
  } catch (error) {
    if (!(error instanceof PublicFeedContractError)) throw error
    throw new FeedError(
      'invalid-response',
      'The auction desk returned an unreadable room feed.',
      { status: response.status, cause: error },
    )
  }

  if (!adapted.ok) {
    throw new FeedError('producer-error', adapted.error, {
      status: response.status,
    })
  }
  if (!response.ok) {
    throw new FeedError(
      'http-error',
      `The auction desk returned HTTP ${response.status}.`,
      { status: response.status },
    )
  }

  return { kind: 'found', room: adapted.room }
}
