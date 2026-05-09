"""Bake NFL trade data into per-year JSON files for the trade analysis tool."""

import argparse
import json
import sys
import types
from datetime import datetime, timezone
from pathlib import Path

import polars as pl

# ---------------------------------------------------------------------------
# Monkey-patch src.data_ingest (not present in this repo) before importing
# trade_value, which uses `from src.data_ingest import load_csv`.
# ---------------------------------------------------------------------------
_src = types.ModuleType('src')
_di  = types.ModuleType('src.data_ingest')
_di.load_csv = lambda path: pl.read_csv(path, infer_schema_length=10000)
sys.modules['src'] = _src
sys.modules['src.data_ingest'] = _di

sys.path.insert(0, str(Path(__file__).parent.parent))  # repo root → trade_value.py
from trade_value import analyze_draft_trades, find_pick_combination, load_trade_chart  # noqa: E402

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Maps column prefixes in analyze_draft_trades output to JSON chart keys
PREFIX_TO_CHART = {
    'fitz_spiel': 'fitzgerald_spielberger',
    'jj':         'jimmy_johnson',
    'pff':        'pff_war',
    'rich_hill':  'rich_hill',
    'eaar':       'eavar',
}

# Historical abbreviation normalization
ABBREV_NORMALIZE = {
    'OAK': 'LV',   # Raiders moved to Las Vegas 2020
    'STL': 'LA',   # Rams moved to Los Angeles 2016
    'SD':  'LAC',  # Chargers moved to Los Angeles 2017
    'JAC': 'JAX',  # Alternate spelling
    'ARZ': 'ARI',  # Alternate spelling
    'BLT': 'BAL',  # Alternate spelling
    'CLV': 'CLE',  # Alternate spelling
    'HST': 'HOU',  # Alternate spelling
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


def bake_year(year: int, output_dir: Path, charts_dir: Path) -> dict:
    """Return the JSON dict for one year; write to output_dir/{year}.json."""
    teams_data: dict[str, list] = {}
    total_trades = 0

    for raw_abbrev in NFL_TEAMS:
        team = normalize_abbrev(raw_abbrev)
        try:
            df = analyze_draft_trades(team, year, data_dir=charts_dir)
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
                    print(f"      WARNING: excess compute failed {team}/{year}/{chart_key} — {e}")
                    chart_values[chart_key] = {'net': round(net, 4), 'equiv_picks': [], 'excess': 0.0, 'excess_picks': []}

            # Normalize the "traded with" team abbreviations
            raw_with = row.get('team_traded_with', '') or ''
            traded_with = ','.join(
                normalize_abbrev(t.strip())
                for t in raw_with.split(',') if t.strip()
            )

            trade_list.append({
                'trade_id': int(row['trade_id']),
                'team_traded_with': traded_with,
                'picks_received': parse_pick_list(row.get('picks_received', '') or ''),
                'picks_gave':     parse_pick_list(row.get('picks_gave', '') or ''),
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

    teams_present = len(teams_data)
    print(f"  Baking {year}... {teams_present} teams, {total_trades} trades. ✓")
    return year_obj


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description='Bake NFL trade data to JSON')
    parser.add_argument('--years', nargs='+', default=['all'],
                        help='Years to bake (integers) or "all"')
    parser.add_argument('--output-dir', default='assets/data/trades/',
                        help='Output directory for JSON files')
    parser.add_argument('--charts-dir', default='assets/data/',
                        help='Directory containing trade chart CSVs')
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    charts_dir = Path(args.charts_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Determine year range
    if args.years == ['all'] or args.years == ['all']:
        current_year = datetime.now().year
        # nflreadpy data typically starts from 2010
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

    # Write index.json
    index = {
        'available_years': sorted(baked_years),
        'generated_at': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
    }
    with open(output_dir / 'index.json', 'w') as f:
        json.dump(index, f)

    print(f"Wrote index.json: {len(baked_years)} years available ({min(baked_years)}–{max(baked_years)}).")


if __name__ == '__main__':
    main()
