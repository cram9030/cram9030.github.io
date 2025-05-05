const BayesianVisualizer = () => {
  // State for distribution type
  const [distributionType, setDistributionType] = React.useState('beta');
  
  // States for Beta distribution parameters
  const [betaAlpha, setBetaAlpha] = React.useState(2);
  const [betaBeta, setBetaBeta] = React.useState(2);
  
  // States for Gamma distribution parameters
  const [gammaAlpha, setGammaAlpha] = React.useState(2);
  const [gammaBeta, setGammaBeta] = React.useState(1);
  
  // Measurement states
  const [successes, setSuccesses] = React.useState(7);
  const [failures, setFailures] = React.useState(3);
  
  // Posterior states
  const [posteriorData, setPosteriorData] = React.useState([]);
  const [priorData, setPriorData] = React.useState([]);
  const [beliefTable, setBeliefTable] = React.useState({
    prior: { mode: 0, mean: 0, stdDev: 0 },
    posterior: { mode: 0, mean: 0, stdDev: 0 }
  });
  
  // Helper functions to calculate distributions
  const calculateBetaDistribution = (alpha, beta, points = 200) => {
    const data = [];
    const betaFunc = (a, b) => {
      // Approximation of the beta function for visualization purposes
      return Math.exp(
        gammaLn(a) + gammaLn(b) - gammaLn(a + b)
      );
    };
    
    const gammaLn = (z) => {
      // Approximation of the log gamma function
      const c = [
        76.18009172947146, -86.50532032941677, 24.01409824083091,
        -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
      ];
      let sum = 1.000000000190015;
      let x = z;
      for (let i = 0; i < 6; i++) {
        sum += c[i] / ++x;
      }
      return Math.log(Math.sqrt(2 * Math.PI) / z * sum) + (z + 0.5) * Math.log(z + 5.5) - (z + 5.5);
    };
    
    // Use more points for smoother curves
    const step = 1 / points;
    for (let x = step; x < 1; x += step) {
      const density = Math.pow(x, alpha - 1) * 
                     Math.pow(1 - x, beta - 1) / 
                     betaFunc(alpha, beta);
      data.push({
        x: parseFloat(x.toFixed(4)),
        y: density
      });
    }
    
    return data;
  };
  
  const calculateGammaDistribution = (alpha, beta, points = 200) => {
    const data = [];
    
    const gammaFunc = (a) => {
      // Approximation of the gamma function
      if (a < 0.5) {
        return Math.PI / (Math.sin(Math.PI * a) * gammaFunc(1 - a));
      } else {
        a -= 1;
        let x = 0.99999999999980993;
        const p = [
          676.5203681218851, -1259.1392167224028, 771.32342877765313,
          -176.61502916214059, 12.507343278686905, -0.13857109526572012,
          9.9843695780195716e-6, 1.5056327351493116e-7
        ];
        
        for (let i = 0; i < 8; i++) {
          x += p[i] / (a + i + 1);
        }
        
        const t = a + 7.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, a + 0.5) * Math.exp(-t) * x;
      }
    };
    
    const maxX = alpha / beta * 5; // Reasonable range for visualization
    const step = maxX / points;
    
    for (let x = step; x < maxX; x += step) {
      const density = Math.pow(beta, alpha) * 
                     Math.pow(x, alpha - 1) * 
                     Math.exp(-beta * x) / 
                     gammaFunc(alpha);
      data.push({
        x: parseFloat(x.toFixed(4)),
        y: density
      });
    }
    
    return data;
  };
  
  // Calculate statistics for the Beta distribution
  const calculateBetaStats = (alpha, beta) => {
    let mode = alpha > 1 && beta > 1 ? (alpha - 1) / (alpha + beta - 2) : 0;
    if (alpha < 1 && beta < 1) {
      mode = "Bimodal at 0 and 1";
    } else if (alpha <= 1 && beta > 1) {
      mode = 0;
    } else if (alpha > 1 && beta <= 1) {
      mode = 1;
    }
    
    const mean = alpha / (alpha + beta);
    const variance = (alpha * beta) / (Math.pow(alpha + beta, 2) * (alpha + beta + 1));
    const stdDev = Math.sqrt(variance);
    
    return { mode, mean, stdDev };
  };
  
  // Calculate statistics for the Gamma distribution
  const calculateGammaStats = (alpha, beta) => {
    const mode = alpha > 1 ? (alpha - 1) / beta : "Not defined";
    const mean = alpha / beta;
    const variance = alpha / (beta * beta);
    const stdDev = Math.sqrt(variance);
    
    return { mode, mean, stdDev };
  };
  
  // Calculate the posterior distribution
  const calculatePosterior = () => {
    if (distributionType === 'beta') {
      // Beta-Binomial conjugate update
      const posteriorAlpha = betaAlpha + successes;
      const posteriorBeta = betaBeta + failures;
      
      const priorStats = calculateBetaStats(betaAlpha, betaBeta);
      const posteriorStats = calculateBetaStats(posteriorAlpha, posteriorBeta);
      
      setBeliefTable({
        prior: {
          mode: typeof priorStats.mode === 'number' ? priorStats.mode.toFixed(4) : priorStats.mode,
          mean: priorStats.mean.toFixed(4),
          stdDev: priorStats.stdDev.toFixed(4)
        },
        posterior: {
          mode: typeof posteriorStats.mode === 'number' ? posteriorStats.mode.toFixed(4) : posteriorStats.mode,
          mean: posteriorStats.mean.toFixed(4),
          stdDev: posteriorStats.stdDev.toFixed(4)
        }
      });
      
      setPriorData(calculateBetaDistribution(betaAlpha, betaBeta));
      setPosteriorData(calculateBetaDistribution(posteriorAlpha, posteriorBeta));
    } else {
      // Gamma-Poisson conjugate update
      // In a simple model where we observe the sum of values and count of observations
      const observedSum = successes; // Repurposing the successes input for sum
      const observedCount = failures; // Repurposing the failures input for count
      
      const posteriorAlpha = gammaAlpha + observedSum;
      const posteriorBeta = gammaBeta + observedCount;
      
      const priorStats = calculateGammaStats(gammaAlpha, gammaBeta);
      const posteriorStats = calculateGammaStats(posteriorAlpha, posteriorBeta);
      
      setBeliefTable({
        prior: {
          mode: typeof priorStats.mode === 'number' ? priorStats.mode.toFixed(4) : priorStats.mode,
          mean: priorStats.mean.toFixed(4),
          stdDev: priorStats.stdDev.toFixed(4)
        },
        posterior: {
          mode: typeof posteriorStats.mode === 'number' ? posteriorStats.mode.toFixed(4) : posteriorStats.mode,
          mean: posteriorStats.mean.toFixed(4),
          stdDev: posteriorStats.stdDev.toFixed(4)
        }
      });
      
      setPriorData(calculateGammaDistribution(gammaAlpha, gammaBeta));
      setPosteriorData(calculateGammaDistribution(posteriorAlpha, posteriorBeta));
    }
  };
  
  // Function to set up high-resolution canvas
  const setupCanvas = (canvas) => {
    // Get the device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    
    // Get the canvas size from its parent container
    const parent = canvas.parentElement;
    const computedStyle = window.getComputedStyle(parent);
    const width = parseInt(computedStyle.width, 10) - parseInt(computedStyle.paddingLeft, 10) - parseInt(computedStyle.paddingRight, 10);
    const height = 400; // Fixed height for better proportions
    
    // Update canvas size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Scale the drawing context
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    return {
      ctx,
      width,
      height
    };
  };
  
  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      // Redraw charts when window size changes
      if (priorData.length) {
        drawChart('priorChart', priorData, '#8884d8');
      }
      if (priorData.length && posteriorData.length) {
        drawPosteriorChart();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [priorData, posteriorData]);
  
  // Draw a smooth line chart using canvas with adjusted padding
  const drawChart = (canvasId, data, color, clear = true) => {
    React.useEffect(() => {
      if (!data || data.length === 0) return;
      
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      
      // Set up high-resolution canvas
      const { ctx, width, height } = setupCanvas(canvas);
      
      // Clear canvas if needed
      if (clear) {
        ctx.clearRect(0, 0, width, height);
      }
      
      // Find min/max values
      let maxY = 0;
      for (const point of data) {
        if (point.y > maxY) maxY = point.y;
      }
      
      // Set scale with improved padding
      const padding = { left: 50, right: 30, top: 30, bottom: 50 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;
      
      // Draw axes with improved styling
      ctx.beginPath();
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.moveTo(padding.left, height - padding.bottom);
      ctx.lineTo(width - padding.right, height - padding.bottom); // x-axis
      ctx.moveTo(padding.left, height - padding.bottom);
      ctx.lineTo(padding.left, padding.top); // y-axis
      ctx.stroke();
      
      // Add tick marks
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      
      // X-axis ticks
      const xTicks = distributionType === 'beta' ? 5 : 10;
      for (let i = 0; i <= xTicks; i++) {
        const x = padding.left + (i / xTicks) * chartWidth;
        const tickValue = i / xTicks;
        ctx.beginPath();
        ctx.moveTo(x, height - padding.bottom);
        ctx.lineTo(x, height - padding.bottom + 5);
        ctx.stroke();
        ctx.fillText(tickValue.toFixed(1), x, height - padding.bottom + 8);
      }
      
      // Y-axis ticks - we'll use normalized values (0 to 1)
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = 0; i <= 5; i++) {
        const y = height - padding.bottom - (i / 5) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left - 5, y);
        ctx.stroke();
        // Show normalized values 0-1 since actual density values vary widely
        ctx.fillText((i / 5).toFixed(1), padding.left - 8, y);
      }
      
      // Draw data with improved path and anti-aliasing
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';  // Smoother line joins
      ctx.lineCap = 'round';   // Smoother line caps
      
      let firstPoint = true;
      let prevX, prevY;
      
      // Draw the curve with smooth interpolation
      for (let i = 0; i < data.length; i++) {
        const point = data[i];
        
        let x, y;
        if (distributionType === 'beta') {
          x = padding.left + (point.x * chartWidth);
        } else {
          // For gamma, scale x differently based on the range
          const maxX = data[data.length - 1].x;
          x = padding.left + (point.x / maxX) * chartWidth;
        }
        
        y = height - padding.bottom - ((point.y / maxY) * chartHeight);
        
        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          // Use quadratic curves for smoother lines
          const midX = (prevX + x) / 2;
          const midY = (prevY + y) / 2;
          ctx.quadraticCurveTo(prevX, prevY, midX, midY);
        }
        
        prevX = x;
        prevY = y;
      }
      
      // Complete the last segment
      if (prevX && prevY) {
        ctx.lineTo(prevX, prevY);
      }
      
      ctx.stroke();
      
      // Draw axes labels with improved positioning
      ctx.font = '12px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Parameter Value', width / 2, height - 15);
      
      ctx.save();
      ctx.translate(15, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Density', 0, 0);
      ctx.restore();
      
    }, [data, distributionType]);
  };
  
  // Effect to recalculate when parameters change
  React.useEffect(() => {
    calculatePosterior();
  }, [distributionType, betaAlpha, betaBeta, gammaAlpha, gammaBeta, successes, failures]);
  
  // Draw charts whenever data changes
  drawChart('priorChart', priorData, '#8884d8');
  
  // For the posterior chart, we need to draw both lines
  React.useEffect(() => {
    if (priorData.length > 0 && posteriorData.length > 0) {
      const canvas = document.getElementById('posteriorChart');
      if (!canvas) return;
      
      // Set up high-resolution canvas
      const { ctx, width, height } = setupCanvas(canvas);
      
      // Clear the canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw background elements (axes, ticks, labels)
      const padding = 40;
      const chartWidth = width - 2 * padding;
      const chartHeight = height - 2 * padding;
      
      // Find global max Y value across both datasets
      let maxY = 0;
      for (const point of [...priorData, ...posteriorData]) {
        if (point.y > maxY) maxY = point.y;
      }
      
      // Draw axes
      ctx.beginPath();
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.moveTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding); // x-axis
      ctx.moveTo(padding, height - padding);
      ctx.lineTo(padding, padding); // y-axis
      ctx.stroke();
      
      // Add tick marks
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      
      // X-axis ticks
      const xTicks = distributionType === 'beta' ? 5 : 10;
      for (let i = 0; i <= xTicks; i++) {
        const x = padding + (i / xTicks) * chartWidth;
        const tickValue = i / xTicks;
        ctx.beginPath();
        ctx.moveTo(x, height - padding);
        ctx.lineTo(x, height - padding + 5);
        ctx.stroke();
        ctx.fillText(tickValue.toFixed(1), x, height - padding + 8);
      }
      
      // Y-axis ticks
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = 0; i <= 5; i++) {
        const y = height - padding - (i / 5) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding - 5, y);
        ctx.stroke();
        ctx.fillText((i / 5).toFixed(1), padding - 8, y);
      }
      
      // Draw axes labels
      ctx.font = '12px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Parameter Value', width / 2, height - 15);
      
      ctx.save();
      ctx.translate(15, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Density', 0, 0);
      ctx.restore();
      
      // Function to draw a dataset
      const drawDataset = (data, color, lineWidth) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        let firstPoint = true;
        let prevX, prevY;
        
        for (let i = 0; i < data.length; i++) {
          const point = data[i];
          
          let x, y;
          if (distributionType === 'beta') {
            x = padding + (point.x * chartWidth);
          } else {
            const maxX = Math.max(
              data[data.length - 1].x,
              distributionType === 'beta' ? 1 : posteriorData[posteriorData.length - 1].x
            );
            x = padding + (point.x / maxX) * chartWidth;
          }
          
          y = height - padding - ((point.y / maxY) * chartHeight);
          
          if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
          } else {
            // Use quadratic curves for smoother lines
            const midX = (prevX + x) / 2;
            const midY = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevX, prevY, midX, midY);
          }
          
          prevX = x;
          prevY = y;
        }
        
        // Complete the last segment
        if (prevX && prevY) {
          ctx.lineTo(prevX, prevY);
        }
        
        ctx.stroke();
      };
      
      // Draw prior data (lighter, thinner)
      drawDataset(priorData, 'rgba(136, 132, 216, 0.6)', 2);
      
      // Draw posterior data (darker, thicker)
      drawDataset(posteriorData, 'rgba(130, 202, 157, 1)', 3);
      
      // Add legend
      const legendX = width - padding - 100;
      const legendY = padding + 20;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(legendX - 10, legendY - 15, 120, 60);
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      ctx.strokeRect(legendX - 10, legendY - 15, 120, 60);
      
      // Prior legend item
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(136, 132, 216, 0.6)';
      ctx.lineWidth = 2;
      ctx.moveTo(legendX, legendY);
      ctx.lineTo(legendX + 20, legendY);
      ctx.stroke();
      
      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Prior', legendX + 30, legendY);
      
      // Posterior legend item
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(130, 202, 157, 1)';
      ctx.lineWidth = 3;
      ctx.moveTo(legendX, legendY + 25);
      ctx.lineTo(legendX + 20, legendY + 25);
      ctx.stroke();
      
      ctx.fillStyle = '#333';
      ctx.fillText('Posterior', legendX + 30, legendY + 25);
    }
  }, [priorData, posteriorData, distributionType]);
  
  // UI rendering - update chart containers to ensure proper scaling
  return (
    <div className="bayesian-visualizer">
      <h2 className="text-xl font-bold mb-4">Bayesian Distribution Visualizer</h2>
      
      {/* Distribution selector */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold mb-2">Prior Distribution</h3>
        <div className="mb-4">
          <label className="block mb-2">Distribution Type:</label>
          <select 
            value={distributionType}
            onChange={(e) => setDistributionType(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="beta">Beta Distribution</option>
            <option value="gamma">Gamma Distribution</option>
          </select>
        </div>
        
        {/* Parameter inputs based on distribution type */}
        {distributionType === 'beta' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Alpha (α):</label>
              <input 
                type="number" 
                min="0.1" 
                step="0.1" 
                value={betaAlpha}
                onChange={(e) => setBetaAlpha(parseFloat(e.target.value))}
                className="p-2 border rounded w-full"
              />
              <input 
                type="range" 
                min="0.1" 
                max="10" 
                step="0.1" 
                value={betaAlpha}
                onChange={(e) => setBetaAlpha(parseFloat(e.target.value))}
                className="w-full mt-2"
              />
            </div>
            <div>
              <label className="block mb-2">Beta (β):</label>
              <input 
                type="number" 
                min="0.1" 
                step="0.1" 
                value={betaBeta}
                onChange={(e) => setBetaBeta(parseFloat(e.target.value))}
                className="p-2 border rounded w-full"
              />
              <input 
                type="range" 
                min="0.1" 
                max="10" 
                step="0.1" 
                value={betaBeta}
                onChange={(e) => setBetaBeta(parseFloat(e.target.value))}
                className="w-full mt-2"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Shape (α):</label>
              <input 
                type="number" 
                min="0.1" 
                step="0.1" 
                value={gammaAlpha}
                onChange={(e) => setGammaAlpha(parseFloat(e.target.value))}
                className="p-2 border rounded w-full"
              />
              <input 
                type="range" 
                min="0.1" 
                max="10" 
                step="0.1" 
                value={gammaAlpha}
                onChange={(e) => setGammaAlpha(parseFloat(e.target.value))}
                className="w-full mt-2"
              />
            </div>
            <div>
              <label className="block mb-2">Rate (β):</label>
              <input 
                type="number" 
                min="0.1" 
                step="0.1" 
                value={gammaBeta}
                onChange={(e) => setGammaBeta(parseFloat(e.target.value))}
                className="p-2 border rounded w-full"
              />
              <input 
                type="range" 
                min="0.1" 
                max="10" 
                step="0.1" 
                value={gammaBeta}
                onChange={(e) => setGammaBeta(parseFloat(e.target.value))}
                className="w-full mt-2"
              />
            </div>
          </div>
        )}
        
        {/* Prior distribution chart */}
        <div className="mt-6 w-full" style={{ minHeight: "400px" }}>
          <canvas id="priorChart" className="w-full h-full"></canvas>
        </div>
      </div>
      
      {/* Measurement update section */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold mb-2">Measurement Update</h3>
        
        {distributionType === 'beta' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Number of Successes:</label>
              <input 
                type="number" 
                min="0" 
                step="1" 
                value={successes}
                onChange={(e) => setSuccesses(parseInt(e.target.value))}
                className="p-2 border rounded w-full"
              />
            </div>
            <div>
              <label className="block mb-2">Number of Failures:</label>
              <input 
                type="number" 
                min="0" 
                step="1" 
                value={failures}
                onChange={(e) => setFailures(parseInt(e.target.value))}
                className="p-2 border rounded w-full"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Sum of Observations:</label>
              <input 
                type="number" 
                min="0" 
                step="1" 
                value={successes}
                onChange={(e) => setSuccesses(parseInt(e.target.value))}
                className="p-2 border rounded w-full"
              />
            </div>
            <div>
              <label className="block mb-2">Number of Observations:</label>
              <input 
                type="number" 
                min="1" 
                step="1" 
                value={failures}
                onChange={(e) => setFailures(parseInt(e.target.value))}
                className="p-2 border rounded w-full"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Posterior visualization */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold mb-2">Posterior Distribution</h3>
        
        <div className="w-full" style={{ minHeight: "400px" }}>
          <canvas id="posteriorChart" className="w-full h-full"></canvas>
        </div>
        
        {/* Belief table */}
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Belief Table</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 border">Metric</th>
                  <th className="px-4 py-2 border">Prior</th>
                  <th className="px-4 py-2 border">Posterior</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border font-medium">Mode</td>
                  <td className="px-4 py-2 border">{beliefTable.prior.mode}</td>
                  <td className="px-4 py-2 border">{beliefTable.posterior.mode}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border font-medium">Mean</td>
                  <td className="px-4 py-2 border">{beliefTable.prior.mean}</td>
                  <td className="px-4 py-2 border">{beliefTable.posterior.mean}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border font-medium">Standard Deviation</td>
                  <td className="px-4 py-2 border">{beliefTable.prior.stdDev}</td>
                  <td className="px-4 py-2 border">{beliefTable.posterior.stdDev}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>This interactive tool demonstrates Bayesian updating with conjugate priors. 
        Adjust the parameters to see how prior beliefs combine with new data to form posterior beliefs.</p>
      </div>
    </div>
  );
};

// Remove loading message and render the component
document.querySelector('.loading')?.remove();
const root = ReactDOM.createRoot(document.getElementById('bayesian-viz-root'));
root.render(React.createElement(BayesianVisualizer));