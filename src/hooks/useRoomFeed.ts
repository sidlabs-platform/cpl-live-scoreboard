import { useCallback, useEffect, useState } from 'react'
import {
  fetchRoomFeed,
  type FeedError,
  type FeedLookup,
} from '../api/client'
import type { ScoreboardRoom } from '../model/scoreboard'

export type RoomFeedFetcher = (
  roomCode: string,
  options?: { signal?: AbortSignal },
) => Promise<FeedLookup>

export interface RoomFeedState {
  status: 'loading' | 'ready' | 'not-found' | 'error'
  room: ScoreboardRoom | null
  error: FeedError | Error | null
  isRefreshing: boolean
}

const initialState: RoomFeedState = {
  status: 'loading',
  room: null,
  error: null,
  isRefreshing: false,
}

interface InternalRoomFeedState extends RoomFeedState {
  roomCode: string
}

export function useRoomFeed(
  roomCode: string,
  pollIntervalMs: number,
  fetcher: RoomFeedFetcher = fetchRoomFeed,
) {
  const [state, setState] = useState<InternalRoomFeedState>({
    ...initialState,
    roomCode,
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let stopped = false
    let inFlight = false
    let controller: AbortController | null = null

    const load = async (background: boolean) => {
      if (inFlight) return
      inFlight = true
      controller = new AbortController()

      if (background) {
        setState((current) =>
          current.roomCode === roomCode
            ? { ...current, isRefreshing: true }
            : current,
        )
      }

      try {
        const result = await fetcher(roomCode, { signal: controller.signal })
        if (stopped) return

        setState(
          result.kind === 'found'
            ? {
                status: 'ready',
                roomCode,
                room: result.room,
                error: null,
                isRefreshing: false,
              }
            : {
                status: 'not-found',
                roomCode,
                room: null,
                error: null,
                isRefreshing: false,
              },
        )
      } catch (error) {
        if (stopped || (error instanceof DOMException && error.name === 'AbortError')) {
          return
        }
        const resolvedError =
          error instanceof Error ? error : new Error('Unknown feed error')
        setState((current) =>
          current.roomCode === roomCode && current.room
            ? {
                ...current,
                status: 'ready',
                error: resolvedError,
                isRefreshing: false,
              }
            : {
                status: 'error',
                roomCode,
                room: null,
                error: resolvedError,
                isRefreshing: false,
              },
        )
      } finally {
        inFlight = false
      }
    }

    void load(false)
    const intervalId = window.setInterval(
      () => void load(true),
      pollIntervalMs,
    )

    return () => {
      stopped = true
      controller?.abort()
      window.clearInterval(intervalId)
    }
  }, [fetcher, pollIntervalMs, reloadKey, roomCode])

  const retry = useCallback(() => {
    setState((current) =>
      current.roomCode === roomCode && current.room
        ? { ...current, error: null, isRefreshing: true }
        : { ...initialState, roomCode },
    )
    setReloadKey((value) => value + 1)
  }, [roomCode])
  const visibleState =
    state.roomCode === roomCode ? state : { ...initialState, roomCode }

  return {
    status: visibleState.status,
    room: visibleState.room,
    error: visibleState.error,
    isRefreshing: visibleState.isRefreshing,
    retry,
  }
}
