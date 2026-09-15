import { useCallback, useEffect, useState } from 'react'
import {
  fetchRoomFeed,
  isFixtureModeEnabled,
  isValidRoomCode,
  normalizeRoomCode,
} from './api/client'
import { ErrorBoundary } from './components/ErrorBoundary'
import { RoomEntry } from './components/RoomEntry'
import { Scoreboard } from './components/Scoreboard'
import { useRoomFeed, type RoomFeedFetcher } from './hooks/useRoomFeed'

function readRoomFromUrl() {
  const value = new URLSearchParams(window.location.search).get('room') ?? ''
  const normalized = normalizeRoomCode(value)
  return isValidRoomCode(normalized) ? normalized : ''
}

function updateRoomUrl(roomCode: string) {
  const url = new URL(window.location.href)
  if (roomCode) url.searchParams.set('room', roomCode)
  else url.searchParams.delete('room')
  window.history.pushState({}, '', url)
}

function getPollInterval() {
  const configured = Number(import.meta.env.VITE_CPL_POLL_INTERVAL_MS)
  return Number.isFinite(configured) && configured >= 1_000
    ? configured
    : 3_000
}

interface AppProps {
  fetcher?: RoomFeedFetcher
  pollingIntervalMs?: number
}

export default function App({
  fetcher = fetchRoomFeed,
  pollingIntervalMs = getPollInterval(),
}: AppProps) {
  const [roomCode, setRoomCode] = useState(readRoomFromUrl)

  useEffect(() => {
    const syncFromHistory = () => setRoomCode(readRoomFromUrl())
    window.addEventListener('popstate', syncFromHistory)
    return () => window.removeEventListener('popstate', syncFromHistory)
  }, [])

  const joinRoom = useCallback((nextRoomCode: string) => {
    updateRoomUrl(nextRoomCode)
    setRoomCode(nextRoomCode)
  }, [])

  const leaveRoom = useCallback(() => {
    updateRoomUrl('')
    setRoomCode('')
  }, [])

  const resetKey = `${roomCode}:${isFixtureModeEnabled()}`
  const fixtureMode = isFixtureModeEnabled()

  return (
    <ErrorBoundary resetKey={resetKey} onReset={leaveRoom}>
      {roomCode ? (
        <RoomView
          roomCode={roomCode}
          fetcher={fetcher}
          pollingIntervalMs={pollingIntervalMs}
          onLeave={leaveRoom}
        />
      ) : (
        <RoomEntry onJoin={joinRoom} fixtureMode={fixtureMode} />
      )}
    </ErrorBoundary>
  )
}

interface RoomViewProps {
  roomCode: string
  fetcher: RoomFeedFetcher
  pollingIntervalMs: number
  onLeave: () => void
}

function RoomView({
  roomCode,
  fetcher,
  pollingIntervalMs,
  onLeave,
}: RoomViewProps) {
  const state = useRoomFeed(roomCode, pollingIntervalMs, fetcher)

  if (state.status === 'loading') return <LoadingScoreboard roomCode={roomCode} />

  if (state.status === 'not-found') {
    return (
      <StatePage
        mark="?"
        title={`Room #${roomCode} was not found.`}
        message="Check the code on the public room display, then return to the room desk."
        actionLabel="Check another room"
        onAction={onLeave}
      />
    )
  }

  if (state.status === 'error') {
    return (
      <StatePage
        mark="×"
        title="The live desk did not answer."
        message={
          state.error?.message ??
          'The scoreboard could not load this room. Your room code is still saved.'
        }
        actionLabel="Retry room feed"
        onAction={state.retry}
        secondaryAction={{ label: 'Change room', onClick: onLeave }}
      />
    )
  }

  if (!state.room) return null

  return (
    <Scoreboard
      room={state.room}
      isRefreshing={state.isRefreshing}
      refreshError={state.error}
      onRetry={state.retry}
      onLeave={onLeave}
    />
  )
}

function LoadingScoreboard({ roomCode }: { roomCode: string }) {
  return (
    <main className="scoreboard scoreboard--loading" aria-busy="true">
      <header className="scoreboard__header">
        <div>
          <span className="skeleton skeleton--short" />
          <span className="skeleton skeleton--title" />
        </div>
        <p className="loading-copy">Opening room #{roomCode}…</p>
      </header>
      <div className="loading-ledger" aria-label="Loading room feed">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </main>
  )
}

interface StatePageProps {
  mark: string
  title: string
  message: string
  actionLabel: string
  onAction: () => void
  secondaryAction?: { label: string; onClick: () => void }
}

function StatePage({
  mark,
  title,
  message,
  actionLabel,
  onAction,
  secondaryAction,
}: StatePageProps) {
  return (
    <main className="state-page">
      <section className="state-sheet" aria-labelledby="state-title">
        <span className="state-mark" aria-hidden="true">
          {mark}
        </span>
        <h1 id="state-title">{title}</h1>
        <p>{message}</p>
        <div className="state-sheet__actions">
          <button className="button button--primary" onClick={onAction}>
            {actionLabel}
          </button>
          {secondaryAction && (
            <button className="button" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </button>
          )}
        </div>
      </section>
    </main>
  )
}
