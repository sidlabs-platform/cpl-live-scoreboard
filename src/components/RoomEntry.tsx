import { useState, type FormEvent } from 'react'
import { isValidRoomCode, normalizeRoomCode } from '../api/client'

interface RoomEntryProps {
  onJoin: (roomCode: string) => void
  fixtureMode: boolean
}

export function RoomEntry({ onJoin, fixtureMode }: RoomEntryProps) {
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedCode = normalizeRoomCode(roomCode)
    if (!isValidRoomCode(normalizedCode)) {
      setError('Use 4–10 letters or numbers from the room display.')
      return
    }
    setError('')
    onJoin(normalizedCode)
  }

  return (
    <main className="entry">
      <section className="entry__masthead" aria-labelledby="entry-title">
        <div className="entry__edition" aria-hidden="true">
          <span>CPL</span>
          <span>LIVE</span>
          <span>04</span>
        </div>
        <div className="entry__copy">
          <h1 id="entry-title">Keep the auction in frame.</h1>
          <p>
            Enter the public room code to follow every bid, balance, squad, and
            published result from a clean spectator view.
          </p>
        </div>
      </section>

      <form className="room-form" onSubmit={submit} noValidate>
        <label htmlFor="room-code">Public room code</label>
        <div className="room-form__line">
          <span className="room-form__prefix" aria-hidden="true">
            #
          </span>
          <input
            id="room-code"
            name="roomCode"
            value={roomCode}
            onChange={(event) => {
              setRoomCode(event.target.value.toUpperCase())
              if (error) setError('')
            }}
            placeholder="LIVE24"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            aria-describedby={error ? 'room-code-error' : 'room-code-help'}
            aria-invalid={Boolean(error)}
            autoFocus
          />
          <button className="button button--primary" type="submit">
            Open scoreboard
          </button>
        </div>
        {error ? (
          <p className="form-note form-note--error" id="room-code-error">
            {error}
          </p>
        ) : (
          <p className="form-note" id="room-code-help">
            {fixtureMode
              ? 'Fixture desk: LIVE24 · RESULTS · EMPTY · ERROR'
              : 'Use the code shown on the public room display.'}
          </p>
        )}
      </form>

      <footer className="entry__footer">
        <span>Read-only public feed</span>
        <span>Auto-refreshing room ledger</span>
      </footer>
    </main>
  )
}
