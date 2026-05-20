// draft-class.js — NFL Draft Class Analyzer
// React JSX component, Babel-transpiled in browser.

// ---------------------------------------------------------------------------
// Constants & abbreviation helpers
// ---------------------------------------------------------------------------

// Baked JSON uses PFR abbreviations; TradeUtils uses ESPN/common codes.
const PFR_TO_ESPN = {
  GNB: 'GB', KAN: 'KC', LAR: 'LA', LVR: 'LV',
  NOR: 'NO', NWE: 'NE', SFO: 'SF', TAM: 'TB',
};
const ESPN_TO_PFR = Object.fromEntries(
  Object.entries(PFR_TO_ESPN).map(([k, v]) => [v, k])
);
function espnAbbrev(pfr) { return PFR_TO_ESPN[pfr] || pfr; }
function pfrAbbrev(espn) { return ESPN_TO_PFR[espn] || espn; }

const DRAFT_YEARS = Array.from({ length: 15 }, (_, i) => 2024 - i); // 2024..2010
const MODELS = ['parametric', 'knn', 'ridge'];
const MODEL_LABELS = { parametric: 'Parametric', knn: 'KNN', ridge: 'Ridge' };

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

function getPlayers(teamData, model) {
  if (!teamData) return [];
  if (teamData.models) return (teamData.models[model] && teamData.models[model].players) || [];
  return teamData.players || [];
}

// Return the AV value for year index (0-3), using projected if observed is null.
function getAV(player, yrIdx) {
  const obs = player['obs_yr' + yrIdx];
  if (obs !== null && obs !== undefined) return obs;
  return player['proj_yr' + yrIdx] || 0;
}

function isYrProjected(player, yrIdx) {
  const obs = player['obs_yr' + yrIdx];
  return obs === null || obs === undefined;
}

// Returns [false, false, projYr2, projYr3] based on first player.
function getProjectedMask(players) {
  if (!players.length) return [false, false, false, false];
  const p = players[0];
  return [false, false, isYrProjected(p, 2), isYrProjected(p, 3)];
}

function surplusColor(surplus) {
  return TradeUtils.tradeColor(surplus, 25, 5);
}

// ---------------------------------------------------------------------------
// TeamSelector
// ---------------------------------------------------------------------------

function TeamSelector({ value, onChange, teamKeys }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  const espn = value ? espnAbbrev(value) : null;
  const selected = espn ? TradeUtils.NFL_TEAMS.find(function(t) { return t.abbrev === espn; }) : null;

  React.useEffect(function() {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return function() { document.removeEventListener('mousedown', handleClick); };
  }, []);

  // Show only teams present in the loaded year's data; show all when no data yet.
  const teamsToShow = TradeUtils.NFL_TEAMS.filter(function(t) {
    if (!teamKeys || !teamKeys.length) return true;
    return teamKeys.indexOf(pfrAbbrev(t.abbrev)) !== -1;
  });

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={function() { setOpen(function(o) { return !o; }); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
          border: '1px solid #cbd5e0', borderRadius: 6, background: 'white',
          cursor: 'pointer', minWidth: 220, fontSize: 14,
        }}
      >
        {selected ? (
          <React.Fragment>
            <img
              src={TradeUtils.teamLogoUrl(selected.espn)}
              width={28} height={28}
              onError={function(e) { e.target.style.display = 'none'; }}
              alt={selected.abbrev}
            />
            <span>{selected.name}</span>
          </React.Fragment>
        ) : (
          <span style={{ color: '#718096' }}>Select a team…</span>
        )}
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
          {teamsToShow.map(function(team) {
            const pfr = pfrAbbrev(team.abbrev);
            return (
              <button
                key={team.abbrev}
                onClick={function() { onChange(pfr); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  background: value === pfr ? '#ebf8ff' : 'white',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderBottom: '1px solid #f7fafc',
                }}
              >
                <img
                  src={TradeUtils.teamLogoUrl(team.espn)}
                  width={24} height={24}
                  onError={function(e) { e.target.style.display = 'none'; }}
                  alt={team.abbrev}
                />
                <span style={{ fontSize: 13 }}>{team.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SurplusCell
// ---------------------------------------------------------------------------

function SurplusCell({ surplus }) {
  const c = surplusColor(surplus || 0);
  const val = surplus || 0;
  return (
    <td style={{
      padding: '6px 8px', textAlign: 'center', border: '1px solid #e2e8f0',
      fontSize: 12, verticalAlign: 'middle',
      background: c.bg, color: c.text, fontWeight: Math.abs(val) > 5 ? 600 : 400,
    }}>
      {val > 0 ? '+' : ''}{val.toFixed(1)}
    </td>
  );
}

// ---------------------------------------------------------------------------
// DraftTable — shared between interactive view and export view
// ---------------------------------------------------------------------------

function DraftTable({ players, draftYear, selectedModel, showAllModels, teamData }) {
  const projMask = getProjectedMask(players);
  const hasProjected = projMask[2] || projMask[3];

  const knnPlayers  = showAllModels && teamData && teamData.models ? (teamData.models.knn   && teamData.models.knn.players)   || [] : [];
  const ridgePlayers = showAllModels && teamData && teamData.models ? (teamData.models.ridge && teamData.models.ridge.players) || [] : [];

  const totalSurplus  = players.reduce(function(s, p)    { return s + (p.surplus_av || 0); }, 0);
  const totalKnn      = knnPlayers.reduce(function(s, p) { return s + (p.surplus_av || 0); }, 0);
  const totalRidge    = ridgePlayers.reduce(function(s, p) { return s + (p.surplus_av || 0); }, 0);
  const totalAV       = players.reduce(function(s, p) { return s + (p.total_4yr_av || 0); }, 0);
  const totalAVAR     = players.reduce(function(s, p) { return s + (p.total_4yr_av_above_replacement || 0); }, 0);
  const totalEAVAR    = players.reduce(function(s, p) { return s + (p.eavar || 0); }, 0);

  const thStyle = {
    padding: '8px 6px', textAlign: 'center', border: '1px solid #cbd5e0',
    background: '#e2e8f0', fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap',
  };
  const tdStyle = {
    padding: '6px 6px', textAlign: 'center', border: '1px solid #e2e8f0',
    fontSize: 12, verticalAlign: 'middle',
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
        <thead>
          <tr>
            <th style={Object.assign({}, thStyle, { width: 40 })}>Rnd</th>
            <th style={Object.assign({}, thStyle, { width: 45 })}>Pick</th>
            <th style={Object.assign({}, thStyle, { textAlign: 'left', minWidth: 130 })}>Player</th>
            <th style={Object.assign({}, thStyle, { width: 42 })}>Pos</th>
            {[0, 1, 2, 3].map(function(i) {
              const proj = projMask[i];
              return (
                <th key={i} style={Object.assign({}, thStyle, { width: 62, fontStyle: proj ? 'italic' : 'normal' })}>
                  {draftYear + i}{proj ? '*' : ''}
                </th>
              );
            })}
            <th style={Object.assign({}, thStyle, { width: 62 })}>4yr AV</th>
            <th style={Object.assign({}, thStyle, { width: 70 })}>4yr AV AR</th>
            <th style={Object.assign({}, thStyle, { width: 62 })}>EAVAR</th>
            {showAllModels ? (
              MODELS.map(function(m) {
                return (
                  <th key={m} style={Object.assign({}, thStyle, { width: 72 })}>
                    Surplus<br />({MODEL_LABELS[m]})
                  </th>
                );
              })
            ) : (
              <th style={Object.assign({}, thStyle, { width: 78 })}>Surplus AV</th>
            )}
          </tr>
        </thead>
        <tbody>
          {players.map(function(player, i) {
            const rowBg = i % 2 === 0 ? '#ffffff' : '#f7fafc';
            const knnP = knnPlayers[i];
            const ridgeP = ridgePlayers[i];
            return (
              <tr key={player.pick + '-' + i} style={{ background: rowBg }}>
                <td style={tdStyle}>{TradeUtils.roundFromOverall(player.pick)}</td>
                <td style={tdStyle}>{player.pick}</td>
                <td style={Object.assign({}, tdStyle, { textAlign: 'left', fontWeight: 500 })}>{player.player}</td>
                <td style={tdStyle}>{player.pos}</td>
                {[0, 1, 2, 3].map(function(yi) {
                  const val = getAV(player, yi);
                  const proj = projMask[yi] && isYrProjected(player, yi);
                  return (
                    <td key={yi} style={Object.assign({}, tdStyle, {
                      fontStyle: proj ? 'italic' : 'normal',
                      color: proj ? '#718096' : '#1a1a1a',
                    })}>
                      {(val !== null && val !== undefined) ? val.toFixed(1) : '—'}
                      {proj && <span style={{ fontSize: 10, color: '#a0aec0' }}> p</span>}
                    </td>
                  );
                })}
                <td style={tdStyle}>{player.total_4yr_av != null ? player.total_4yr_av.toFixed(1) : '—'}</td>
                <td style={tdStyle}>{player.total_4yr_av_above_replacement != null ? player.total_4yr_av_above_replacement.toFixed(1) : '—'}</td>
                <td style={tdStyle}>{player.eavar != null ? player.eavar.toFixed(1) : '—'}</td>
                {showAllModels ? (
                  [
                    <SurplusCell key="p" surplus={player.surplus_av} />,
                    <SurplusCell key="k" surplus={knnP ? knnP.surplus_av : 0} />,
                    <SurplusCell key="r" surplus={ridgeP ? ridgeP.surplus_av : 0} />,
                  ]
                ) : (
                  <SurplusCell surplus={player.surplus_av} />
                )}
              </tr>
            );
          })}
          {/* Totals row */}
          <tr style={{ background: '#edf2f7', borderTop: '2px solid #cbd5e0' }}>
            <td
              colSpan={8}
              style={Object.assign({}, tdStyle, {
                textAlign: 'right', fontWeight: 700, border: '1px solid #cbd5e0', fontSize: 12,
              })}
            >
              Draft Class Total
            </td>
            <td style={Object.assign({}, tdStyle, { fontWeight: 700 })}>{totalAV.toFixed(1)}</td>
            <td style={Object.assign({}, tdStyle, { fontWeight: 700 })}>{totalAVAR.toFixed(1)}</td>
            <td style={Object.assign({}, tdStyle, { fontWeight: 700 })}>{totalEAVAR.toFixed(1)}</td>
            {showAllModels ? (
              [
                <SurplusCell key="pt" surplus={totalSurplus} />,
                <SurplusCell key="kt" surplus={totalKnn} />,
                <SurplusCell key="rt" surplus={totalRidge} />,
              ]
            ) : (
              <SurplusCell surplus={totalSurplus} />
            )}
          </tr>
        </tbody>
      </table>
      {hasProjected && (
        <p style={{ fontSize: 11, color: '#718096', marginTop: 6, fontStyle: 'italic' }}>
          * Projected value — season not yet completed
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExportView — hidden 1200 px container rendered by html2canvas
// ---------------------------------------------------------------------------

function ExportView({ id, players, draftYear, selectedModel, showAllModels, teamData, teamKey }) {
  if (!teamData || !players.length) return React.createElement('div', { id: id, style: { display: 'none' } });

  const espn = espnAbbrev(teamKey);
  const teamInfo = TradeUtils.NFL_TEAMS.find(function(t) { return t.abbrev === espn; });
  const gm = teamData.gm || 'Unknown';

  return (
    <div id={id} style={{
      display: 'none', width: 1200, background: '#ffffff',
      padding: '24px 28px', fontFamily: 'system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, paddingBottom: 16, borderBottom: '2px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src={TradeUtils.teamLogoUrl((teamInfo && teamInfo.espn) || espn.toLowerCase())}
            width={56} height={56}
            onError={function(e) { e.target.style.display = 'none'; }}
            alt={espn}
          />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>
              {(teamInfo && teamInfo.name) || espn} — {draftYear} NFL Draft Class
            </div>
            <div style={{ fontSize: 14, color: '#4a5568', marginTop: 2 }}>GM: {gm}</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#718096', textAlign: 'right' }}>
          <div>4-Year Approximate Value Analysis</div>
          {showAllModels && <div>All Projection Models</div>}
          {!showAllModels && teamData.models && <div>Model: {MODEL_LABELS[selectedModel]}</div>}
        </div>
      </div>
      <DraftTable
        players={players}
        draftYear={draftYear}
        selectedModel={selectedModel}
        showAllModels={showAllModels}
        teamData={teamData}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main app
// ---------------------------------------------------------------------------

function DraftClassApp() {
  const [selectedTeam, setSelectedTeam] = React.useState(null);
  const [selectedYear, setSelectedYear] = React.useState(2024);
  const [selectedModel, setSelectedModel] = React.useState('parametric');
  const [draftData, setDraftData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [exporting, setExporting] = React.useState(false);

  React.useEffect(function() {
    setLoading(true);
    setError(null);
    setDraftData(null);
    const base = window.JEKYLL_BASEURL || '';
    fetch(base + '/assets/data/baked/draft_' + selectedYear + '.json')
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function(d) { setDraftData(d); setLoading(false); })
      .catch(function(e) { setError(e.message); setLoading(false); });
  }, [selectedYear]);

  const teamKeys  = draftData ? Object.keys(draftData.teams) : [];
  const teamData  = (selectedTeam && draftData && draftData.teams[selectedTeam]) || null;
  const hasModels = !!(teamData && teamData.models);
  const showAllModels = hasModels && selectedModel === 'all';
  // When showing all models use parametric as the base (observed fields are identical).
  const displayModel = hasModels ? (showAllModels ? 'parametric' : selectedModel) : 'parametric';
  const players = getPlayers(teamData, displayModel);

  function handleYearChange(y) {
    setSelectedYear(Number(y));
    setSelectedModel('parametric');
    // Keep selected team — it may not exist in the new year, DraftTable will show empty state.
  }

  async function handleExport() {
    if (!players.length) return;
    setExporting(true);
    const el = document.getElementById('draft-class-export');
    el.style.display = 'block';
    await new Promise(function(r) { setTimeout(r, 100); });
    try {
      const canvas = await html2canvas(el, {
        width: 1200, scale: 2, backgroundColor: '#ffffff',
        useCORS: true, allowTaint: false, logging: false,
      });
      const link = document.createElement('a');
      link.download = 'draft-class-' + selectedTeam + '-' + selectedYear + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      el.style.display = 'none';
      setExporting(false);
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 4, marginTop: 0 }}>
        NFL Draft Class Analyzer
      </h1>
      <p style={{ color: '#4a5568', fontSize: 14, marginBottom: 24, marginTop: 0 }}>
        Select a team and draft year to assess their draft class using 4-year Approximate Value metrics.
      </p>

      {/* Controls row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', marginBottom: 4, letterSpacing: '0.05em' }}>TEAM</div>
          <TeamSelector value={selectedTeam} onChange={setSelectedTeam} teamKeys={teamKeys} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', marginBottom: 4, letterSpacing: '0.05em' }}>DRAFT YEAR</div>
          <select
            value={selectedYear}
            onChange={function(e) { handleYearChange(e.target.value); }}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: 6, fontSize: 14, background: 'white' }}
          >
            {DRAFT_YEARS.map(function(y) { return <option key={y} value={y}>{y}</option>; })}
          </select>
        </div>
        {players.length > 0 && (
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              padding: '8px 20px', background: '#007FBF', color: 'white',
              border: 'none', borderRadius: 6, fontSize: 14,
              cursor: exporting ? 'not-allowed' : 'pointer',
              opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting ? 'Exporting…' : 'Export PNG'}
          </button>
        )}
      </div>

      {/* Projection model selector — only shown for partially-observed classes */}
      {hasModels && selectedTeam && (
        <div style={{
          marginBottom: 20, padding: '12px 16px', background: '#f7fafc',
          borderRadius: 8, border: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', letterSpacing: '0.05em', marginRight: 8 }}>
            PROJECTION MODEL
          </span>
          {MODELS.concat(['all']).map(function(m) {
            return (
              <label key={m} style={{ fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 4 }}>
                <input
                  type="radio"
                  name="draft-model"
                  value={m}
                  checked={selectedModel === m}
                  onChange={function() { setSelectedModel(m); }}
                />
                {m === 'all' ? 'All Models' : MODEL_LABELS[m]}
              </label>
            );
          })}
        </div>
      )}

      {/* Team / GM header */}
      {teamData && selectedTeam && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          {(function() {
            const espn = espnAbbrev(selectedTeam);
            const teamInfo = TradeUtils.NFL_TEAMS.find(function(t) { return t.abbrev === espn; });
            return (
              <React.Fragment>
                <img
                  src={TradeUtils.teamLogoUrl((teamInfo && teamInfo.espn) || espn.toLowerCase())}
                  width={40} height={40}
                  onError={function(e) { e.target.style.display = 'none'; }}
                  alt={espn}
                />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
                    {(teamInfo && teamInfo.name) || espn} — {selectedYear} Draft Class
                  </div>
                  {teamData.gm && (
                    <div style={{ fontSize: 13, color: '#4a5568' }}>GM: {teamData.gm}</div>
                  )}
                </div>
              </React.Fragment>
            );
          })()}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="draft-spinner" />
          <div style={{ color: '#718096', fontSize: 14, marginTop: 8 }}>Loading draft data…</div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={{ padding: 16, background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, color: '#c53030', fontSize: 14 }}>
          Error loading data: {error}
        </div>
      )}

      {/* Prompt to select team */}
      {!loading && !error && !selectedTeam && (
        <div style={{ padding: 40, textAlign: 'center', color: '#718096', background: '#f7fafc', borderRadius: 8, fontSize: 14 }}>
          Select a team above to view their draft class.
        </div>
      )}

      {/* No data for this team/year */}
      {!loading && !error && selectedTeam && players.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#718096', fontSize: 14 }}>
          No draft data found for this team and year.
        </div>
      )}

      {/* Draft table */}
      {!loading && !error && selectedTeam && players.length > 0 && (
        <DraftTable
          players={players}
          draftYear={selectedYear}
          selectedModel={selectedModel}
          showAllModels={showAllModels}
          teamData={teamData}
        />
      )}

      {/* Hidden export container */}
      <ExportView
        id="draft-class-export"
        players={players}
        draftYear={selectedYear}
        selectedModel={selectedModel}
        showAllModels={showAllModels}
        teamData={teamData}
        teamKey={selectedTeam}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

(function() {
  const rootEl = document.getElementById('draft-class-root');
  if (rootEl) {
    ReactDOM.createRoot(rootEl).render(<DraftClassApp />);
  }
})();
