// NOTE: ESPN logos may not render in PNG export on Safari due to CORS restrictions.
// The onError fallback (hiding the img) is the graceful degradation.

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
const espnAbbrev = pfr => PFR_TO_ESPN[pfr] || pfr;
const pfrAbbrev  = espn => ESPN_TO_PFR[espn] || espn;

const DRAFT_YEARS = Array.from({ length: 15 }, (_, i) => 2024 - i); // 2024..2010
const MODELS = ['parametric', 'knn', 'ridge'];
const MODEL_LABELS = { parametric: 'Parametric', knn: 'KNN', ridge: 'Ridge' };

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

function getPlayers(teamData, model) {
  if (!teamData) return [];
  if (teamData.models) return teamData.models[model]?.players || [];
  return teamData.players || [];
}

// Return the AV value for year index (0-3), using projected if observed is null.
const getAV = (player, yrIdx) => {
  const obs = player[`obs_yr${yrIdx}`];
  if (obs !== null && obs !== undefined) return obs;
  return player[`proj_yr${yrIdx}`] || 0;
};

const isYrProjected = (player, yrIdx) => {
  const obs = player[`obs_yr${yrIdx}`];
  return obs === null || obs === undefined;
};

// Returns [false, false, projYr2, projYr3] based on first player.
const getProjectedMask = players => {
  if (!players.length) return [false, false, false, false];
  const p = players[0];
  return [false, false, isYrProjected(p, 2), isYrProjected(p, 3)];
};

const surplusColor = surplus => TradeUtils.tradeColor(surplus, 25, 5);

// ---------------------------------------------------------------------------
// TeamSelector
// ---------------------------------------------------------------------------

function TeamSelector({ value, onChange, teamKeys }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  const espn = value ? espnAbbrev(value) : null;
  const selected = espn ? TradeUtils.NFL_TEAMS.find(t => t.abbrev === espn) : null;

  React.useEffect(() => {
    const handleClick = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Show only teams present in the loaded year's data; show all when no data yet.
  const teamsToShow = TradeUtils.NFL_TEAMS.filter(t =>
    !teamKeys?.length || teamKeys.includes(pfrAbbrev(t.abbrev))
  );

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
        {selected ? (
          <>
            <img
              src={TradeUtils.teamLogoUrl(selected.espn)}
              width={28} height={28}
              onError={e => { e.target.style.display = 'none'; }}
              alt={selected.abbrev}
            />
            <span>{selected.name}</span>
          </>
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
          {teamsToShow.map(team => {
            const pfr = pfrAbbrev(team.abbrev);
            return (
              <button
                key={team.abbrev}
                onClick={() => { onChange(pfr); setOpen(false); }}
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
                  onError={e => { e.target.style.display = 'none'; }}
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
      fontSize: 13, verticalAlign: 'middle',
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

  const knnPlayers   = showAllModels ? teamData?.models?.knn?.players   || [] : [];
  const ridgePlayers = showAllModels ? teamData?.models?.ridge?.players  || [] : [];

  const totalSurplus = players.reduce((s, p) => s + (p.surplus_av || 0), 0);
  const totalKnn     = knnPlayers.reduce((s, p) => s + (p.surplus_av || 0), 0);
  const totalRidge   = ridgePlayers.reduce((s, p) => s + (p.surplus_av || 0), 0);
  const totalAV      = players.reduce((s, p) => s + (p.total_4yr_av || 0), 0);
  const totalAVAR    = players.reduce((s, p) => s + (p.total_4yr_av_above_replacement || 0), 0);
  const totalEAVAR   = players.reduce((s, p) => s + (p.eavar || 0), 0);

  const thStyle = {
    padding: '10px 8px', textAlign: 'center', border: '1px solid #cbd5e0',
    fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap',
  };
  const tdStyle = {
    padding: '8px 8px', textAlign: 'center', border: '1px solid #e2e8f0',
    fontSize: 13, verticalAlign: 'middle',
  };

  return (
    <div style={{ overflowX: 'auto', marginTop: 16 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 820 }}>
        <thead>
          <tr style={{ background: '#e2e8f0', color: '#1a1a1a' }}>
            <th style={{ ...thStyle, width: 40 }}>Rnd</th>
            <th style={{ ...thStyle, width: 45 }}>Pick</th>
            <th style={{ ...thStyle, textAlign: 'left', minWidth: 130 }}>Player</th>
            <th style={{ ...thStyle, width: 42 }}>Pos</th>
            {[0, 1, 2, 3].map(i => (
              <th key={i} style={{ ...thStyle, width: 62, fontStyle: projMask[i] ? 'italic' : 'normal' }}>
                {draftYear + i}{projMask[i] ? '*' : ''}
              </th>
            ))}
            <th style={{ ...thStyle, width: 62 }}>4yr AV</th>
            <th style={{ ...thStyle, width: 70 }}>4yr AV AR</th>
            <th style={{ ...thStyle, width: 62 }}>EAVAR</th>
            {showAllModels ? (
              MODELS.map(m => (
                <th key={m} style={{ ...thStyle, width: 72 }}>
                  Surplus<br />({MODEL_LABELS[m]})
                </th>
              ))
            ) : (
              <th style={{ ...thStyle, width: 78 }}>Surplus AV</th>
            )}
          </tr>
        </thead>
        <tbody>
          {players.map((player, i) => {
            const rowBg = i % 2 === 0 ? '#ffffff' : '#f7fafc';
            const knnP   = knnPlayers[i];
            const ridgeP = ridgePlayers[i];
            return (
              <tr key={`${player.pick}-${i}`} style={{ background: rowBg }}>
                <td style={tdStyle}>{TradeUtils.roundFromOverall(player.pick).round}</td>
                <td style={tdStyle}>{player.pick}</td>
                <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 500 }}>{player.player}</td>
                <td style={tdStyle}>{player.pos}</td>
                {[0, 1, 2, 3].map(yi => {
                  const val  = getAV(player, yi);
                  const proj = projMask[yi] && isYrProjected(player, yi);
                  return (
                    <td key={yi} style={{
                      ...tdStyle,
                      fontStyle: proj ? 'italic' : 'normal',
                      color: proj ? '#718096' : '#1a1a1a',
                    }}>
                      {val != null ? val.toFixed(1) : '—'}
                      {proj && <span style={{ fontSize: 10, color: '#a0aec0' }}> p</span>}
                    </td>
                  );
                })}
                <td style={tdStyle}>{player.total_4yr_av?.toFixed(1) ?? '—'}</td>
                <td style={tdStyle}>{player.total_4yr_av_above_replacement?.toFixed(1) ?? '—'}</td>
                <td style={tdStyle}>{player.eavar?.toFixed(1) ?? '—'}</td>
                {showAllModels ? [
                  <SurplusCell key="p" surplus={player.surplus_av} />,
                  <SurplusCell key="k" surplus={knnP?.surplus_av ?? 0} />,
                  <SurplusCell key="r" surplus={ridgeP?.surplus_av ?? 0} />,
                ] : (
                  <SurplusCell surplus={player.surplus_av} />
                )}
              </tr>
            );
          })}
          {/* Totals row */}
          <tr style={{ background: '#edf2f7', fontWeight: 700, borderTop: '2px solid #cbd5e0' }}>
            <td colSpan={8} style={{
              ...tdStyle, textAlign: 'right', fontWeight: 700,
              border: '1px solid #cbd5e0', fontSize: 13,
            }}>
              Draft Class Total
            </td>
            <td style={{ ...tdStyle, fontWeight: 700 }}>{totalAV.toFixed(1)}</td>
            <td style={{ ...tdStyle, fontWeight: 700 }}>{totalAVAR.toFixed(1)}</td>
            <td style={{ ...tdStyle, fontWeight: 700 }}>{totalEAVAR.toFixed(1)}</td>
            {showAllModels ? [
              <SurplusCell key="pt" surplus={totalSurplus} />,
              <SurplusCell key="kt" surplus={totalKnn} />,
              <SurplusCell key="rt" surplus={totalRidge} />,
            ] : (
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
  if (!teamData || !players.length) return <div id={id} style={{ display: 'none' }} />;

  const espn     = espnAbbrev(teamKey);
  const teamInfo = TradeUtils.NFL_TEAMS.find(t => t.abbrev === espn);
  const gm       = teamData.gm || 'Unknown';

  return (
    <div id={id} style={{
      display: 'none', width: 1200, padding: 32,
      fontFamily: 'system-ui, sans-serif', background: '#ffffff',
    }}>
      {/* Header — matches trade-analysis ExportView style */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        marginBottom: 20, borderBottom: '2px solid #2d3748', paddingBottom: 16,
      }}>
        <img
          src={TradeUtils.teamLogoUrl(teamInfo?.espn || espn.toLowerCase())}
          width={64} height={64}
          onError={e => { e.target.style.display = 'none'; }}
          alt={espn}
        />
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#2d3748' }}>
            {teamInfo?.name || espn} — {draftYear} NFL Draft Class
          </div>
          <div style={{ fontSize: 14, color: '#718096', marginTop: 4 }}>
            GM: {gm}
            {!showAllModels && teamData.models && ` · Model: ${MODEL_LABELS[selectedModel]}`}
            {showAllModels && ' · All Projection Models'}
          </div>
        </div>
      </div>

      <DraftTable
        players={players}
        draftYear={draftYear}
        selectedModel={selectedModel}
        showAllModels={showAllModels}
        teamData={teamData}
      />

      <div style={{ textAlign: 'right', marginTop: 16, color: '#a0aec0', fontSize: 12 }}>
        cram9030.github.io
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main app
// ---------------------------------------------------------------------------

function DraftClassApp() {
  const [selectedTeam,  setSelectedTeam]  = React.useState(null);
  const [selectedYear,  setSelectedYear]  = React.useState(2024);
  const [selectedModel, setSelectedModel] = React.useState('parametric');
  const [draftData,     setDraftData]     = React.useState(null);
  const [isLoading,     setIsLoading]     = React.useState(true);
  const [error,         setError]         = React.useState(null);
  const [exporting,     setExporting]     = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    setError(null);
    setDraftData(null);
    const base = window.JEKYLL_BASEURL || '';
    fetch(`${base}/assets/data/baked/draft_${selectedYear}.json`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d  => { setDraftData(d); setIsLoading(false); })
      .catch(e => { setError(e.message); setIsLoading(false); });
  }, [selectedYear]);

  const teamKeys    = draftData ? Object.keys(draftData.teams) : [];
  const teamData    = (selectedTeam && draftData?.teams[selectedTeam]) || null;
  const hasModels   = !!(teamData?.models);
  const showAllModels = hasModels && selectedModel === 'all';
  // When showing all models use parametric as the base (observed fields are identical).
  const displayModel = hasModels ? (showAllModels ? 'parametric' : selectedModel) : 'parametric';
  const players = getPlayers(teamData, displayModel);

  const handleYearChange = y => {
    setSelectedYear(Number(y));
    setSelectedModel('parametric');
  };

  async function handleExport() {
    if (!players.length) return;
    setExporting(true);
    const el = document.getElementById('draft-class-export');
    el.style.display = 'block';
    await new Promise(r => setTimeout(r, 50));
    try {
      const canvas = await html2canvas(el, {
        width: 1200, scale: 1, backgroundColor: '#ffffff',
        useCORS: true, allowTaint: false, logging: false,
      });
      const link = document.createElement('a');
      link.download = `draft-class-${selectedTeam}-${selectedYear}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      el.style.display = 'none';
      setExporting(false);
    }
  }

  const espn     = selectedTeam ? espnAbbrev(selectedTeam) : null;
  const teamInfo = espn ? TradeUtils.NFL_TEAMS.find(t => t.abbrev === espn) : null;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 0' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 4 }}>
        NFL Draft Class Analyzer
      </h1>
      <p style={{ color: '#718096', marginBottom: 20 }}>
        Select a team and year to see their draft class scored by 4-year Approximate Value.
      </p>

      {/* Controls card — matches trade-analysis layout */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start',
        background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 8,
        padding: '16px', marginBottom: 24,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>Team</div>
          <TeamSelector value={selectedTeam} onChange={setSelectedTeam} teamKeys={teamKeys} />
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>Draft Year</div>
          <select
            value={selectedYear}
            onChange={e => handleYearChange(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: 6, fontSize: 14, background: 'white' }}
          >
            {DRAFT_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Projection model — only for partially-observed classes */}
        {hasModels && selectedTeam && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>Projection Model</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
              {[...MODELS, 'all'].map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="radio"
                    name="draft-model"
                    value={m}
                    checked={selectedModel === m}
                    onChange={() => setSelectedModel(m)}
                  />
                  {m === 'all' ? 'All Models' : MODEL_LABELS[m]}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {isLoading && <div className="draft-spinner" />}

      {error && !isLoading && (
        <div style={{
          padding: 16, borderRadius: 8,
          background: '#ebf8ff', border: '1px solid #4299e1', color: '#2b6cb0',
          marginBottom: 16,
        }}>
          <strong>Could not load data.</strong> {error}
        </div>
      )}

      {/* Team / GM header — shown once data is ready */}
      {!isLoading && !error && teamData && selectedTeam && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <img
            src={TradeUtils.teamLogoUrl(teamInfo?.espn || espn.toLowerCase())}
            width={40} height={40}
            onError={e => { e.target.style.display = 'none'; }}
            alt={espn}
          />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#2d3748' }}>
              {teamInfo?.name || espn} — {selectedYear} Draft Class
            </div>
            {teamData.gm && (
              <div style={{ fontSize: 13, color: '#718096' }}>GM: {teamData.gm}</div>
            )}
          </div>
        </div>
      )}

      {!isLoading && !error && !selectedTeam && (
        <div style={{ padding: 40, textAlign: 'center', color: '#718096', background: '#f7fafc', borderRadius: 8 }}>
          Select a team above to view their draft class.
        </div>
      )}

      {!isLoading && !error && selectedTeam && players.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: '#718096' }}>
          No draft data found for this team and year.
        </div>
      )}

      {!isLoading && !error && selectedTeam && players.length > 0 && (
        <DraftTable
          players={players}
          draftYear={selectedYear}
          selectedModel={selectedModel}
          showAllModels={showAllModels}
          teamData={teamData}
        />
      )}

      {/* Export button — outline style, below table, matching trade-analysis */}
      {players.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              padding: '8px 28px', background: 'white', border: '1px solid #007FBF',
              borderRadius: 6, color: '#007FBF', fontSize: 14,
              cursor: exporting ? 'not-allowed' : 'pointer',
              opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting ? 'Exporting…' : 'Export PNG'}
          </button>
        </div>
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

const root = ReactDOM.createRoot(document.getElementById('draft-class-root'));
root.render(<DraftClassApp />);
