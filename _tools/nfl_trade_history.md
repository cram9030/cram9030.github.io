---
layout: default
title: "NFL Team Trade History Analyzer"
show_title: false
description: "Analyze an NFL team's draft pick trade history across multiple value charts"
thumbnail: "/assets/images/trade-analysis-thumb.png"
---

<div id="trade-analysis-root">
  <noscript>You need to enable JavaScript to view this tool.</noscript>
  <div class="loading">Loading tool...</div>
</div>

<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

<!-- trade-utils.js is plain JS (no JSX) — load BEFORE the babel script -->
<script src="{{ site.baseurl }}/assets/js/trade-utils.js"></script>
<script type="text/babel" src="{{ site.baseurl }}/assets/js/trade-analysis.js"></script>

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
