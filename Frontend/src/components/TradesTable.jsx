const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const date = (value) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

function TradesTable({ trades = [], total = 0, page = 1, totalPages = 0, search = '', symbol = '', symbols = [], loading, onPageChange, onSearchChange, onSymbolChange }) {
  const first = total === 0 ? 0 : (page - 1) * 10 + 1
  const last = Math.min(page * 10, total)
  const firstPage = Math.max(1, Math.min(page - 1, totalPages - 2))
  const pages = Array.from({ length: Math.min(totalPages, 3) }, (_, index) => firstPage + index)

  return (
    <section className="table-card" id="trades">
      <div className="table-heading">
        <div><h2>Trades</h2><p>Latest trades pulled from BSE</p></div>
        <div className="table-tools">
          <label className="search-box"><span>⌕</span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search trade ID, client or symbol…" aria-label="Search trades" /></label>
          <label className="filter-box" title="Filter by symbol"><span>▽</span><select value={symbol} onChange={(event) => onSymbolChange(event.target.value)} aria-label="Filter by symbol"><option value="">All symbols</option>{symbols.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead><tr><th>#</th><th>TRADE ID</th><th>CLIENT</th><th>SYMBOL</th><th>QUANTITY</th><th className="align-right">PRICE (₹)</th><th className="align-right">VALUE (₹)</th><th>TIMESTAMP</th></tr></thead>
          <tbody>{trades.map((trade, index) => <tr key={trade.tradeId}>
            <td className="row-number">{(page - 1) * 10 + index + 1}</td>
            <td><span className="trade-id">{trade.tradeId}</span></td>
            <td><span className={`client-avatar avatar-${trade.client.charCodeAt(0) % 6}`}>{trade.client.charAt(0)}</span>{trade.client}</td>
            <td><span className={`symbol-chip symbol-${trade.symbol.charCodeAt(0) % 6}`}>{trade.symbol}</span></td>
            <td className="align-right numeric">{trade.quantity.toLocaleString('en-IN')}</td>
            <td className="align-right numeric">{money.format(trade.price)}</td>
            <td className="align-right numeric">{money.format(trade.quantity * trade.price)}</td>
            <td className="time-cell">{date(trade.timestamp)}</td>
          </tr>)}</tbody>
        </table>
        {!loading && trades.length === 0 && <div className="empty-state">No matching trades found.</div>}
        {loading && trades.length === 0 && <div className="empty-state">Loading trades…</div>}
      </div>
      <div className="table-footer">
        <span>Showing {first}–{last} of {total.toLocaleString('en-IN')} trades</span>
        <nav className="pagination" aria-label="Trade pages">
          <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">‹</button>
          {firstPage > 1 && <><button onClick={() => onPageChange(1)}>1</button><span>…</span></>}
          {pages.map((number) => <button className={number === page ? 'selected' : ''} onClick={() => onPageChange(number)} key={number}>{number}</button>)}
          {firstPage + pages.length <= totalPages - 1 && <><span>…</span><button onClick={() => onPageChange(totalPages)}>{totalPages}</button></>}
          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">›</button>
        </nav>
      </div>
    </section>
  )
}

export default TradesTable
