import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { fetchRoomFeed, type FeedLookup } from './api/client'
import type { RoomFeedFetcher } from './hooks/useRoomFeed'

describe('scoreboard experience', () => {
  it('joins a fixture room and renders the active auction', async () => {
    const user = userEvent.setup()
    const active = await fetchRoomFeed('LIVE24', { fixtureMode: true })
    let resolveFeed: (value: FeedLookup) => void = () => undefined
    const pendingFeed = new Promise<FeedLookup>((resolve) => {
      resolveFeed = resolve
    })
    const fetcher = vi.fn<RoomFeedFetcher>(() => pendingFeed)

    render(<App fetcher={fetcher} pollingIntervalMs={60_000} />)

    await user.type(screen.getByLabelText(/public room code/i), 'live24')
    await user.click(screen.getByRole('button', { name: /open scoreboard/i }))

    expect(screen.getByText(/opening room #live24/i)).toBeInTheDocument()
    resolveFeed(active)
    expect(await screen.findByText('Aarav Mehta')).toBeInTheDocument()
    expect(screen.getAllByText('Runtime Royals')).not.toHaveLength(0)
    expect(window.location.search).toContain('room=LIVE24')
  })

  it('renders published results only when the feed includes them', async () => {
    window.history.replaceState({}, '', '/?room=RESULTS&fixture=1')
    const fetcher: RoomFeedFetcher = (roomCode) =>
      fetchRoomFeed(roomCode, { fixtureMode: true })

    render(<App fetcher={fetcher} pollingIntervalMs={60_000} />)

    expect(
      await screen.findByRole('heading', { name: 'Stack Strikers' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/champions/i)).toBeInTheDocument()
    expect(screen.getByText(/WINNER/)).toBeInTheDocument()
  })

  it('keeps stale room data visible after a recoverable refresh failure', async () => {
    window.history.replaceState({}, '', '/?room=LIVE24')
    const active = await fetchRoomFeed('LIVE24', { fixtureMode: true })
    let requestCount = 0
    const fetcher = vi.fn<RoomFeedFetcher>(async (): Promise<FeedLookup> => {
      requestCount += 1
      if (requestCount === 1) return active
      throw new Error('Temporary desk outage')
    })

    render(<App fetcher={fetcher} pollingIntervalMs={1_000} />)

    expect(await screen.findByText('Aarav Mehta')).toBeInTheDocument()
    await waitFor(
      () =>
        expect(
          screen.getByText(/last confirmed score remains on screen/i),
        ).toBeInTheDocument(),
      { timeout: 2_500 },
    )
    expect(screen.getByText('Aarav Mehta')).toBeInTheDocument()
  })

  it('offers an explicit retry after an initial client error', async () => {
    window.history.replaceState({}, '', '/?room=LIVE24')
    const active = await fetchRoomFeed('LIVE24', { fixtureMode: true })
    const fetcher = vi
      .fn<RoomFeedFetcher>()
      .mockRejectedValueOnce(new Error('Desk offline'))
      .mockResolvedValue(active)

    const user = userEvent.setup()
    render(<App fetcher={fetcher} pollingIntervalMs={60_000} />)

    expect(
      await screen.findByRole('heading', {
        name: /live desk did not answer/i,
      }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /retry room feed/i }))
    expect(await screen.findByText('Aarav Mehta')).toBeInTheDocument()
  })
})
