import { useEffect, useState } from 'react'

const dateTime = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
const countdown = (milliseconds) => {
  const seconds = Math.ceil(milliseconds / 1000)
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}

function PullStatus({ pulls }) {
  const [now, setNow] = useState(0)
  const hasWaitingPull = pulls.some((pull) => pull.status === 'waiting')

  useEffect(() => {
    if (!hasWaitingPull) return undefined
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [hasWaitingPull])

  return (
    <section className="status-card">
      <div className="status-heading"><span className="clock-icon">◷</span><h2>Pull status</h2><span className="status-count">{pulls.length}</span></div>
      {pulls.length === 0 ? <div className="no-pulls">Your pull activity will appear here.</div> : (
        <ol className="pull-list">
          {pulls.map((pull) => <li className={`pull-item ${pull.status}`} key={pull.jobId}>
            <span className="timeline-mark">{pull.status === 'completed' ? '✓' : pull.status === 'failed' ? '×' : '•'}</span>
            <div className="pull-item-body">
              <div className="pull-item-title"><strong>{pull.status === 'completed' ? 'Completed' : pull.status === 'failed' ? 'Failed' : pull.status === 'processing' ? 'Saving trades' : pull.status === 'queued' ? 'Queued' : 'Pull in progress'}</strong><span className={`state-pill ${pull.status}`}>{pull.status}</span></div>
              <div className="pull-job-id">#{pull.jobId.slice(0, 16)}</div>
              <div className="pull-detail"><span>Started</span><span>{dateTime(pull.startedAt)}</span></div>
              <div className="pull-detail"><span>Delay · batch</span><span>{pull.delayLabel} · {pull.batchSize} trades</span></div>
              {pull.status === 'queued' && <div className="pull-queue-note">Waiting for the current pull to finish…</div>}
              {pull.status === 'waiting' && (() => {
                const delayMs = Number(pull.delayMs) || 0
                const startedAt = pull.startedAt ? new Date(pull.startedAt).getTime() : now
                const currentTime = now || startedAt
                const remaining = Math.max(0, startedAt + delayMs - currentTime)
                const progress = delayMs ? Math.min(100, ((delayMs - remaining) / delayMs) * 100) : 100
                return <div className="pull-countdown" role="timer" aria-label={remaining ? `New trades expected in ${countdown(remaining)}` : 'Delay complete; waiting for the backend update'}>
                  <div className="pull-countdown-copy"><span>{remaining ? 'New trades in' : 'Delay complete · waiting for update'}</span><strong>{countdown(remaining)}</strong></div>
                  <div className="pull-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
                </div>
              })()}
              {pull.insertedCount != null && <div className="pull-detail"><span>Inserted</span><span>{pull.insertedCount} trades</span></div>}
              {pull.error && <div className="pull-error">{pull.error}</div>}
            </div>
          </li>)}
        </ol>
      )}
    </section>
  )
}

export default PullStatus
