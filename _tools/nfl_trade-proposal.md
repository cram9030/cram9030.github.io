---
layout: default
title: "NFL Draft Trade Evaluator"
show_title: false
description: "Evaluate a proposed NFL draft pick trade across multiple value charts"
thumbnail: "/assets/images/NFL_Draft_Scales.svg"
---

<div id="trade-proposal-root">
  <noscript>You need to enable JavaScript to view this tool.</noscript>
  <div class="loading">Loading tool...</div>
</div>

<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" integrity="sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z" crossorigin="anonymous"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" integrity="sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.7/babel.min.js" integrity="sha384-ezQ6HS3FLspd9te19o2McUV6FAK091+GG7KO54f/R8DKgCDi7fULhapNrd5LY+vG" crossorigin="anonymous"></script>
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

<!-- trade-utils.js is plain JS (no JSX) — load BEFORE the babel script -->
<script src="{{ site.baseurl }}/assets/js/trade-utils.js"></script>
<script type="text/babel" src="{{ site.baseurl }}/assets/js/trade-proposal.js"></script>

<style>
@keyframes spin { to { transform: rotate(360deg); } }
.trade-spinner {
  width: 40px; height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #007FBF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 2rem auto;
}
.site-content h2 { font-size: 1.875rem !important; font-weight: 600 !important; margin: 1.5rem 0 1rem 0 !important; }
.site-content h3 { font-size: 1.5rem !important; font-weight: 600 !important; margin: 1.25rem 0 0.75rem 0 !important; }
.site-content ul { margin: 1rem 0 !important; padding-left: 1.5rem !important; }
.site-content ul li { list-style-type: disc !important; margin: 0.25rem 0 !important; }
.site-content strong { font-weight: 700 !important; }
</style>

## Overview

The NFL Draft Trade Evaluator lets you design a hypothetical draft pick swap and instantly see which side receives more value — scored across up to six different trade value charts simultaneously, including Ben Baldwin's [Open Source Football surplus-value chart](https://opensourcefootball.com/posts/2023-02-23-nfl-draft-value-chart/#part-4-the-full-table)[^1]. Useful for evaluating real or speculative trades before or during the NFL Draft.

## Features

- **Flexible pick entry** — add any number of picks per side, each specified by round (1–7) and pick number within the round (1–32).
- **Live pick preview** — a running summary above each side's pick list shows the picks in readable format as you build the trade.
- **Multiple value charts** — choose from six frameworks: Rich Hill, Fitzgerald-Spielberger, Expected AV Above Replacement (EAVAR), Ben Baldwin (OSF Surplus Value), Jimmy Johnson, and PFF WAR, or use a preset combination.
- **Results per chart** — each chart card shows total value received by Side A and Side B, plus the net value advantage for Side A.
- **Ben Baldwin (BB) split metrics** — the Baldwin card adds two extra rows below the primary surplus-value **Points** result: **APY\*** (net surplus expressed as a percent of salary cap) and **OFV** (net on-field value ignoring contract cost). See the legend under the card for what APY\* and OFV mean.
- **Color-coded net value** — green for Side A's advantage, red for Side B's, with intensity proportional to the margin.
- **Equivalent picks** — the net advantage is translated into the nearest pick or pick combination of equivalent worth on that chart.
- **Excess breakdown** — when the equivalent pick combination overshoots the net value, the remaining excess is also shown in pick terms.
- **Consensus summary** — a banner below the results tallies how many of the selected charts favor each side.
- **PNG export** — download a 1200 × 630 px image of the full proposal summary for sharing on social media.

## Usage

1. Select a value chart preset — **Default** uses Rich Hill, Fitzgerald-Spielberger, EAVAR, and Ben Baldwin (OSF); **All 6 Charts** adds Jimmy Johnson and PFF WAR.
2. Under **Side A Sends**, enter the picks Side A is giving up: choose round and pick number, then click **＋ Add Pick** to add more picks as needed.
3. Under **Side B Sends**, enter the picks Side B is giving up in the same way.
4. Click **Calculate**.
5. Review each chart card: **Side A Receives** is the total value of what Side B sent, and vice versa. The **Net Value** column shows the difference from Side A's perspective — positive means Side A received more value.
6. The **Equivalent Picks** row translates that net advantage into concrete picks, so you can understand the margin in familiar draft-pick terms.
7. The consensus banner at the bottom of the results summarizes how many charts favor each side.
8. Click **Export PNG** to save the summary as an image.

## References

[^1]: Baldwin, Ben. ["NFL Draft Value Chart."](https://opensourcefootball.com/posts/2023-02-23-nfl-draft-value-chart/#part-4-the-full-table) *Open Source Football*, Feb. 23, 2023. The Points, APY, and OFV columns of the full table are used as-is: Points (surplus-value, 0–100 scale) drives the primary net value and color coding; APY (surplus as a percent of salary cap) and OFV (on-field value ignoring contract cost) are shown as supplementary net values beneath it.
