function LiveUpdateCard({ connected }) {
  return (
    <section className={`live-update-card ${connected ? 'connected' : ''}`}>
      <div className="live-update-icon">)))</div>
      <div><strong>Real-time Updates <span>{connected ? 'Connected' : 'Connecting'}</span></strong><p>New trades appear here automatically when a pull completes.</p></div>
    </section>
  )
}

export default LiveUpdateCard
