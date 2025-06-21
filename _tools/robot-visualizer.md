---
layout: default
title: "Robot Arm Visualizer"
description: "Interactive 2D visualization tool for FANUC robot arm kinematics"
thumbnail: "/assets/images/robot-viz-thumb.png"
---

<div id="robot-viz-root">
    <noscript>You need to enable JavaScript to view this visualization.</noscript>
    <div class="loading">Loading visualization...</div>
</div>

<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>

<style>
    .card {
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        margin: 1rem;
        padding: 1rem;
    }
    
    .input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        margin-top: 0.25rem;
        margin-bottom: 1rem;
    }
    
    .label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #1a202c;
    }
    
    .card-header {
        padding: 1.25rem 1.25rem 0;
    }
    
    .card-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a202c;
    }
    
    .card-content {
        padding: 1.25rem;
    }

    .loading {
        text-align: center;
        padding: 2rem;
        font-style: italic;
        color: #666;
    }
</style>

<script type="text/babel" src="{{ site.baseurl }}/assets/js/robot-viz.js"></script>

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

This interactive tool allows you to visualize the kinematics of a FANUC CRX-20iA/L robot arm in 2D space. Input joint angles and see the real-time configuration of the robot arm.

## Features

- Real-time forward kinematics calculation
- Interactive joint angle controls
- End effector position display
- Based on actual URDF specifications

## Usage

1. Adjust the joint angles using the input controls
2. View the updated robot configuration in real-time
3. Monitor the end effector position coordinates

## Technical Details

The tool uses React for the interactive interface and implements forward kinematics calculations based on the robot's URDF specifications. It visualizes the robot in the Y-Z plane using joints J2, J3, and J5.