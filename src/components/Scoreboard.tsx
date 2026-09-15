import type { ScoreboardRoom } from '../model/scoreboard'

const number = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

const time = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function formatTime(value: number) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Time unavailable' : time.format(date)
}

function phaseLabel(phase: ScoreboardRoom['phase']) {
  if (phase === 'results') return 'Results published'
  if (phase === 'auction') return 'Auction live'
  if (phase === 'quiz') return 'Quiz in play'
  return 'Waiting room'
}

function playerRoleLabel(role: NonNullable<ScoreboardRoom['auction']>['playerRole']) {
  if (role === 'BAT') return 'Batter'
  if (role === 'BOWL') return 'Bowler'
  if (role === 'AR') return 'All-rounder'
  return 'Wicketkeeper'
}

function auctionClock(room: ScoreboardRoom) {
  const auction = room.auction
  if (!auction) return 'No live clock'
  if (auction.state === 'paused' && auction.pausedRemainingMs !== null) {
    return `${Math.max(0, Math.ceil(auction.pausedRemainingMs / 1_000))}s paused`
  }
  if (auction.endsAt !== null) {
    return `${Math.max(0, Math.ceil((auction.endsAt - room.serverTime) / 1_000))}s on clock`
  }
  return auction.state
}

interface ScoreboardProps {
  room: ScoreboardRoom
  isRefreshing: boolean
  refreshError: Error | null
  onRetry: () => void
  onLeave: () => void
}

export function Scoreboard({
  room,
  isRefreshing,
  refreshError,
  onRetry,
  onLeave,
}: ScoreboardProps) {
  const isEmpty = room.teams.length === 0

  return (
    <main className="scoreboard">
      <header className="scoreboard__header">
        <div>
          <button className="text-button" onClick={onLeave}>
            ← Change room
          </button>
          <h1>{room.name}</h1>
        </div>
        <dl className="room-register">
          <div>
            <dt>Room</dt>
            <dd>#{room.roomCode}</dd>
          </div>
          <div>
            <dt>State</dt>
            <dd>
              <span className={`phase phase--${room.phase}`}>
                {phaseLabel(room.phase)}
              </span>
            </dd>
          </div>
          <div>
            <dt>Feed</dt>
            <dd className={isRefreshing ? 'feed-state is-refreshing' : 'feed-state'}>
              {isRefreshing ? 'Checking…' : `v${room.version}`}
            </dd>
          </div>
        </dl>
      </header>

      {refreshError && (
        <div className="refresh-warning" role="alert">
          <span>
            Live refresh paused. The last confirmed score remains on screen.
          </span>
          <button className="text-button" onClick={onRetry}>
            Retry now
          </button>
        </div>
      )}

      {room.results ? (
        <ResultsBoard room={room} />
      ) : isEmpty ? (
        <EmptyBoard room={room} />
      ) : (
        <LiveBoard room={room} />
      )}

      <footer className="scoreboard__footer">
        <span>Last confirmed {formatTime(room.serverTime)}</span>
        <span>Read-only spectator feed</span>
      </footer>
    </main>
  )
}

function LiveBoard({ room }: { room: ScoreboardRoom }) {
  return (
    <div className="broadcast-grid">
      <section className="auction-board" aria-labelledby="auction-title">
        <div className="auction-board__topline">
          <h2 id="auction-title">
            {room.auction ? 'On the block' : 'Auction desk'}
          </h2>
          <span className="lot-state">
            {room.auction?.state ?? 'Awaiting next lot'}
          </span>
        </div>

        {room.auction ? (
          <>
            <div className="player-name">{room.auction.playerName}</div>
            <div className="bid-line">
              <div>
                <span className="data-label">Highest bid</span>
                <strong>
                  {number.format(room.auction.highestBid)}
                </strong>
              </div>
              <div>
                <span className="data-label">Paddle up</span>
                <strong>
                  {room.auction.leadingTeam?.teamName ?? 'No team yet'}
                </strong>
              </div>
            </div>
            <dl className="lot-register">
              <div>
                <dt>Call sign</dt>
                <dd>{room.auction.playerCallSign}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{playerRoleLabel(room.auction.playerRole)}</dd>
              </div>
              <div>
                <dt>Base</dt>
                <dd>{number.format(room.auction.basePrice)}</dd>
              </div>
              <div>
                <dt>Clock</dt>
                <dd>{auctionClock(room)}</dd>
              </div>
            </dl>
          </>
        ) : (
          <div className="auction-waiting">
            <span className="state-mark" aria-hidden="true">
              ·
            </span>
            <p>The auctioneer has not opened a player lot yet.</p>
          </div>
        )}
      </section>

      <StandingsTable room={room} />
      <LatestEvent room={room} />
    </div>
  )
}

function StandingsTable({ room }: { room: ScoreboardRoom }) {
  return (
    <section className="standings" aria-labelledby="standings-title">
      <h2 id="standings-title">Team register</h2>
      <div className="standings__head" aria-hidden="true">
        <span>Team</span>
        <span>XI</span>
        <span>Balance</span>
      </div>
      <ol>
        {room.teams.map((team, index) => (
          <li key={team.teamName}>
            <span className="standing-rank">{String(index + 1).padStart(2, '0')}</span>
            <strong>
              {team.teamName}
              <small>{team.displayName}</small>
            </strong>
            <span>{team.squadSize}</span>
            <span>{number.format(team.balance)}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function LatestEvent({ room }: { room: ScoreboardRoom }) {
  return (
    <section className="latest-event" aria-labelledby="latest-event-title">
      <h2 id="latest-event-title">Latest call</h2>
      {room.latestEvent ? (
        <>
          <p>{room.latestEvent.message}</p>
          <time dateTime={new Date(room.latestEvent.createdAt).toISOString()}>
            {formatTime(room.latestEvent.createdAt)}
          </time>
        </>
      ) : (
        <p className="muted">No calls have been recorded in this room.</p>
      )}
    </section>
  )
}

function EmptyBoard({ room }: { room: ScoreboardRoom }) {
  return (
    <section className="empty-board" aria-labelledby="empty-title">
      <span className="state-mark" aria-hidden="true">
        +
      </span>
      <div>
        <h2 id="empty-title">The team register is still open.</h2>
        <p>
          Room #{room.roomCode} is live, but no teams have joined the ledger.
          This page will update as soon as the auction desk records one.
        </p>
      </div>
    </section>
  )
}

function ResultsBoard({ room }: { room: ScoreboardRoom }) {
  const results = room.results
  if (!results) return null
  const winner = results.find((placement) => placement.rank === 1)

  return (
    <section className="results-board" aria-labelledby="results-title">
      <div className="results-board__winner">
        <span className="result-seal" aria-hidden="true">
          FINAL
        </span>
        <div>
          <h2 id="results-title">{winner?.teamName ?? 'Results published'}</h2>
          <p>Code Premier League champions</p>
        </div>
      </div>
      <ol className="results-list">
        {results
          .slice()
          .sort((a, b) => a.rank - b.rank)
          .map((placement) => (
            <li key={placement.teamName}>
              <span>{String(placement.rank).padStart(2, '0')}</span>
              <strong>
                {placement.teamName}
                <small>{placement.displayName}</small>
              </strong>
              <span>
                {number.format(placement.score)} ·{' '}
                {placement.rank === 1 ? 'WINNER' : 'PTS'}
              </span>
            </li>
          ))}
      </ol>
      <p className="results-board__published">Published feed v{room.version}</p>
    </section>
  )
}
