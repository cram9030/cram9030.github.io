"""Bake NFL trade data into per-year JSON files for the trade analysis tool."""

import argparse
import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path

import nflreadpy
import polars as pl

sys.path.insert(0, str(Path(__file__).parent))  # scripts/ → trade_value.py
from trade_value import analyze_draft_trades, find_pick_combination, load_trade_chart  # noqa: E402
from draft_integration import apply_trade_patch  # noqa: E402

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

PREFIX_TO_CHART = {
    'fitz_spiel': 'fitzgerald_spielberger',
    'jj':         'jimmy_johnson',
    'pff':        'pff_war',
    'rich_hill':  'rich_hill',
    'eaar':       'eavar',
}

ABBREV_NORMALIZE = {
    'OAK': 'LV',
    'STL': 'LA',
    'SD':  'LAC',
    'JAC': 'JAX',
    'ARZ': 'ARI',
    'BLT': 'BAL',
    'CLV': 'CLE',
    'HST': 'HOU',
    'NWE': 'NE',   # nflreadpy uses NWE for New England
    'GNB': 'GB',   # nflreadpy uses GNB for Green Bay
    'KAN': 'KC',   # nflreadpy uses KAN for Kansas City
    'SFO': 'SF',   # nflreadpy uses SFO for San Francisco
    'NOR': 'NO',   # nflreadpy uses NOR for New Orleans
    'TAM': 'TB',   # nflreadpy uses TAM for Tampa Bay
    'LVR': 'LV',   # alternate for Las Vegas Raiders
    'RAM': 'LA',   # alternate for Rams
}

NFL_TEAMS = [
    'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE',
    'DAL', 'DEN', 'DET', 'GB',  'HOU', 'IND', 'JAX', 'KC',
    'LA',  'LAC', 'LV',  'MIA', 'MIN', 'NE',  'NO',  'NYG',
    'NYJ', 'PHI', 'PIT', 'SEA', 'SF',  'TB',  'TEN', 'WAS',
]


def normalize_abbrev(abbrev: str) -> str:
    return ABBREV_NORMALIZE.get(abbrev, abbrev)


# ---------------------------------------------------------------------------
# Draft pick map — exact round/pick-in-round from nflreadpy
# ---------------------------------------------------------------------------

_draft_cache: dict[int, dict[int, dict]] = {}


def build_pick_map(year: int) -> dict[int, dict]:
    """Return {overall_pick: {overall, round, pick}} for every pick in the year's draft."""
    if year in _draft_cache:
        return _draft_cache[year]

    all_draft = nflreadpy.load_draft_picks()
    year_picks = all_draft.filter(pl.col('season') == year).sort('pick')

    mapping: dict[int, dict] = {}
    for round_num in range(1, 8):
        round_picks = sorted(
            year_picks.filter(pl.col('round') == round_num)['pick'].to_list()
        )
        for pick_in_round, overall in enumerate(round_picks, start=1):
            mapping[overall] = {'overall': overall, 'round': round_num, 'pick': pick_in_round}

    _draft_cache[year] = mapping
    return mapping


def overall_to_pick_obj(overall: int, pick_map: dict[int, dict]) -> dict:
    """Convert an overall pick number to a {overall, round, pick} object.

    Uses the actual draft order when available; falls back to 32-per-round
    approximation capped at round 7 for picks not in the given year's draft
    (e.g. future picks traded before the draft).
    """
    if overall in pick_map:
        return pick_map[overall]
    # Fallback: approximate with round cap at 7
    if overall <= 192:
        round_num = math.ceil(overall / 32)
        pick_in_round = overall - (round_num - 1) * 32
    else:
        round_num = 7
        pick_in_round = overall - 192
    return {'overall': overall, 'round': round_num, 'pick': pick_in_round}


# ---------------------------------------------------------------------------
# Excess computation
# ---------------------------------------------------------------------------

def compute_excess(net_value: float, chart_name: str, charts_dir: Path) -> dict:
    if net_value == 0:
        return {'net': 0.0, 'equiv_picks': [], 'excess': 0.0, 'excess_picks': []}

    chart = load_trade_chart(chart_name, data_dir=charts_dir)
    last_pick_value = float(chart['Value'].min())

    combo = find_pick_combination(abs(net_value), chart_name, data_dir=charts_dir)
    excess = combo['total_value'] - abs(net_value)

    excess_picks = []
    if excess > last_pick_value:
        excess_combo = find_pick_combination(excess, chart_name, data_dir=charts_dir)
        excess_picks = excess_combo['picks']

    return {
        'net': round(net_value, 4),
        'equiv_picks': combo['picks'],
        'excess': round(excess, 4),
        'excess_picks': excess_picks,
    }


# ---------------------------------------------------------------------------
# Per-year baking
# ---------------------------------------------------------------------------

def parse_pick_list(s: str) -> list[int]:
    if not s:
        return []
    return [int(x.strip()) for x in s.split(',') if x.strip()]


def bake_year(year: int, output_dir: Path, charts_dir: Path) -> None:
    pick_map = build_pick_map(year)
    teams_data: dict[str, list] = {}
    total_trades = 0

    all_trades = nflreadpy.load_trades()
    patch_path = charts_dir / f"trade_patch_{year}.json"
    if patch_path.exists():
        with open(patch_path) as f:
            patch = json.load(f)
        all_trades = apply_trade_patch(all_trades, patch)

    for raw_abbrev in NFL_TEAMS:
        team = normalize_abbrev(raw_abbrev)
        try:
            df = analyze_draft_trades(team, year, data_dir=charts_dir, trades_df=all_trades)
        except Exception as e:
            print(f"    WARNING: {team} {year} failed — {e}")
            continue

        if len(df) == 0:
            continue

        trade_list = []
        for row in df.iter_rows(named=True):
            chart_values = {}
            for prefix, chart_key in PREFIX_TO_CHART.items():
                net = row.get(f'{prefix}_value', 0.0) or 0.0
                try:
                    chart_values[chart_key] = compute_excess(net, chart_key, charts_dir)
                except Exception as e:
                    print(f"      WARNING: {team}/{year}/{chart_key} — {e}")
                    chart_values[chart_key] = {'net': round(net, 4), 'equiv_picks': [], 'excess': 0.0, 'excess_picks': []}

            raw_with = row.get('team_traded_with', '') or ''
            traded_with = ','.join(
                normalize_abbrev(t.strip())
                for t in raw_with.split(',') if t.strip()
            )

            # Convert overall pick numbers to {overall, round, pick} objects,
            # adding pick_year for picks that belong to a different draft year.
            rcv_overall = parse_pick_list(row.get('picks_received', '') or '')
            gave_overall = parse_pick_list(row.get('picks_gave', '') or '')
            rcv_seasons = parse_pick_list(row.get('picks_received_seasons', '') or '')
            gave_seasons = parse_pick_list(row.get('picks_gave_seasons', '') or '')

            def to_pick_obj(overall: int, season: int) -> dict:
                if season != year:
                    season_map = build_pick_map(season)
                    obj = overall_to_pick_obj(overall, season_map)
                    return {**obj, 'pick_year': season}
                return overall_to_pick_obj(overall, pick_map)

            trade_list.append({
                'team_traded_with': traded_with,
                'picks_received': [
                    to_pick_obj(p, s)
                    for p, s in zip(rcv_overall, rcv_seasons or ([year] * len(rcv_overall)))
                ],
                'picks_gave': [
                    to_pick_obj(p, s)
                    for p, s in zip(gave_overall, gave_seasons or ([year] * len(gave_overall)))
                ],
                'chart_values': chart_values,
            })

        if trade_list:
            teams_data[team] = trade_list
            total_trades += len(trade_list)

    year_obj = {
        'year': year,
        'generated_at': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'teams': teams_data,
    }

    out_path = output_dir / f'{year}.json'
    with open(out_path, 'w') as f:
        json.dump(year_obj, f)

    print(f"  Baking {year}... {len(teams_data)} teams, {total_trades} trades. ✓")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description='Bake NFL trade data to JSON')
    parser.add_argument('--years', nargs='+', default=['all'])
    parser.add_argument('--output-dir', default='assets/data/trades/')
    parser.add_argument('--charts-dir', default='assets/data/')
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    charts_dir = Path(args.charts_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    if args.years == ['all']:
        current_year = datetime.now().year
        years = list(range(2010, current_year + 1))
    else:
        years = [int(y) for y in args.years]

    print(f"Baking {len(years)} year(s): {years[0]}–{years[-1]}")
    baked_years = []

    for year in years:
        try:
            bake_year(year, output_dir, charts_dir)
            baked_years.append(year)
        except Exception as e:
            print(f"  ERROR baking {year}: {e}")

    index = {
        'available_years': sorted(baked_years),
        'generated_at': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
    }
    with open(output_dir / 'index.json', 'w') as f:
        json.dump(index, f)

    print(f"Wrote index.json: {len(baked_years)} years available ({min(baked_years)}–{max(baked_years)}).")


if __name__ == '__main__':
    main()
