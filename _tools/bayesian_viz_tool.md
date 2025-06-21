---
layout: default
title: "Bayesian Distribution Visualizer"
show_title: false
description: "Interactive tool for exploring Bayesian updating with Beta and Gamma conjugate priors"
thumbnail: "/assets/images/bayesian-viz-thumb.png"
---

{% include bayesian-visualizer.html %}

<style>
.site-content h2 { font-size: 1.875rem !important; font-weight: 600 !important; margin: 1.5rem 0 1rem 0 !important; }
.site-content h3 { font-size: 1.5rem !important; font-weight: 600 !important; margin: 1.25rem 0 0.75rem 0 !important; }

/* Unordered lists */
.site-content ul { margin: 1rem 0 !important; padding-left: 1.5rem !important; }
.site-content ul li { list-style-type: disc !important; margin: 0.25rem 0 !important; }

/* Ordered (numbered) lists */
.site-content ol { margin: 1rem 0 !important; padding-left: 1.5rem !important; }
.site-content ol li { list-style-type: decimal !important; margin: 0.25rem 0 !important; }

.site-content strong { font-weight: 700 !important; }
</style>

## Overview

The Bayesian Distribution Visualizer is an interactive educational tool that demonstrates how Bayesian inference works with conjugate priors. It allows users to explore how prior beliefs are updated when new data is observed, providing both visual and quantitative insights into the Bayesian updating process.

## Features

### Distribution Support
- **Beta Distribution**: Perfect for modeling probabilities and proportions
- **Gamma Distribution**: Ideal for modeling rates and positive continuous variables

### Interactive Controls
- **Prior Configuration**: Adjust distribution parameters with sliders and numerical inputs
- **Measurement Updates**: Add new observations to see real-time Bayesian updating
- **Probability Calculator**: Compute P(X < x) and P(X > x) for any value
- **Rendering Settings**: Customize plot resolution and display parameters

### Visualizations
- **Interactive Plotly Charts**: High-quality, zoomable, and exportable plots
- **Prior vs Posterior**: Compare distributions before and after updating
- **Statistical Metrics**: Mode, mean, variance, and standard deviation tables
- **Export Capabilities**: Save plots as PNG or data as CSV

## Usage Instructions

### Getting Started
1. **Choose Distribution**: Select Beta (for probabilities) or Gamma (for rates) from the dropdown
2. **Set Prior Parameters**: Use sliders or input fields to configure your prior beliefs
3. **Observe the Prior**: The chart shows your initial belief distribution

### Updating with Data
- **Beta Distribution**: Enter number of successes and failures
- **Gamma Distribution**: Enter sum of observations and count of observations
- **View Results**: The posterior distribution appears, showing updated beliefs

### Probability Calculations
1. Expand the "Probability Calculator" section
2. Enter a value of interest
3. Choose direction (greater than or less than)
4. Compare prior and posterior probabilities

### Advanced Settings
- **Data Points**: Increase for smoother curves (50-1000 points)
- **Boundary Margins**: Adjust Beta distribution edge behavior
- **Range Multipliers**: Control Gamma distribution display range

## Mathematical Background

### Beta Distribution
The Beta distribution is the conjugate prior for the Binomial likelihood. If you have:
- Prior: Beta(α, β)
- Data: k successes in n trials
- Posterior: Beta(α + k, β + n - k)

**Use Cases:**
- Success rates and conversion probabilities
- Quality control and defect rates
- A/B testing and user behavior analysis

### Gamma Distribution
The Gamma distribution is the conjugate prior for the Poisson likelihood. If you have:
- Prior: Gamma(α, β)
- Data: sum = Σx, count = n observations
- Posterior: Gamma(α + sum, β + n)

**Use Cases:**
- Event rates and arrival times
- Reliability engineering and failure rates
- Network traffic and queue analysis

### Technical Implementation
Development of this tool was done with heavy usage of Claude.ai and is AI-assisted.

The tool is built using:
- **React**: For interactive user interface components
- **Plotly.js**: For high-quality, interactive statistical plots

## Export and Sharing

### Data Export
- **CSV Format**: Export distribution data points for further analysis
- **JSON Parameters**: Save complete configuration and results
- **PNG Images**: High-resolution plots for presentations and papers