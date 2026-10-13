const cards = [
  { label: 'Total trades', icon: '▥', value: (summary) => summary.total?.toLocaleString('en-IN') || '0', note: 'Trades in your ledger' },
  { label: 'Unique clients', icon: '♙', value: (summary) => summary.uniqueClients?.toLocaleString('en-IN') || '0', note: 'Clients represented' },
  { label: 'Symbols traded', icon: '↗', value: (summary) => summary.uniqueSymbols?.toLocaleString('en-IN') || '0', note: 'Different instruments' },
  { label: 'Total trade value', icon: '₹', value: (summary) => `₹ ${(Number(summary.tradeValue || 0) / 10000000).toFixed(2)} Cr`, note: 'Quantity × price' },
]

function TradeSummary({ summary }) {
  return (
    <section className="stats-grid" aria-label="Trade summary">
      {cards.map((card) => <article className="stat-card" key={card.label}>
        <div className="stat-icon">{card.icon}</div>
        <div className="stat-copy"><div className="stat-label">{card.label}</div><div className="stat-value">{card.value(summary)}</div><div className="stat-foot">{card.note}</div></div>
      </article>)}
    </section>
  )
}

export default TradeSummary
