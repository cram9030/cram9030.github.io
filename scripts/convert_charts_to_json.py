"""Convert trade chart CSVs to JSON format for the NFL trade analysis tools."""

import argparse
import json
import sys
from pathlib import Path

import polars as pl

# Map JSON output name -> (filename, pick_col, value_col, deduplicate_on_pick)
_CHART_REGISTRY = {
    "rich_hill": ("Rich-Hill.csv", "pick", "value", False),
    "fitzgerald_spielberger": ("fitzgerald_spielberger_trade_chart.csv", "Pick", "Value", False),
    "jimmy_johnson": ("jimmy_johnson_trade_chart.csv", "Pick", "Value", True),
    "pff_war": ("pff_war_draft_chart.csv", "Pick", "PFF_WAR_Normalized", False),
    "eavar": ("expected_av_above_replacement.csv", "pick", "eavar", False),
    "5_year_av": ("5_year_av_chart.csv", "Pk", "FP Val", False),
}


def convert_chart(input_dir: Path, output_dir: Path, chart_name: str) -> None:
    filename, pick_col, value_col, dedup = _CHART_REGISTRY[chart_name]
    path = input_dir / filename

    if not path.exists():
        print(f"  ERROR: {path} not found", file=sys.stderr)
        return

    df = pl.read_csv(path, infer_schema_length=10000)

    if dedup:
        df = df.unique(subset=[pick_col], keep="first")

    df = (
        df.select([pick_col, value_col])
        .rename({pick_col: "pick", value_col: "value"})
        .with_columns([
            pl.col("pick").cast(pl.Int64),
            pl.col("value").cast(pl.Float64),
        ])
        .sort("pick")
    )

    records = [{"pick": row["pick"], "value": row["value"]} for row in df.iter_rows(named=True)]

    out_path = output_dir / f"{chart_name}.json"
    with open(out_path, "w") as f:
        json.dump(records, f)

    v_min = min(r["value"] for r in records)
    v_max = max(r["value"] for r in records)
    print(f"  {chart_name}: {len(records)} picks, range [{v_min:.4g}, {v_max:.4g}]")


def main():
    parser = argparse.ArgumentParser(description="Convert trade chart CSVs to JSON")
    parser.add_argument("--input-dir", default="assets/data/", help="Directory containing CSV files")
    parser.add_argument("--output-dir", default="assets/data/charts/", help="Output directory for JSON files")
    args = parser.parse_args()

    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Converting charts from {input_dir} -> {output_dir}")
    for chart_name in _CHART_REGISTRY:
        convert_chart(input_dir, output_dir, chart_name)
    print("Done.")


if __name__ == "__main__":
    main()
