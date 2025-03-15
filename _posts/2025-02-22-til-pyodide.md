---
layout: default
title: "Pyodide"
date: 2025-02-22
---

<head>
    <script src="https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js"></script>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
    <div id="beam-plot" style="width:800px;height:400px;"></div>
    <div id="tip-plot" style="width:800px;height:400px;"></div>

<script>
async function initSimulation() {
    // Initialize Pyodide
    let pyodide = await loadPyodide();
    
    // Load required packages
    await pyodide.loadPackage(['numpy', 'scipy']);
    await pyodide.loadPackage('/assets/python/continuum_robot-0.0.1a1-py3-none-any.whl');
    
    // Load and run simulation code
    const response = await fetch('/assets/python/simulation-code.py');
    const simulationCode = await response.text();
    pyodide.runPython(simulationCode);
    
    // Run simulation and get results
    const results = JSON.parse(pyodide.runPython('run_simulation()'));
    
    // Setup plots
    setupAnimation(results);
}

function setupAnimation(results) {
    // Setup beam displacement plot
    const beamPlot = document.getElementById('beam-plot');
    const tipPlot = document.getElementById('tip-plot');
    
    // Create initial beam plot
    const beamTrace = {
        x: results.x_coords[0],
        y: results.y_coords[0],
        mode: 'lines+markers',
        line: {color: 'blue'},
        name: 'Beam'
    };
    
    const beamLayout = {
        title: 'Beam Displacement',
        xaxis: {range: [0, 1.6]},
        yaxis: {
            range: [
                Math.min(...results.y_coords.flat()) * 1.1,
                Math.max(...results.y_coords.flat()) * 1.1
            ]
        }
    };
    
    // Create tip displacement plot
    const tipTrace = {
        x: results.times,
        y: results.tip_displacement,
        mode: 'lines',
        line: {color: 'blue'},
        name: 'Tip Displacement'
    };
    
    const tipLayout = {
        title: 'Tip Displacement vs Time',
        xaxis: {title: 'Time (s)'},
        yaxis: {title: 'Displacement (m)'}
    };
    
    // Initialize plots
    Plotly.newPlot(beamPlot, [beamTrace], beamLayout);
    Plotly.newPlot(tipPlot, [tipTrace], tipLayout);
    
    // Setup animation
    let frame = 0;
    const framesPerSecond = 1/0.01; // Match DT from simulation
    
    setInterval(() => {
        const update = {
            x: [results.x_coords[frame]],
            y: [results.y_coords[frame]]
        };
        
        Plotly.update(beamPlot, update);
        
        frame = (frame + 1) % results.times.length;
    }, 1000/framesPerSecond);
}

// Start simulation
initSimulation();
</script>
</body>