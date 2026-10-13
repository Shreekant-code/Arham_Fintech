import { useEffect, useRef, useState } from 'react'
import DashboardHeader from '../components/DashboardHeader.jsx'
import DashboardHero from '../components/DashboardHero.jsx'
import LiveUpdateCard from '../components/LiveUpdateCard.jsx'
import PullControls from '../components/PullControls.jsx'
import PullStatus from '../components/PullStatus.jsx'
import TradeSummary from '../components/TradeSummary.jsx'
import TradesTable from '../components/TradesTable.jsx'
import { createPull, fetchTrades, subscribeToTrades } from '../services/tradesApi.js'
import './TradesDashboard.css'
import './responsive.css'

const emptySummary = { total: 0, uniqueClients: 0, uniqueSymbols: 0, symbols: [], tradeValue: 0 }
const delayLabel = (milliseconds) => milliseconds < 60000
  ? `${milliseconds / 1000} sec`
  : `${milliseconds / 60000} min`

function TradesDashboard() {
  const [trades, setTrades] = useState([])
  const [summary, setSummary] = useState(emptySummary)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [symbol, setSymbol] = useState('')
  const [batchSize, setBatchSize] = useState(100)
  const [delayMs, setDelayMs] = useState(300000)
  const [pulling, setPulling] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [connected, setConnected] = useState(false)
  const [pulls, setPulls] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const queryRef = useRef({ page, search, symbol })
  useEffect(() => { queryRef.current = { page, search, symbol } }, [page, search, symbol])

  const refreshTrades = async (query = queryRef.current) => {
    try {
      const result = await fetchTrades({ ...query, limit: 10 })
      setTrades(result.trades)
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setSummary({ ...emptySummary, ...(result.summary || {}) })
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const updatePull = (jobId, values) => {
    setPulls((current) => {
      const existing = current.find((pull) => pull.jobId === jobId) || {}
      const updated = { ...existing, ...values, jobId }
      if (values.status === 'queued' && existing.status && existing.status !== 'queued') updated.status = existing.status
      return [updated, ...current.filter((pull) => pull.jobId !== jobId)].slice(0, 5)
    })
  }

  useEffect(() => {
    const timer = setTimeout(() => refreshTrades({ page, search, symbol }), search ? 250 : 0)
    return () => clearTimeout(timer)
  }, [page, search, symbol])

  useEffect(() => subscribeToTrades({
    onConnection: setConnected,
    onTrades: (batch) => {
      updatePull(batch.jobId, { status: 'completed', insertedCount: batch.insertedCount, completedAt: new Date().toISOString() })
      setPulling(false)
      setMessage(`${batch.insertedCount} new trades arrived`)
      void refreshTrades()
    },
    onPull: (job) => {
      const update = { status: job.status }
      if (job.delayMs != null) update.delayMs = job.delayMs
      if (job.status === 'waiting') update.startedAt = new Date().toISOString()
      updatePull(job.jobId, update)
      if (job.status === 'processing') setMessage('Saving the new batch…')
      if (job.status === 'failed') {
        setPulling(false)
        setMessage(job.error || 'Pull failed')
      }
    },
  }), [])

  const handleCreatePull = async () => {
    setPulling(true)
    setMessage('Creating exchange pull…')
    try {
      const result = await createPull({ batchSize, delayMs })
      updatePull(result.jobId, {
        status: result.status,
        batchSize: result.batchSize,
        delayMs: result.delayMs,
        delayLabel: delayLabel(result.delayMs),
        startedAt: new Date().toISOString(),
      })
      setMessage('Pull request accepted. The dashboard will update when it completes.')
    } catch (error) {
      setPulling(false)
      setMessage(error.message)
    }
  }

  const handleSearch = (value) => { setSearch(value); setPage(1) }
  const handleSymbol = (value) => { setSymbol(value); setPage(1) }

  return (
    <main className="app-shell min-h-screen w-full">
      <DashboardHeader connected={connected} />
      <section className="main-content dashboard-content" id="dashboard">
        <div className="page-content">
          <div className="workspace-grid">
            <div className="dashboard-main">
              <DashboardHero />
              <TradeSummary summary={summary} />
              <TradesTable trades={trades} total={total} page={page} totalPages={totalPages} search={search} symbol={symbol} symbols={summary.symbols || []} loading={loading} onPageChange={setPage} onSearchChange={handleSearch} onSymbolChange={handleSymbol} />
            </div>
            <aside className="right-column">
              <PullControls batchSize={batchSize} delayMs={delayMs} pulling={pulling} message={message} onBatchSizeChange={setBatchSize} onDelayChange={setDelayMs} onCreatePull={handleCreatePull} />
              <PullStatus pulls={pulls} />
              <LiveUpdateCard connected={connected} />
            </aside>
          </div>
          <footer className="footer-note">Arham Fintech <span>·</span> Trade operations dashboard</footer>
        </div>
      </section>
    </main>
  )
}

export default TradesDashboard
