function DashboardHeader({ connected }) {
  const updated = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())

  return (
    <header className="topbar" id="top">
      <a className="brand" href="#top"><img className="brand-mark" src="/logo_fintech-.png" alt="Arham Fintech logo" /><span><strong>ARHAM</strong> <span className="brand-light">Fintech</span><small>Transforming Finance with Technology</small></span></a>
      <div className="topbar-info"><div className="connection"><i className={connected ? 'online' : ''} />{connected ? 'Live Updates Connected' : 'Connecting to live updates'}</div><div className="updated-time">Last updated: {updated}</div></div>
    </header>
  )
}

export default DashboardHeader
