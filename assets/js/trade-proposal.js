// NOTE: ESPN logos may not render in PNG export on Safari due to CORS restrictions.
// The onError fallback (showing team abbreviation text) is the graceful degradation.

function TradeProposalApp() {
  const { CHART_PRESETS, CHART_CONFIGS } = TradeUtils;

  const [leftPicks, setLeftPicks] = React.useState([{ round: 1, pickInRound: 1 }]);
  const [rightPicks, setRightPicks] = React.useState([{ round: 1, pickInRound: 1 }]);
  const [chartPreset, setChartPreset] = React.useState('default');
  const [results, setResults] = React.useState(null);
  const [resultsMeta, setResultsMeta] = React.useState(null);
  const [isCalculating, setIsCalculating] = React.useState(false);

  // ---------------------------------------------------------------------------
  // Pick list helpers
  // ---------------------------------------------------------------------------

  function updatePick(side, index, field, value) {
    const setter = side === 'left' ? setLeftPicks : setRightPicks;
    setter(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: Number(value) };
      return next;
    });
  }

  function addPick(side) {
    const setter = side === 'left' ? setLeftPicks : setRightPicks;
    setter(prev => [...prev, { round: 1, pickInRound: 1 }]);
  }

  function removePick(side, index) {
    const setter = side === 'left' ? setLeftPicks : setRightPicks;
    setter(prev => prev.filter((_, i) => i !== index));
  }

  function picksToOverall(picks) {
    return picks.map(p => TradeUtils.overallPickFromRound(p.round, p.pickInRound));
  }

  // Written preview for the input panel header
  function writtenPreview(picks, sideLabel) {
    const overalls = picksToOverall(picks);
    const formatted = overalls.map(TradeUtils.pickLabel).join(' + ');
    return `${sideLabel} sends: ${formatted}`;
  }

  // ---------------------------------------------------------------------------
  // Calculation
  // Input: leftPicks = what Side A sends, rightPicks = what Side B sends
  // Side A receives = what Side B sends (rightPicks)
  // Net for Side A = value(B sends) - value(A sends)
  // ---------------------------------------------------------------------------

  async function handleCalculate() {
    setIsCalculating(true);
    try {
      const preset = CHART_PRESETS[chartPreset].charts;
      const chartDataMap = await TradeUtils.loadAllCharts(preset);

      // What each side gives away
      const aSendsOverall  = picksToOverall(leftPicks);
      const bSendsOverall  = picksToOverall(rightPicks);

      const computed = {};
      for (const chartKey of preset) {
        const data  = chartDataMap[chartKey];
        const scale = TradeUtils.getChartScale(data);

        function pickVal(overall) {
          const entry = data.find(d => d.pick === overall);
          return entry ? entry.value : 0;
        }

        // Side A sends these picks (= Side B receives)
        const aSendsTotal = aSendsOverall.reduce((s, p) => s + pickVal(p), 0);
        // Side B sends these picks (= Side A receives)
        const bSendsTotal = bSendsOverall.reduce((s, p) => s + pickVal(p), 0);

        // Net from Side A's perspective: positive = A got the better deal
        const net = bSendsTotal - aSendsTotal;

        computed[chartKey] = {
          sideAReceivesTotal: bSendsTotal,
          sideBReceivesTotal: aSendsTotal,
          net,
          netCombo: TradeUtils.findPickComboWithExcess(Math.abs(net), data),
          scale,
        };
      }

      setResults(computed);
      setResultsMeta({
        preset: chartPreset,
        presetCharts: preset,
        aSendsOverall,
        bSendsOverall,
      });
    } catch (err) {
      console.error('Calculation error:', err);
      alert('Error loading chart data. Please check your connection and try again.');
    }
    setIsCalculating(false);
  }

  // ---------------------------------------------------------------------------
  // PNG Export
  // ---------------------------------------------------------------------------

  async function handleExport() {
    const el = document.getElementById('trade-proposal-export');
    el.style.display = 'block';
    await new Promise(r => setTimeout(r, 50));
    const canvas = await html2canvas(el, {
      width: 1200,
      scale: 1,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: false,
      logging: false,
    });
    el.style.display = 'none';
    const link = document.createElement('a');
    link.download = `trade-proposal-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // ---------------------------------------------------------------------------
  // Pick row
  // ---------------------------------------------------------------------------

  function PickRow({ pick, index, side, canRemove }) {
    const overall = TradeUtils.overallPickFromRound(pick.round, pick.pickInRound);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#4a5568', minWidth: 48 }}>Pick {index + 1}:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <label style={{ fontSize: 12, color: '#718096' }}>Rd</label>
          <select
            value={pick.round}
            onChange={e => updatePick(side, index, 'round', e.target.value)}
            style={{ padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 13 }}
          >
            {[1,2,3,4,5,6,7].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <label style={{ fontSize: 12, color: '#718096' }}>Pk</label>
          <select
            value={pick.pickInRound}
            onChange={e => updatePick(side, index, 'pickInRound', e.target.value)}
            style={{ padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 13 }}
          >
            {Array.from({ length: 32 }, (_, i) => i + 1).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <span style={{ fontSize: 12, color: '#718096' }}>Overall: {overall}</span>
        <button
          onClick={() => removePick(side, index)}
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            cursor: 'pointer', color: '#e53e3e', fontSize: 16, padding: '2px 6px',
            visibility: canRemove ? 'visible' : 'hidden',
          }}
          title="Remove pick"
        >✕</button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Side panel (input — what each side sends)
  // ---------------------------------------------------------------------------

  function SidePanel({ picks, side, label, bgColor }) {
    const previewText = writtenPreview(picks, label);
    return (
      <div style={{ flex: 1, background: bgColor, border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, minWidth: 0 }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 15, fontWeight: 600, color: '#2d3748' }}>{label} Sends</h3>
        <p style={{
          fontSize: 12, color: '#4a5568', background: 'rgba(255,255,255,0.7)',
          borderRadius: 4, padding: '6px 8px', marginBottom: 12, wordBreak: 'break-word',
        }}>
          {previewText}
        </p>
        {picks.map((pick, i) => (
          <PickRow key={i} pick={pick} index={i} side={side} canRemove={picks.length > 1} />
        ))}
        <button
          onClick={() => addPick(side)}
          style={{
            marginTop: 8, padding: '6px 14px', background: 'white',
            border: '1px dashed #007FBF', borderRadius: 4, color: '#007FBF',
            cursor: 'pointer', fontSize: 13,
          }}
        >＋ Add Pick</button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Results table
  // ---------------------------------------------------------------------------

  // Render equiv picks with round.pickInRound (overall) format, joined by " + "
  function EquivPicksDisplay({ picks }) {
    if (!picks || picks.length === 0) return <span style={{ color: '#a0aec0' }}>—</span>;
    return (
      <span>
        {picks.map((p, i) => (
          <span key={i}>
            {i > 0 && <span style={{ color: '#718096' }}> + </span>}
            {TradeUtils.pickLabelWithOverall(p)}
          </span>
        ))}
      </span>
    );
  }

  function ChartResultCard({ chartKey, data }) {
    const { sideAReceivesTotal, sideBReceivesTotal, net, netCombo, scale } = data;
    const netColor = TradeUtils.tradeColor(net, scale.vMax, scale.vMin);
    const label = CHART_CONFIGS[chartKey].label;

    return (
      <div style={{ marginBottom: 20, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ background: '#2d3748', color: 'white', padding: '8px 14px', fontWeight: 600, fontSize: 14 }}>
          {label}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f7fafc' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', width: 160 }}></th>
                <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Side A Receives</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Side B Receives</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Net Value (Side A)</th>
              </tr>
            </thead>
            <tbody>
              {/* Total Value row */}
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#4a5568', borderBottom: '1px solid #f0f0f0' }}>Total Value</td>
                <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
                  {sideAReceivesTotal.toFixed(2)}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
                  {sideBReceivesTotal.toFixed(2)}
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', background: netColor.bg, color: netColor.text, fontWeight: 600 }}>
                  {net > 0 ? '+' : ''}{net.toFixed(2)}
                </td>
              </tr>
              {/* Equivalent Picks row — Net column only */}
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: '#4a5568', borderBottom: '1px solid #f0f0f0' }}>Equivalent Picks</td>
                <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', color: '#a0aec0' }}>—</td>
                <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', color: '#a0aec0' }}>—</td>
                <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', fontSize: 12, background: netColor.bg, color: netColor.text }}>
                  {net !== 0
                    ? <EquivPicksDisplay picks={netCombo.picks} />
                    : <span style={{ color: '#a0aec0' }}>—</span>
                  }
                </td>
              </tr>
              {/* Excess row — only when applicable */}
              {(netCombo && netCombo.excessResult) && (
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#4a5568' }}>Excess</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#a0aec0' }}>—</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#a0aec0' }}>—</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: 12, background: netColor.bg, color: netColor.text }}>
                    +{netCombo.excess.toFixed(1)} ≈ <EquivPicksDisplay picks={netCombo.excessResult.picks} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function ResultsSection() {
    if (!results || !resultsMeta) return null;
    const { presetCharts } = resultsMeta;

    const positiveCount = presetCharts.filter(k => results[k].net > 0).length;
    const negativeCount = presetCharts.filter(k => results[k].net < 0).length;
    const total = presetCharts.length;

    let consensusText, consensusBg, consensusColor;
    if (positiveCount > negativeCount) {
      consensusText = `Based on ${positiveCount}/${total} charts: Side A receives more value.`;
      consensusBg = '#f0fff4'; consensusColor = '#276749';
    } else if (negativeCount > positiveCount) {
      consensusText = `Based on ${negativeCount}/${total} charts: Side B receives more value.`;
      consensusBg = '#fff5f5'; consensusColor = '#9b2c2c';
    } else {
      consensusText = `Charts are split (${positiveCount}/${total} favor Side A) — roughly even trade.`;
      consensusBg = '#fffbeb'; consensusColor = '#744210';
    }

    return (
      <div>
        {presetCharts.map(k => (
          <ChartResultCard key={k} chartKey={k} data={results[k]} />
        ))}
        <div style={{
          padding: '12px 16px', borderRadius: 8, marginTop: 8,
          background: consensusBg, color: consensusColor,
          border: `1px solid ${consensusColor}40`, fontWeight: 600, fontSize: 14,
        }}>
          {consensusText}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Hidden export view
  // ---------------------------------------------------------------------------

  function ExportView() {
    if (!results || !resultsMeta) return null;
    const { presetCharts, aSendsOverall, bSendsOverall } = resultsMeta;
    const presetLabel = CHART_PRESETS[resultsMeta.preset].label;
    const ts = new Date().toLocaleDateString();

    return (
      <div id="trade-proposal-export" style={{
        display: 'none', width: 1200, padding: 32,
        fontFamily: 'system-ui, sans-serif', background: '#ffffff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '2px solid #2d3748', paddingBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#2d3748' }}>NFL Draft Trade Proposal</div>
            <div style={{ fontSize: 14, color: '#718096', marginTop: 4 }}>{presetLabel} • {ts}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 40, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#2b6cb0', marginBottom: 6, fontSize: 14 }}>Side A Sends:</div>
            {aSendsOverall.map((p, i) => (
              <div key={i} style={{ fontSize: 13, color: '#2d3748' }}>{TradeUtils.pickLabel(p)}</div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#c05621', marginBottom: 6, fontSize: 14 }}>Side B Sends:</div>
            {bSendsOverall.map((p, i) => (
              <div key={i} style={{ fontSize: 13, color: '#2d3748' }}>{TradeUtils.pickLabel(p)}</div>
            ))}
          </div>
        </div>

        {presetCharts.map(chartKey => {
          const d = results[chartKey];
          const netColor = TradeUtils.tradeColor(d.net, d.scale.vMax, d.scale.vMin);
          return (
            <div key={chartKey} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#2d3748', marginBottom: 4 }}>
                {CHART_CONFIGS[chartKey].label}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f7fafc' }}>
                    <th style={{ padding: '6px 10px', border: '1px solid #e2e8f0', textAlign: 'left' }}></th>
                    <th style={{ padding: '6px 10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>Side A Receives</th>
                    <th style={{ padding: '6px 10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>Side B Receives</th>
                    <th style={{ padding: '6px 10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>Net Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Total Value</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{d.sideAReceivesTotal.toFixed(2)}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>{d.sideBReceivesTotal.toFixed(2)}</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', textAlign: 'center', background: netColor.bg, color: netColor.text, fontWeight: 600 }}>
                      {d.net > 0 ? '+' : ''}{d.net.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', fontWeight: 600 }}>Equivalent Picks</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#a0aec0' }}>—</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#a0aec0' }}>—</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #e2e8f0', textAlign: 'center', fontSize: 12, background: netColor.bg, color: netColor.text }}>
                      {d.net !== 0
                        ? (d.netCombo.picks.map(TradeUtils.pickLabelWithOverall).join(' + ') || '—')
                        : '—'
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}

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
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 0' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 4 }}>NFL Draft Trade Evaluator</h1>
      <p style={{ color: '#718096', marginBottom: 24 }}>Enter what each side sends, then calculate to see who receives more value.</p>

      {/* Chart Selection Panel */}
      <div style={{ background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
        <span style={{ fontWeight: 600, fontSize: 14, marginRight: 16 }}>Value Charts:</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginTop: 8 }}>
          {Object.entries(CHART_PRESETS).map(([key, preset]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="radio" name="chartPreset" value={key}
                checked={chartPreset === key}
                onChange={() => setChartPreset(key)}
              />
              {preset.label}
            </label>
          ))}
        </div>
      </div>

      {/* Trade Builder — inputs labelled as what each side sends */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 16, marginBottom: 20 }} className="trade-builder">
        <SidePanel picks={leftPicks} side="left" label="Side A" bgColor="#ebf8ff" />
        <SidePanel picks={rightPicks} side="right" label="Side B" bgColor="#fffbeb" />
      </div>

      <style>{`@media (max-width: 767px) { .trade-builder { flex-direction: column !important; } }`}</style>

      {/* Calculate button */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          style={{
            padding: '10px 40px', background: isCalculating ? '#a0aec0' : '#007FBF',
            color: 'white', border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 600,
            cursor: isCalculating ? 'not-allowed' : 'pointer', width: '100%', maxWidth: 320,
          }}
        >
          {isCalculating ? 'Calculating…' : 'Calculate'}
        </button>
      </div>

      <ResultsSection />

      <div style={{ textAlign: 'center', marginTop: 20, display: results === null ? 'none' : 'block' }}>
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

      <ExportView />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('trade-proposal-root'));
root.render(<TradeProposalApp />);
