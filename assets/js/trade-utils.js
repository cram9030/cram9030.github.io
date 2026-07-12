/**
 * trade-utils.js — Shared utilities for NFL draft trade analysis tools.
 * Plain JavaScript (no JSX). Exposed on window.TradeUtils.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Team data
  // ---------------------------------------------------------------------------

  const NFL_TEAMS = [
    { abbrev: 'ARI', espn: 'ari', name: 'Arizona Cardinals' },
    { abbrev: 'ATL', espn: 'atl', name: 'Atlanta Falcons' },
    { abbrev: 'BAL', espn: 'bal', name: 'Baltimore Ravens' },
    { abbrev: 'BUF', espn: 'buf', name: 'Buffalo Bills' },
    { abbrev: 'CAR', espn: 'car', name: 'Carolina Panthers' },
    { abbrev: 'CHI', espn: 'chi', name: 'Chicago Bears' },
    { abbrev: 'CIN', espn: 'cin', name: 'Cincinnati Bengals' },
    { abbrev: 'CLE', espn: 'cle', name: 'Cleveland Browns' },
    { abbrev: 'DAL', espn: 'dal', name: 'Dallas Cowboys' },
    { abbrev: 'DEN', espn: 'den', name: 'Denver Broncos' },
    { abbrev: 'DET', espn: 'det', name: 'Detroit Lions' },
    { abbrev: 'GB',  espn: 'gb',  name: 'Green Bay Packers' },
    { abbrev: 'HOU', espn: 'hou', name: 'Houston Texans' },
    { abbrev: 'IND', espn: 'ind', name: 'Indianapolis Colts' },
    { abbrev: 'JAX', espn: 'jax', name: 'Jacksonville Jaguars' },
    { abbrev: 'KC',  espn: 'kc',  name: 'Kansas City Chiefs' },
    { abbrev: 'LA',  espn: 'lar', name: 'Los Angeles Rams' },
    { abbrev: 'LAC', espn: 'lac', name: 'Los Angeles Chargers' },
    { abbrev: 'LV',  espn: 'lv',  name: 'Las Vegas Raiders' },
    { abbrev: 'MIA', espn: 'mia', name: 'Miami Dolphins' },
    { abbrev: 'MIN', espn: 'min', name: 'Minnesota Vikings' },
    { abbrev: 'NE',  espn: 'ne',  name: 'New England Patriots' },
    { abbrev: 'NO',  espn: 'no',  name: 'New Orleans Saints' },
    { abbrev: 'NYG', espn: 'nyg', name: 'New York Giants' },
    { abbrev: 'NYJ', espn: 'nyj', name: 'New York Jets' },
    { abbrev: 'PHI', espn: 'phi', name: 'Philadelphia Eagles' },
    { abbrev: 'PIT', espn: 'pit', name: 'Pittsburgh Steelers' },
    { abbrev: 'SEA', espn: 'sea', name: 'Seattle Seahawks' },
    { abbrev: 'SF',  espn: 'sf',  name: 'San Francisco 49ers' },
    { abbrev: 'TB',  espn: 'tb',  name: 'Tampa Bay Buccaneers' },
    { abbrev: 'TEN', espn: 'ten', name: 'Tennessee Titans' },
    { abbrev: 'WAS', espn: 'was', name: 'Washington Commanders' },
  ];

  // ---------------------------------------------------------------------------
  // Chart configuration
  // ---------------------------------------------------------------------------

  const CHART_CONFIGS = {
    rich_hill:              { label: 'Rich Hill',              file: 'rich_hill' },
    fitzgerald_spielberger: { label: 'Fitzgerald-Spielberger', file: 'fitzgerald_spielberger' },
    eavar:                  { label: 'Expected AV\nAbove Replacement\n(EAVAR)', file: 'eavar' },
    jimmy_johnson:          { label: 'Jimmy Johnson',          file: 'jimmy_johnson' },
    pff_war:                { label: 'PFF WAR',                file: 'pff_war' },
    baldwin:                { label: 'Ben Baldwin (BB)\nPoints / APY* / OFV', file: 'baldwin' },
  };

  const CHART_PRESETS = {
    default:        { label: 'Default (RH + FS + eAVAR + BB)', charts: ['rich_hill', 'fitzgerald_spielberger', 'eavar', 'baldwin'] },
    advanced:       { label: 'All 6 Charts',                  charts: ['rich_hill', 'fitzgerald_spielberger', 'eavar', 'jimmy_johnson', 'pff_war', 'baldwin'] },
    rich_hill_only: { label: 'Rich Hill Only',                charts: ['rich_hill'] },
    fitz_only:      { label: 'Fitzgerald-Spielberger Only',   charts: ['fitzgerald_spielberger'] },
    eavar_only:     { label: 'eAVAR Only',                    charts: ['eavar'] },
    baldwin_only:   { label: 'Ben Baldwin (OSF) Only',        charts: ['baldwin'] },
  };

  // Legend text for the Ben Baldwin column's split-metric abbreviations.
  const BALDWIN_LEGEND = '*APY = Average Per Year as a percent of salary cap. OFV = On-Field Value.';

  // ---------------------------------------------------------------------------
  // Pick number utilities
  // ---------------------------------------------------------------------------

  function overallPickFromRound(round, pickInRound) {
    return (round - 1) * 32 + pickInRound;
  }

  function roundFromOverall(overall) {
    // Cap at round 7: compensatory picks extend round 7 beyond 32 slots
    // rather than creating an 8th round that doesn't exist in the NFL draft.
    if (overall <= 192) {
      const round = Math.ceil(overall / 32);
      const pickInRound = overall - (round - 1) * 32;
      return { round, pickInRound };
    }
    return { round: 7, pickInRound: overall - 192 };
  }

  function pickLabel(overall) {
    const { round, pickInRound } = roundFromOverall(overall);
    return `Rd ${round}, Pk ${pickInRound} (Overall: ${overall})`;
  }

  // Returns "R.P (Overall)" e.g. "2.14 (46)" — used in equivalent picks display
  function pickLabelWithOverall(overall) {
    const { round, pickInRound } = roundFromOverall(overall);
    return `${round}.${pickInRound} (${overall})`;
  }

  function pickLabelShort(overall) {
    const { round, pickInRound } = roundFromOverall(overall);
    return `${round}.${pickInRound}`;
  }

  function formatPickList(overallPicks) {
    return overallPicks.map(pickLabel).join(' + ');
  }

  // ---------------------------------------------------------------------------
  // Team helpers
  // ---------------------------------------------------------------------------

  function teamLogoUrl(espnAbbrev) {
    return `https://a.espncdn.com/i/teamlogos/nfl/500/${espnAbbrev}.png`;
  }

  function getTeamByAbbrev(abbrev) {
    return NFL_TEAMS.find(t => t.abbrev === abbrev) || null;
  }

  // ---------------------------------------------------------------------------
  // Chart data loading (in-memory cache)
  // ---------------------------------------------------------------------------

  const _chartCache = {};

  async function loadChartData(chartKey) {
    if (_chartCache[chartKey]) return _chartCache[chartKey];
    const config = CHART_CONFIGS[chartKey];
    if (!config) throw new Error(`Unknown chart key: ${chartKey}`);
    const base = (window.JEKYLL_BASEURL || '');
    const resp = await fetch(`${base}/assets/data/charts/${config.file}.json`);
    if (!resp.ok) throw new Error(`Failed to load chart ${chartKey}: ${resp.status}`);
    const data = await resp.json();
    _chartCache[chartKey] = data;
    return data;
  }

  async function loadAllCharts(chartKeys) {
    const results = await Promise.all(chartKeys.map(k => loadChartData(k)));
    return Object.fromEntries(chartKeys.map((k, i) => [k, results[i]]));
  }

  function getChartScale(chartData) {
    const byPick = [...chartData].sort((a, b) => a.pick - b.pick);
    return { vMax: byPick[0].value, vMin: byPick[byPick.length - 1].value };
  }

  // ---------------------------------------------------------------------------
  // Pick combination finder — JavaScript port of _extended_two_pointer
  // from trade_value.py (repo root).
  //
  // Python original uses:
  //   - k=1: linear scan over sorted pick_values
  //   - k=2: two-pointer sweep over the full array
  //   - k>=3: _recurse fixes k-2 outer elements, then two-pointer on tail
  //   Three stopping criteria checked between k iterations.
  // ---------------------------------------------------------------------------

  function _extendedTwoPointer(pickValues, target, maxPicks, tolerance) {
    // pickValues: Array of [pick_number, value] sorted ascending by value
    const n = pickValues.length;
    if (n === 0) return { picks: [], values: [], totalValue: 0.0 };

    const minVal = pickValues[0][1];

    let bestPicks = [];
    let bestValues = [];
    let bestTotal = 0.0;
    let bestError = Infinity;

    function _updateBest(candidateIndices) {
      const total = candidateIndices.reduce((s, i) => s + pickValues[i][1], 0);
      const err = Math.abs(total - target);
      if (err < bestError) {
        bestError = err;
        bestTotal = total;
        bestPicks = candidateIndices.map(i => pickValues[i][0]);
        bestValues = candidateIndices.map(i => pickValues[i][1]);
      }
    }

    // Two-pointer sweep over pickValues[lo..hi] with fixed outer indices
    // Mirrors Python's _two_pointer_sweep
    function _twoPointerSweep(fixed, lo, hi) {
      const fixedSum = fixed.reduce((s, i) => s + pickValues[i][1], 0);
      const remaining = target - fixedSum;
      let left = lo;
      let right = hi;
      while (left < right) {
        const s = pickValues[left][1] + pickValues[right][1];
        _updateBest([...fixed, left, right]);
        if (Math.abs(s - remaining) < 1e-12) return; // exact pair match
        if (s < remaining) {
          left++;
        } else {
          right--;
        }
      }
    }

    // Recursively fix one more element, then two-pointer or recurse deeper
    // Mirrors Python's _recurse
    function _recurse(fixed, start, depthRemaining) {
      if (depthRemaining === 2) {
        _twoPointerSweep(fixed, start, n - 1);
        return;
      }
      for (let i = start; i <= n - depthRemaining; i++) {
        _updateBest([...fixed, i]);
        if (depthRemaining > 1) {
          _recurse([...fixed, i], i + 1, depthRemaining - 1);
        }
        // Pruning: stop early if fixed sum already overshoots target + bestError
        const fixedSoFar = fixed.reduce((s, j) => s + pickValues[j][1], 0) + pickValues[i][1];
        if (fixedSoFar > target + bestError) break;
      }
    }

    // k=1: linear scan
    for (let i = 0; i < n; i++) {
      _updateBest([i]);
      if (pickValues[i][1] > target + bestError) break;
    }

    let prevError = bestError;

    for (let k = 2; k <= maxPicks; k++) {
      if (bestError <= tolerance) break;         // stopping criterion 1: exact/within tolerance
      if (bestError < minVal) break;             // stopping criterion 2: gap < smallest pick
      if (k > 2 && bestError >= prevError) break; // stopping criterion 3: no improvement

      prevError = bestError;

      if (k === 2) {
        _twoPointerSweep([], 0, n - 1);
      } else {
        _recurse([], 0, k);
      }
    }

    return { picks: bestPicks, values: bestValues, totalValue: bestTotal };
  }

  function findPickCombination(targetValue, chartData, maxPicks, tolerance) {
    if (maxPicks === undefined) maxPicks = 5;
    if (tolerance === undefined) tolerance = 0.0;
    const sorted = [...chartData].sort((a, b) => a.value - b.value);
    const pairs = sorted.map(d => [d.pick, d.value]);
    const { picks, values, totalValue } = _extendedTwoPointer(pairs, targetValue, maxPicks, tolerance);
    return { picks, values, totalValue, error: totalValue - targetValue };
  }

  function findPickComboWithExcess(targetValue, chartData) {
    const result = findPickCombination(targetValue, chartData);
    const excess = result.totalValue - targetValue;
    const vMin = Math.min(...chartData.map(d => d.value));
    let excessResult = null;
    if (excess > vMin && excess > 0) {
      excessResult = findPickCombination(excess, chartData);
    }
    return { ...result, excess, excessResult };
  }

  // ---------------------------------------------------------------------------
  // Color shading
  // ---------------------------------------------------------------------------

  // pickLabelFromData: accepts either a plain integer (overall pick) or a
  // {overall, round, pick[, pick_year]} object as stored in baked trade JSON.
  function pickLabelFromData(p) {
    if (typeof p === 'number') return pickLabel(p);
    const base = `Rd ${p.round}, Pk ${p.pick} (Overall: ${p.overall})`;
    return p.pick_year ? `${base} [${p.pick_year}]` : base;
  }

  // Compact "R.P (overall)" format for equivalent picks display.
  function pickLabelWithOverallFromData(p) {
    if (typeof p === 'number') return pickLabelWithOverall(p);
    return `${p.round}.${p.pick} (${p.overall})`;
  }

  function tradeColor(net, vMax, vMin) {
    if (net === 0) return { bg: '#ffffff', text: '#1a1a1a' };
    const magnitude = Math.abs(net);
    if (magnitude <= vMin) return { bg: '#ffffff', text: '#1a1a1a' };
    const t = Math.min((magnitude - vMin) / (vMax - vMin), 1.0);
    const lightness = Math.round(95 - t * 65);
    const hue = net > 0 ? 122 : 4;
    const sat = net > 0 ? 60 : 70;
    // Only use white text for very dark backgrounds (lightness < 40%)
    const textColor = lightness < 40 ? '#ffffff' : '#1a1a1a';
    return { bg: `hsl(${hue}, ${sat}%, ${lightness}%)`, text: textColor };
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  window.TradeUtils = {
    NFL_TEAMS, CHART_CONFIGS, CHART_PRESETS, BALDWIN_LEGEND,
    overallPickFromRound, roundFromOverall, pickLabel, pickLabelShort, pickLabelWithOverall,
    pickLabelFromData, pickLabelWithOverallFromData, formatPickList,
    teamLogoUrl, getTeamByAbbrev,
    loadChartData, loadAllCharts, getChartScale,
    findPickCombination, findPickComboWithExcess,
    tradeColor,
  };

})();
