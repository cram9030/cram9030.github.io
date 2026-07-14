// NOTE: ESPN logos may not render in PNG export on Safari due to CORS restrictions.
// The onError fallback (showing team abbreviation text) is the graceful degradation.

// ---------------------------------------------------------------------------
// Team Selector — custom dropdown with logos
// ---------------------------------------------------------------------------

function TeamSelector({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const selected = TradeUtils.NFL_TEAMS.find(t => t.abbrev === value);

  React.useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
          border: '1px solid #cbd5e0', borderRadius: 6, background: 'white',
          cursor: 'pointer', minWidth: 220, fontSize: 14,
        }}
      >
        {selected
          ? <>
              <img
                src={TradeUtils.teamLogoUrl(selected.espn)}
                width={28} height={28}
                onError={e => { e.target.style.display = 'none'; }}
                alt={selected.abbrev}
              />
              <span>{selected.name}</span>
            </>
          : <span style={{ color: '#718096' }}>Select a team…</span>
        }
        <span style={{ marginLeft: 'auto' }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', zIndex: 200, background: 'white',
          border: '1px solid #e2e8f0', borderRadius: 6, top: '110%', left: 0,
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          width: 'min(440px, 90vw)', maxHeight: 380, overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}>
          {TradeUtils.NFL_TEAMS.map(team => (
            <button
              key={team.abbrev}
              onClick={() => { onChange(team.abbrev); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px',
                background: value === team.abbrev ? '#ebf8ff' : 'white',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                borderBottom: '1px solid #f7fafc',
              }}
            >
              <img
                src={TradeUtils.teamLogoUrl(team.espn)}
                width={24} height={24}
                onError={e => { e.target.style.display = 'none'; }}
                alt={team.abbrev}
              />
              <span style={{ fontSize: 13 }}>{team.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------

function TradeAnalysisApp() {
  const { CHART_PRESETS, CHART_CONFIGS, BALDWIN_LEGEND, BALDWIN_SUBMETRIC_KEYS } = TradeUtils;

  const [selectedTeam, setSelectedTeam] = React.useState('');
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear() - 1);
  const [chartPreset, setChartPreset] = React.useState('default');
  const [trades, setTrades] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [availableYears, setAvailableYears] = React.useState([]);
  const [activeChartKeys, setActiveChartKeys] = React.useState(CHART_PRESETS['default'].charts);
  const chartDataRef = React.useRef({});

  React.useEffect(() => {
    const base = window.JEKYLL_BASEURL || '';
    fetch(`${base}/assets/data/trades/index.json`)
      .then(r => r.json())
      .then(data => {
        const years = [...data.available_years].sort((a, b) => b - a);
        setAvailableYears(years);
        if (years.length > 0) setSelectedYear(years[0]);
      })
      .catch(() => {});
  }, []);

  // ---------------------------------------------------------------------------
  // Analyze
  // ---------------------------------------------------------------------------

  async function handleAnalyze() {
    if (!selectedTeam) { alert('Please select a team.'); return; }
    setIsLoading(true);
    setError(null);
    setTrades(null);

    const preset = CHART_PRESETS[chartPreset].charts;

    try {
      const base = window.JEKYLL_BASEURL || '';
      const resp = await fetch(`${base}/assets/data/trades/${selectedYear}.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const yearData = await resp.json();

      const teamTrades = (yearData.teams || {})[selectedTeam];
      if (!teamTrades || teamTrades.length === 0) {
        setError(`No draft trade data found for ${selectedTeam} in ${selectedYear}. The team may not have made pick-for-pick trades that year, or data may not be available for that period.`);
        setIsLoading(false);
        return;
      }

      // Baldwin's APY*/OFV sub-metrics aren't independently selectable, but ride
      // along whenever 'baldwin' is part of the active preset (needed so the
      // totals row can look up equivalent picks for their summed net values).
      const subKeys = preset.includes('baldwin') ? BALDWIN_SUBMETRIC_KEYS : [];
      const chartDataMap = await TradeUtils.loadAllCharts([...preset, ...subKeys]);
      chartDataRef.current = chartDataMap;

      setActiveChartKeys(preset);
      setTrades(teamTrades);
    } catch (e) {
      setError(`Could not load data for ${selectedYear}. ${e.message}`);
    }
    setIsLoading(false);
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  async function handleExport() {
    const el = document.getElementById('trade-analysis-export');
    el.style.display = 'block';
    await new Promise(r => setTimeout(r, 50));
    const canvas = await html2canvas(el, {
      width: 1200, scale: 1, backgroundColor: '#ffffff',
      useCORS: true, allowTaint: false, logging: false,
    });
    el.style.display = 'none';
    const link = document.createElement('a');
    link.download = `trade-analysis-${selectedTeam}-${selectedYear}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function getScale(chartKey) {
    const data = chartDataRef.current[chartKey];
    if (!data) return { vMax: 1, vMin: 0 };
    return TradeUtils.getChartScale(data);
  }

  // Render a list of pick objects (or plain ints for backward compat)
  function PickListCell({ picks }) {
    if (!picks || picks.length === 0) return <span style={{ color: '#a0aec0' }}>—</span>;
    return (
      <span style={{ fontSize: 12, lineHeight: 1.7 }}>
        {picks.map((p, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {TradeUtils.pickLabelFromData(p)}
          </span>
        ))}
      </span>
    );
  }

  // Sub-line for the Baldwin cell's stacked APY*/OFV metrics.
  function BaldwinSubLine({ label, cv, suffix }) {
    if (!cv) return null;
    return (
      <div style={{ fontSize: 11, marginTop: 3, opacity: 0.85, borderTop: '1px solid currentColor', paddingTop: 2 }}>
        {label}: {cv.net > 0 ? '+' : ''}{cv.net.toFixed(2)}{suffix}
        {cv.equiv_picks && cv.equiv_picks.length > 0 && (
          <div style={{ marginTop: 1 }}>
            ≈ {cv.equiv_picks.map(TradeUtils.pickLabelWithOverall).join(' + ')}
          </div>
        )}
      </div>
    );
  }

  // Chart value cell — pick objects for actual picks, plain ints for equiv/excess
  function ChartCell({ chartKey, tradeData }) {
    const cv = tradeData.chart_values[chartKey];
    if (!cv) return <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#a0aec0' }}>—</td>;

    const { net, equiv_picks, excess, excess_picks } = cv;
    const scale = getScale(chartKey);
    const color = TradeUtils.tradeColor(net, scale.vMax, scale.vMin);

    return (
      <td style={{
        padding: '8px 10px', border: '1px solid #e2e8f0', textAlign: 'center',
        background: color.bg, color: color.text, verticalAlign: 'top',
      }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>
          {net > 0 ? '+' : ''}{net.toFixed(1)}
        </div>
        {equiv_picks && equiv_picks.length > 0 && (
          <div style={{ fontSize: 11, marginTop: 2, opacity: 0.9 }}>
            ≈ {equiv_picks.map(TradeUtils.pickLabelWithOverall).join(' + ')}
          </div>
        )}
        {excess > 0 && excess_picks && excess_picks.length > 0 && (
          <div style={{ fontSize: 11, marginTop: 1, opacity: 0.8 }}>
            excess: {excess_picks.map(TradeUtils.pickLabelWithOverall).join(' + ')}
          </div>
        )}
        {chartKey === 'baldwin' && (
          <React.Fragment>
            <BaldwinSubLine label="APY*" cv={tradeData.chart_values.baldwin_apy} suffix="%" />
            <BaldwinSubLine label="OFV" cv={tradeData.chart_values.baldwin_ofv} suffix="" />
          </React.Fragment>
        )}
      </td>
    );
  }

  // Sum a chart_values key across trades (used for the Baldwin APY*/OFV sub-lines, which
  // aren't independently selectable charts and so have no combo/equivalent-pick lookup).
  function sumChartKey(trades, key) {
    return trades.reduce((acc, trade) => {
      const cv = trade.chart_values[key];
      return acc + (cv ? cv.net : 0);
    }, 0);
  }

  // Sub-line for the Baldwin totals cell's stacked APY*/OFV sums (with equivalent picks).
  function BaldwinTotalSubLine({ label, total, suffix, first }) {
    if (!total) return null;
    const { sum, combo } = total;
    return (
      <div style={first
        ? { fontSize: 11, fontWeight: 400, marginTop: 3, opacity: 0.85, borderTop: '1px solid currentColor', paddingTop: 2 }
        : { fontSize: 11, fontWeight: 400, marginTop: 1, opacity: 0.85 }
      }>
        {label}: {sum > 0 ? '+' : ''}{sum.toFixed(2)}{suffix}
        {combo && combo.picks.length > 0 && (
          <div style={{ marginTop: 1 }}>
            ≈ {combo.picks.map(TradeUtils.pickLabelWithOverall).join(' + ')}
          </div>
        )}
      </div>
    );
  }

  // Totals row — sum net values + equivalent picks across all trades
  function TotalsRow({ trades, activeChartKeys }) {
    const totals = {};
    for (const chartKey of activeChartKeys) {
      const scale = getScale(chartKey);
      const chartData = chartDataRef.current[chartKey];
      const sum = trades.reduce((acc, trade) => {
        const cv = trade.chart_values[chartKey];
        return acc + (cv ? cv.net : 0);
      }, 0);
      const combo = chartData && Math.abs(sum) > 0
        ? TradeUtils.findPickComboWithExcess(Math.abs(sum), chartData)
        : null;
      totals[chartKey] = { sum, scale, combo };
    }
    function baldwinSubTotal(key) {
      if (!activeChartKeys.includes('baldwin')) return null;
      const sum = sumChartKey(trades, key);
      const chartData = chartDataRef.current[key];
      const combo = chartData && Math.abs(sum) > 0
        ? TradeUtils.findPickComboWithExcess(Math.abs(sum), chartData)
        : null;
      return { sum, combo };
    }
    const baldwinApyTotal = baldwinSubTotal('baldwin_apy');
    const baldwinOfvTotal = baldwinSubTotal('baldwin_ofv');

    return (
      <tr style={{ background: '#edf2f7', fontWeight: 700, borderTop: '2px solid #cbd5e0' }}>
        <td style={{ padding: '10px 10px', border: '1px solid #e2e8f0', fontSize: 13, color: '#2d3748' }}
            colSpan={3}>
          Total ({trades.length} trade{trades.length !== 1 ? 's' : ''})
        </td>
        {activeChartKeys.map(k => {
          const { sum, scale, combo } = totals[k];
          const color = TradeUtils.tradeColor(sum, scale.vMax, scale.vMin);
          return (
            <td key={k} style={{
              padding: '10px 10px', border: '1px solid #e2e8f0', textAlign: 'center',
              background: color.bg, color: color.text, verticalAlign: 'top',
            }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>
                {sum > 0 ? '+' : ''}{sum.toFixed(1)}
              </div>
              {combo && combo.picks.length > 0 && (
                <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2, opacity: 0.9 }}>
                  ≈ {combo.picks.map(TradeUtils.pickLabelWithOverall).join(' + ')}
                </div>
              )}
              {combo && combo.excessResult && (
                <div style={{ fontSize: 11, fontWeight: 400, marginTop: 1, opacity: 0.8 }}>
                  excess: {combo.excessResult.picks.map(TradeUtils.pickLabelWithOverall).join(' + ')}
                </div>
              )}
              {k === 'baldwin' && (
                <React.Fragment>
                  <BaldwinTotalSubLine label="APY*" total={baldwinApyTotal} suffix="%" first />
                  <BaldwinTotalSubLine label="OFV" total={baldwinOfvTotal} suffix="" />
                </React.Fragment>
              )}
            </td>
          );
        })}
      </tr>
    );
  }

  function ResultsTable() {
    if (!trades) return null;

    return (
      <div style={{ overflowX: 'auto', marginTop: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
          <thead>
            <tr style={{ background: '#e2e8f0', color: '#1a1a1a' }}>
              <th style={{ padding: '10px 10px', textAlign: 'left', border: '1px solid #cbd5e0', fontWeight: 700 }}>Traded With</th>
              <th style={{ padding: '10px 10px', textAlign: 'left', border: '1px solid #cbd5e0', fontWeight: 700 }}>Received</th>
              <th style={{ padding: '10px 10px', textAlign: 'left', border: '1px solid #cbd5e0', fontWeight: 700 }}>Gave</th>
              {activeChartKeys.map(k => (
                <th key={k} style={{ padding: '10px 10px', textAlign: 'center', border: '1px solid #cbd5e0', fontWeight: 700, whiteSpace: 'pre-line' }}>
                  {CHART_CONFIGS[k].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => {
              const tradedWithList = (trade.team_traded_with || '').split(',').map(s => s.trim()).filter(Boolean);
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#f7fafc' }}>
                  <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0' }}>
                    {tradedWithList.map(abbrev => {
                      const team = TradeUtils.getTeamByAbbrev(abbrev);
                      return (
                        <div key={abbrev} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          {team && (
                            <img
                              src={TradeUtils.teamLogoUrl(team.espn)}
                              width={20} height={20}
                              onError={e => { e.target.style.display = 'none'; }}
                              alt={abbrev}
                            />
                          )}
                          <span style={{ fontSize: 13 }}>{team ? team.name : abbrev}</span>
                        </div>
                      );
                    })}
                  </td>
                  <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0' }}>
                    <PickListCell picks={trade.picks_received} />
                  </td>
                  <td style={{ padding: '8px 10px', border: '1px solid #e2e8f0' }}>
                    <PickListCell picks={trade.picks_gave} />
                  </td>
                  {activeChartKeys.map(k => (
                    <ChartCell key={k} chartKey={k} tradeData={trade} />
                  ))}
                </tr>
              );
            })}
            <TotalsRow trades={trades} activeChartKeys={activeChartKeys} />
          </tbody>
        </table>
        {activeChartKeys.includes('baldwin') && (
          <div style={{ fontSize: 12, color: '#718096', marginTop: 8, fontStyle: 'italic' }}>
            {BALDWIN_LEGEND}
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Hidden export view
  // ---------------------------------------------------------------------------

  function ExportView() {
    if (!trades || !selectedTeam) return null;
    const team = TradeUtils.getTeamByAbbrev(selectedTeam);

    return (
      <div id="trade-analysis-export" style={{
        display: 'none', width: 1200, padding: 32,
        fontFamily: 'system-ui, sans-serif', background: '#ffffff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, borderBottom: '2px solid #2d3748', paddingBottom: 16 }}>
          {team && (
            <img
              src={TradeUtils.teamLogoUrl(team.espn)}
              width={64} height={64}
              onError={e => { e.target.style.display = 'none'; }}
              alt={selectedTeam}
            />
          )}
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#2d3748' }}>
              {team ? team.name : selectedTeam} — {selectedYear} Draft Trade History
            </div>
            <div style={{ fontSize: 14, color: '#718096', marginTop: 4 }}>
              {CHART_PRESETS[chartPreset].label}
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#e2e8f0', color: '#1a1a1a' }}>
              <th style={{ padding: '8px', border: '1px solid #cbd5e0', textAlign: 'left', fontWeight: 700 }}>Traded With</th>
              <th style={{ padding: '8px', border: '1px solid #cbd5e0', textAlign: 'left', fontWeight: 700 }}>Received</th>
              <th style={{ padding: '8px', border: '1px solid #cbd5e0', textAlign: 'left', fontWeight: 700 }}>Gave</th>
              {activeChartKeys.map(k => (
                <th key={k} style={{ padding: '8px', border: '1px solid #cbd5e0', textAlign: 'center', fontWeight: 700, whiteSpace: 'pre-line' }}>
                  {CHART_CONFIGS[k].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => {
              const tradedWithList = (trade.team_traded_with || '').split(',').map(s => s.trim()).filter(Boolean);
              return (
                <tr key={i} style={{ background: i % 2 === 0 ? '#ffffff' : '#f7fafc' }}>
                  <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                    {tradedWithList.map(abbrev => {
                      const t = TradeUtils.getTeamByAbbrev(abbrev);
                      return <div key={abbrev}>{t ? t.name : abbrev}</div>;
                    })}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0', fontSize: 11 }}>
                    {(trade.picks_received || []).map((p, j) => (
                      <div key={j}>{TradeUtils.pickLabelFromData(p)}</div>
                    ))}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0', fontSize: 11 }}>
                    {(trade.picks_gave || []).map((p, j) => (
                      <div key={j}>{TradeUtils.pickLabelFromData(p)}</div>
                    ))}
                  </td>
                  {activeChartKeys.map(k => {
                    const cv = trade.chart_values[k];
                    if (!cv) return <td key={k} style={{ padding: '6px 8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>—</td>;
                    const scale = getScale(k);
                    const color = TradeUtils.tradeColor(cv.net, scale.vMax, scale.vMin);
                    return (
                      <td key={k} style={{ padding: '6px 8px', border: '1px solid #e2e8f0', textAlign: 'center', background: color.bg, color: color.text, fontWeight: 600 }}>
                        {cv.net > 0 ? '+' : ''}{cv.net.toFixed(1)}
                        {cv.equiv_picks && cv.equiv_picks.length > 0 && (
                          <div style={{ fontSize: 10, fontWeight: 400 }}>
                            ≈ {cv.equiv_picks.map(TradeUtils.pickLabelWithOverall).join(' + ')}
                          </div>
                        )}
                        {k === 'baldwin' && (
                          <React.Fragment>
                            {trade.chart_values.baldwin_apy && (
                              <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, borderTop: '1px solid currentColor', paddingTop: 1 }}>
                                APY*: {trade.chart_values.baldwin_apy.net > 0 ? '+' : ''}{trade.chart_values.baldwin_apy.net.toFixed(2)}%
                                {trade.chart_values.baldwin_apy.equiv_picks && trade.chart_values.baldwin_apy.equiv_picks.length > 0 && (
                                  <div>≈ {trade.chart_values.baldwin_apy.equiv_picks.map(TradeUtils.pickLabelWithOverall).join(' + ')}</div>
                                )}
                              </div>
                            )}
                            {trade.chart_values.baldwin_ofv && (
                              <div style={{ fontSize: 10, fontWeight: 400 }}>
                                OFV: {trade.chart_values.baldwin_ofv.net > 0 ? '+' : ''}{trade.chart_values.baldwin_ofv.net.toFixed(2)}
                                {trade.chart_values.baldwin_ofv.equiv_picks && trade.chart_values.baldwin_ofv.equiv_picks.length > 0 && (
                                  <div>≈ {trade.chart_values.baldwin_ofv.equiv_picks.map(TradeUtils.pickLabelWithOverall).join(' + ')}</div>
                                )}
                              </div>
                            )}
                          </React.Fragment>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {/* Totals row in export */}
            <tr style={{ background: '#edf2f7', fontWeight: 700, borderTop: '2px solid #cbd5e0' }}>
              <td style={{ padding: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} colSpan={3}>
                Total ({trades.length} trades)
              </td>
              {activeChartKeys.map(k => {
                const sum = trades.reduce((acc, t) => acc + ((t.chart_values[k] || {}).net || 0), 0);
                const scale = getScale(k);
                const color = TradeUtils.tradeColor(sum, scale.vMax, scale.vMin);
                const chartData = chartDataRef.current[k];
                const combo = chartData && Math.abs(sum) > 0
                  ? TradeUtils.findPickComboWithExcess(Math.abs(sum), chartData)
                  : null;
                return (
                  <td key={k} style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', background: color.bg, color: color.text, verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 700, fontSize: 12 }}>{sum > 0 ? '+' : ''}{sum.toFixed(1)}</div>
                    {combo && combo.picks.length > 0 && (
                      <div style={{ fontSize: 10, fontWeight: 400, marginTop: 1 }}>
                        ≈ {combo.picks.map(TradeUtils.pickLabelWithOverall).join(' + ')}
                      </div>
                    )}
                    {combo && combo.excessResult && (
                      <div style={{ fontSize: 10, fontWeight: 400, marginTop: 1 }}>
                        excess: {combo.excessResult.picks.map(TradeUtils.pickLabelWithOverall).join(' + ')}
                      </div>
                    )}
                    {k === 'baldwin' && (() => {
                      const apySum = sumChartKey(trades, 'baldwin_apy');
                      const ofvSum = sumChartKey(trades, 'baldwin_ofv');
                      const apyData = chartDataRef.current.baldwin_apy;
                      const ofvData = chartDataRef.current.baldwin_ofv;
                      const apyCombo = apyData && Math.abs(apySum) > 0
                        ? TradeUtils.findPickComboWithExcess(Math.abs(apySum), apyData) : null;
                      const ofvCombo = ofvData && Math.abs(ofvSum) > 0
                        ? TradeUtils.findPickComboWithExcess(Math.abs(ofvSum), ofvData) : null;
                      return (
                        <React.Fragment>
                          <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2, borderTop: '1px solid currentColor', paddingTop: 1 }}>
                            APY*: {apySum > 0 ? '+' : ''}{apySum.toFixed(2)}%
                            {apyCombo && apyCombo.picks.length > 0 && (
                              <div>≈ {apyCombo.picks.map(TradeUtils.pickLabelWithOverall).join(' + ')}</div>
                            )}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 400 }}>
                            OFV: {ofvSum > 0 ? '+' : ''}{ofvSum.toFixed(2)}
                            {ofvCombo && ofvCombo.picks.length > 0 && (
                              <div>≈ {ofvCombo.picks.map(TradeUtils.pickLabelWithOverall).join(' + ')}</div>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })()}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>

        {activeChartKeys.includes('baldwin') && (
          <div style={{ fontSize: 11, color: '#718096', marginTop: 8, fontStyle: 'italic' }}>
            {BALDWIN_LEGEND}
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: 16, color: '#a0aec0', fontSize: 12 }}>
          cram9030.github.io
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 0' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 4 }}>NFL Team Trade History Analyzer</h1>
      <p style={{ color: '#718096', marginBottom: 20 }}>Select a team and year to see their draft pick trades evaluated across multiple value charts.</p>

      {/* Controls */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start',
        background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 8,
        padding: '16px', marginBottom: 24,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>Team</div>
          <TeamSelector value={selectedTeam} onChange={setSelectedTeam} />
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>Year</div>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: 6, fontSize: 14, background: 'white' }}
          >
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>Value Charts</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
            {Object.entries(CHART_PRESETS).map(([key, preset]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="radio" name="analysisChartPreset" value={key}
                  checked={chartPreset === key}
                  onChange={() => setChartPreset(key)}
                />
                {preset.label}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            style={{
              padding: '10px 28px', background: isLoading ? '#a0aec0' : '#007FBF',
              color: 'white', border: 'none', borderRadius: 6, fontSize: 15,
              fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Loading…' : 'Analyze'}
          </button>
        </div>
      </div>

      {isLoading && <div className="trade-spinner"></div>}

      {error && !isLoading && (
        <div style={{
          padding: '16px', borderRadius: 8,
          background: '#ebf8ff', border: '1px solid #4299e1', color: '#2b6cb0',
          marginBottom: 16,
        }}>
          <strong>No data found.</strong> {error}
          <div style={{ marginTop: 10 }}>
            <button
              onClick={handleAnalyze}
              style={{
                padding: '6px 16px', background: '#007FBF', color: 'white',
                border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13,
              }}
            >Retry</button>
          </div>
        </div>
      )}

      {trades && !isLoading && (
        <>
          <div style={{ fontSize: 14, color: '#4a5568', marginBottom: 8 }}>
            Showing <strong>{trades.length}</strong> trade{trades.length !== 1 ? 's' : ''} for{' '}
            <strong>{TradeUtils.getTeamByAbbrev(selectedTeam)?.name || selectedTeam}</strong> in{' '}
            <strong>{selectedYear}</strong>
          </div>
          <ResultsTable />
        </>
      )}

      {trades && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={handleExport}
            style={{
              padding: '8px 28px', background: 'white', border: '1px solid #007FBF',
              borderRadius: 6, color: '#007FBF', fontSize: 14, cursor: 'pointer',
            }}
          >
            Export PNG
          </button>
        </div>
      )}

      <ExportView />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('trade-analysis-root'));
root.render(<TradeAnalysisApp />);
