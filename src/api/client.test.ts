import { describe, expect, it, vi } from 'vitest'
import {
  FeedError,
  ROOM_FEED_PATH,
  fetchRoomFeed,
  normalizeRoomCode,
} from './client'

describe('fetchRoomFeed', () => {
  it('normalizes and adapts the active fixture', async () => {
    const result = await fetchRoomFeed(' live24 ', { fixtureMode: true })

    expect(normalizeRoomCode(' live24 ')).toBe('LIVE24')
    expect(result.kind).toBe('found')
    if (result.kind === 'found') {
      expect(result.room.auction?.playerName).toBe('Aarav Mehta')
      expect(result.room.phase).toBe('auction')
    }
  })

  it('distinguishes an unknown room from an empty room', async () => {
    await expect(
      fetchRoomFeed('NOPE', { fixtureMode: true }),
    ).resolves.toEqual({ kind: 'not-found' })

    const empty = await fetchRoomFeed('EMPTY', { fixtureMode: true })
    expect(empty.kind).toBe('found')
    if (empty.kind === 'found') expect(empty.room.teams).toEqual([])
  })

  it('uses the provisional same-origin path for live requests', async () => {
    const controller = new AbortController()
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          feed: {
            code: 'CPL123',
            name: 'Friday Engineering Auction',
            phase: 'auction',
            version: 17,
            serverTime: 1_789_531_664_554,
            currentAuction: {
              player: {
                id: 'player-01',
                name: 'Demo Batter',
                callSign: 'DB',
                role: 'BAT',
                overseas: false,
                basePrice: 100,
              },
              state: 'active',
              endsAt: 1_789_531_680_000,
              pausedRemainingMs: null,
              highestBid: 350,
              leadingTeam: {
                displayName: 'Zara',
                teamName: 'Zulu XI',
              },
            },
            teams: [
              {
                displayName: 'Ada',
                teamName: 'Alpha XI',
                squadSize: 0,
                balance: 5_000,
              },
              {
                displayName: 'Zara',
                teamName: 'Zulu XI',
                squadSize: 1,
                balance: 4_700,
              },
            ],
            latestEvent: {
              type: 'bid',
              message: 'Zulu XI bid 350 DevLakh.',
              createdAt: 1_789_531_664_000,
            },
            results: null,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const result = await fetchRoomFeed('live24', {
      fixtureMode: false,
      fetchImpl,
      signal: controller.signal,
    })

    expect(fetchImpl).toHaveBeenCalledWith(ROOM_FEED_PATH('LIVE24'), {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      credentials: 'omit',
    })
    expect(result.kind).toBe('found')
    if (result.kind === 'found') {
      expect(result.room.roomCode).toBe('CPL123')
      expect(result.room.auction?.leadingTeam?.teamName).toBe('Zulu XI')
    }
  })

  it('surfaces invalid producer payloads explicitly', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true, feed: { code: 'LIVE24' } }), {
          status: 200,
        }),
      )

    await expect(
      fetchRoomFeed('LIVE24', { fixtureMode: false, fetchImpl }),
    ).rejects.toMatchObject<Partial<FeedError>>({
      code: 'invalid-response',
    })
  })
})
