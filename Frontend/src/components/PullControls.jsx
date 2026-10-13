const delays = [
  { value: 0, label: '0 minutes' },
  { value: 60000, label: '1 minute' },
  { value: 180000, label: '3 minutes' },
  { value: 300000, label: '5 minutes' },
  { value: 600000, label: '10 minutes' },
  { value: 900000, label: '15 minutes' },
]

function PullControls({ batchSize, delayMs, pulling, message, onBatchSizeChange, onDelayChange, onCreatePull }) {
  return (
    <section className="pull-card" aria-label="Mock exchange pull">
      <div className="pull-copy"><div className="pull-icon">ϟ</div><div><h2>Create Pull</h2><p>Fetch new trades from BSE Exchange API.</p></div></div>
      <p className="pull-explanation">A full pull can take up to 15 minutes. The dashboard will remain open and show existing trades.</p>
      
      <div className="pull-controls">
        <label><span className="control-label-icon">◷</span><span>Delay (minutes)</span><select value={delayMs} onChange={(event) => onDelayChange(Number(event.target.value))}>{delays.map((delay) => <option key={delay.value} value={delay.value}>{delay.label.replace(' minutes', '').replace(' minute', '')}</option>)}</select><small>Set delay between 0 and 15 minutes.</small></label>
        <label><span className="control-label-icon">▱</span><span>Batch Size</span><select value={batchSize} onChange={(event) => onBatchSizeChange(Number(event.target.value))}><option value="50">50</option><option value="100">100</option><option value="250">250</option><option value="500">500</option></select><small>Number of trades to pull from exchange.</small></label>
        <button className="pull-button" onClick={onCreatePull} disabled={pulling}>
          {pulling ? <><span className="spinner" /> Pull in progress</> : <>Create pull <span>↗</span></>}
        </button>
      </div>
      {message && <div className="pull-message" role="status">{message}</div>}
    </section>
  )
}

export default PullControls
