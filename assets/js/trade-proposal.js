// NOTE: ESPN logos may not render in PNG export on Safari due to CORS restrictions.
// The onError fallback (showing team abbreviation text) is the graceful degradation.

function TradeProposalApp() {
  const { CHART_PRESETS } = TradeUtils;

  const [leftPicks, setLeftPicks] = React.useState([{ round: 1, pickInRound: 1 }]);
  const [rightPicks, setRightPicks] = React.useState([{ round: 1, pickInRound: 1 }]);
  const [chartPreset, setChartPreset] = React.useState('default');
  const [results, setResults] = React.useState(null);
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

  function writtenPreview(picks, label) {
    const overalls = picksToOverall(picks);
    const formatted = overalls.map(TradeUtils.pickLabel).join(' + ');
    return `${label}: ${formatted}`;
  }

  // ---------------------------------------------------------------------------
  // Stub calculate handler (replaced in Phase 4)
  // ---------------------------------------------------------------------------

  async function handleCalculate() {
    setIsCalculating(true);
    await new Promise(r => setTimeout(r, 200));
    setResults({ stub: true });
    setIsCalculating(false);
  }

  // ---------------------------------------------------------------------------
  // Pick row component
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
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#e53e3e',
            fontSize: 16,
            padding: '2px 6px',
            visibility: canRemove ? 'visible' : 'hidden',
          }}
          title="Remove pick"
        >✕</button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Side panel (one column of the trade builder)
  // ---------------------------------------------------------------------------

  function SidePanel({ picks, side, label, bgColor }) {
    const overalls = picksToOverall(picks);
    const previewText = writtenPreview(picks, label.replace('← ', '').replace(' →', ''));

    return (
      <div style={{
        flex: 1,
        background: bgColor,
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: 16,
        minWidth: 0,
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 15, fontWeight: 600, color: '#2d3748' }}>{label}</h3>
        <p style={{
          fontSize: 12, color: '#4a5568', background: 'rgba(255,255,255,0.7)',
          borderRadius: 4, padding: '6px 8px', marginBottom: 12,
          wordBreak: 'break-word',
        }}>
          {previewText}
        </p>
        {picks.map((pick, i) => (
          <PickRow key={i} pick={pick} index={i} side={side} canRemove={picks.length > 1} />
        ))}
        <button
          onClick={() => addPick(side)}
          style={{
            marginTop: 8,
            padding: '6px 14px',
            background: 'white',
            border: '1px dashed #007FBF',
            borderRadius: 4,
            color: '#007FBF',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >＋ Add Pick</button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 0' }}>
      {/* Page header */}
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 4 }}>NFL Draft Trade Evaluator</h1>
      <p style={{ color: '#718096', marginBottom: 24 }}>Compare a proposed trade across multiple draft value charts.</p>

      {/* Chart Selection Panel */}
      <div style={{
        background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 8,
        padding: '12px 16px', marginBottom: 20,
      }}>
        <span style={{ fontWeight: 600, fontSize: 14, marginRight: 16 }}>Value Charts:</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', marginTop: 8 }}>
          {Object.entries(CHART_PRESETS).map(([key, preset]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="radio"
                name="chartPreset"
                value={key}
                checked={chartPreset === key}
                onChange={() => setChartPreset(key)}
              />
              {preset.label}
            </label>
          ))}
        </div>
      </div>

      {/* Trade Builder */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
      }}
        className="trade-builder"
      >
        <SidePanel picks={leftPicks} side="left" label="← Side A Receives" bgColor="#ebf8ff" />
        <SidePanel picks={rightPicks} side="right" label="Side B Receives →" bgColor="#fffbeb" />
      </div>

      {/* Responsive stacking */}
      <style>{`
        @media (max-width: 767px) {
          .trade-builder { flex-direction: column !important; }
        }
      `}</style>

      {/* Calculate button */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          style={{
            padding: '10px 40px',
            background: isCalculating ? '#a0aec0' : '#007FBF',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 16,
            fontWeight: 600,
            cursor: isCalculating ? 'not-allowed' : 'pointer',
            width: '100%',
            maxWidth: 320,
          }}
        >
          {isCalculating ? 'Calculating…' : 'Calculate'}
        </button>
      </div>

      {/* Results area */}
      {results !== null && (
        <div style={{ background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20 }}>
          <p style={{ color: '#4a5568' }}>Results will appear here.</p>
        </div>
      )}

      {/* Export button — hidden when no results */}
      <div style={{ textAlign: 'center', marginTop: 16, display: results === null ? 'none' : 'block' }}>
        <button
          style={{
            padding: '8px 28px',
            background: 'white',
            border: '1px solid #007FBF',
            borderRadius: 6,
            color: '#007FBF',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Export PNG
        </button>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('trade-proposal-root'));
root.render(<TradeProposalApp />);
