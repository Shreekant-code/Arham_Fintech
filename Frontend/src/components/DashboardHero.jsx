function DashboardHero() {
  return (
    <section className="dashboard-hero">
      <div className="hero-copy">
        <span className="market-badge"><i /> Live Market Data</span>
        <h1>Trade Dashboard</h1>
        <h2>Real-time trade data from BSE Exchange</h2>
        <p>View existing trades and pull new trades which can take up to 15 minutes.</p>
      </div>
      <div className="hero-art-placeholder" aria-label="BSE Exchange banner image can be added here">
        <svg className="hero-chart" viewBox="0 0 480 150" preserveAspectRatio="none" aria-hidden="true"><path d="M0 123 C45 122 37 84 83 98 S123 121 156 91 S205 108 243 62 S300 100 337 52 S391 82 420 29 S452 43 480 10" /><path d="M0 139 C55 130 55 115 95 122 S151 137 188 108 S230 127 270 84 S313 114 352 70 S401 97 434 48 S464 58 480 38" /></svg>
        <div className="hero-building building-one" /><div className="hero-building building-two" /><div className="hero-building building-three" />
        <span className="bse-badge">BSE</span>
      </div>
    </section>
  )
}

export default DashboardHero
