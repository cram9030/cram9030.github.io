const BayesianVisualizer = () => {
  console.log('React component initializing...');
  
  // State for distribution type
  const [distributionType, setDistributionType] = React.useState('beta');
  
  // States for Beta distribution parameters
  const [betaAlpha, setBetaAlpha] = React.useState(2);
  const [betaBeta, setBetaBeta] = React.useState(2);
  
  // States for Gamma distribution parameters
  const [gammaAlpha, setGammaAlpha] = React.useState(2);
  const [gammaBeta, setGammaBeta] = React.useState(1);
  
  // Measurement states
  const [successes, setSuccesses] = React.useState(0);
  const [failures, setFailures] = React.useState(0);
  
  // Probability calculator states
  const [probabilityValue, setProbabilityValue] = React.useState(0.5);
  const [probabilityDirection, setProbabilityDirection] = React.useState('greater');
  const [probabilityResults, setProbabilityResults] = React.useState({
    prior: 0,
    posterior: 0
  });
  
  // Posterior states
  const [posteriorData, setPosteriorData] = React.useState([]);
  const [priorData, setPriorData] = React.useState([]);
  const [beliefTable, setBeliefTable] = React.useState({
    prior: { mode: 0, mean: 0, variance: 0, stdDev: 0 },
    posterior: { mode: 0, mean: 0, variance: 0, stdDev: 0 }
  });
  
  // Layout state
  const [isWideLayout, setIsWideLayout] = React.useState(true);
  
  // State for mouse hover
  const [hoverInfo, setHoverInfo] = React.useState(null);

  console.log('State initialized, defining functions...');

  // Centralized, accurate log-gamma function using Stirling's approximation
  const gammaLn = React.useCallback((z) => {
    try {
      // For small z, use reflection formula: Γ(z)Γ(1-z) = π/sin(πz)
      if (z < 0.5) {
        return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - gammaLn(1 - z);
      }
      
      // For z < 1, use the recurrence relation: Γ(z+1) = z*Γ(z)
      // Therefore: ln(Γ(z)) = ln(Γ(z+1)) - ln(z)
      if (z < 1.5) {
        return gammaLn(z + 1) - Math.log(z);  // FIXED: Was backwards!
      }
      
      // Apply Stirling's approximation for larger values
      const logZ = Math.log(z);
      const z2 = z * z;
      const z3 = z2 * z;
      const z5 = z3 * z2;
      
      // Main Stirling terms
      let result = z * logZ - z - 0.5 * logZ + 0.5 * Math.log(2 * Math.PI);
      
      // Asymptotic series using Bernoulli numbers
      result += 1 / (12 * z);
      result -= 1 / (360 * z3);
      result += 1 / (1260 * z5);
      
      return result;
    } catch (error) {
      console.error('Error in gammaLn:', error);
      return 0;
    }
  }, []);

  // Direct verification for Beta(0.5, 0.5) density
  const verifyBeta05Density = React.useCallback(() => {
    // For Beta(0.5, 0.5), the exact density at x=0.5 is 2/π ≈ 0.6366
    const expectedDensity = 2 / Math.PI;
    
    // Calculate using our formula
    const gamma05_exact = Math.log(Math.sqrt(Math.PI)); // ln(Γ(0.5)) = ln(√π)
    const gamma1_exact = 0; // ln(Γ(1)) = ln(1) = 0
    const betaFunc_exact = gamma05_exact + gamma05_exact - gamma1_exact; // ln(B(0.5,0.5))
    
    const logDensity_exact = (0.5 - 1) * Math.log(0.5) + (0.5 - 1) * Math.log(0.5) - betaFunc_exact;
    const density_exact = Math.exp(logDensity_exact);
    
    // Calculate using our gammaLn function
    const gamma05_calc = gammaLn(0.5);
    const gamma1_calc = gammaLn(1.0);
    const betaFunc_calc = gamma05_calc + gamma05_calc - gamma1_calc;
    
    const logDensity_calc = (0.5 - 1) * Math.log(0.5) + (0.5 - 1) * Math.log(0.5) - betaFunc_calc;
    const density_calc = Math.exp(logDensity_calc);
    
    console.log('=== Beta(0.5, 0.5) Density Verification ===');
    console.log(`Expected density at x=0.5: ${expectedDensity.toFixed(6)}`);
    console.log('');
    console.log('Exact calculation:');
    console.log(`  ln(Γ(0.5)) = ln(√π) = ${gamma05_exact.toFixed(6)}`);
    console.log(`  ln(B(0.5,0.5)) = ${betaFunc_exact.toFixed(6)}`);
    console.log(`  logDensity = ${logDensity_exact.toFixed(6)}`);
    console.log(`  density = ${density_exact.toFixed(6)}`);
    console.log('');
    console.log('Our calculation:');
    console.log(`  gammaLn(0.5) = ${gamma05_calc.toFixed(6)}`);
    console.log(`  ln(B(0.5,0.5)) = ${betaFunc_calc.toFixed(6)}`);
    console.log(`  logDensity = ${logDensity_calc.toFixed(6)}`);
    console.log(`  density = ${density_calc.toFixed(6)}`);
    console.log('');
    console.log(`Ratio (ours/expected): ${(density_calc / expectedDensity).toFixed(6)}`);
    
    return { expected: expectedDensity, calculated: density_calc };
  }, [gammaLn]);

  // Helper function to calculate density at a specific point
  const calculateDensityAtPoint = React.useCallback((x, alpha, beta, isGamma = false) => {
    try {
      if (isGamma) {
        if (x <= 0) return 0;
        const gammaConstLn = alpha * Math.log(beta) - gammaLn(alpha);
        const logDensity = (alpha - 1) * Math.log(x) - beta * x + gammaConstLn;
        return Math.exp(logDensity);
      } else {
        if (x <= 0 || x >= 1) return 0;
        const betaFuncLn = gammaLn(alpha) + gammaLn(beta) - gammaLn(alpha + beta);
        const logDensity = (alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - betaFuncLn;
        return Math.exp(logDensity);
      }
    } catch (error) {
      console.error('Error calculating density:', error);
      return 0;
    }
  }, [gammaLn]);

  // Helper functions to calculate distributions
  const calculateBetaDistribution = React.useCallback((alpha, beta, points = 300) => {
    const data = [];
    
    try {
      const betaFuncLn = (a, b) => {
        return gammaLn(a) + gammaLn(b) - gammaLn(a + b);
      };
      
      // Simple uniform spacing, avoiding exact boundaries
      for (let i = 1; i < points; i++) {
        const x = i / points; // This gives us points from 1/points to (points-1)/points
        
        const logDensity = (alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - betaFuncLn(alpha, beta);
        const density = Math.exp(logDensity);
        
        if (isFinite(density) && density >= 0) {
          data.push({
            x: parseFloat(x.toFixed(6)),
            y: density
          });
        }
      }
      
    } catch (error) {
      console.error('Error calculating beta distribution:', error);
    }
    
    return data;
  }, [gammaLn]);
  
  const calculateGammaDistribution = React.useCallback((alpha, beta, points = 300) => {
    const data = [];
    
    try {
      const maxX = alpha / beta * 5;
      const step = maxX / points;
      
      for (let x = step; x < maxX; x += step) {
        const logDensity = alpha * Math.log(beta) + (alpha - 1) * Math.log(x) - beta * x - gammaLn(alpha);
        const density = Math.exp(logDensity);
        
        if (isFinite(density) && density >= 0) {
          data.push({
            x: parseFloat(x.toFixed(6)),
            y: density
          });
        }
      }
      
    } catch (error) {
      console.error('Error calculating gamma distribution:', error);
    }
    
    return data;
  }, [gammaLn]);
  
  // Calculate statistics for the Beta distribution with high precision
  const calculateBetaStats = React.useCallback((alpha, beta) => {
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
    
    return { mode, mean, variance, stdDev };
  }, []);
  
  // Calculate statistics for the Gamma distribution with high precision
  const calculateGammaStats = React.useCallback((alpha, beta) => {
    const mode = alpha > 1 ? (alpha - 1) / beta : "Not defined";
    const mean = alpha / beta;
    const variance = alpha / (beta * beta);
    const stdDev = Math.sqrt(variance);
    
    return { mode, mean, variance, stdDev };
  }, []);

  // Simplified probability calculation for Beta
  const calculateBetaProbability = React.useCallback((alpha, beta, x, direction) => {
    if (x <= 0) return direction === 'greater' ? 1 : 0;
    if (x >= 1) return direction === 'greater' ? 0 : 1;

    try {
      // For symmetric Beta(0.5, 0.5), use exact result
      if (Math.abs(alpha - 0.5) < 0.001 && Math.abs(beta - 0.5) < 0.001) {
        // For arcsine distribution, CDF = (2/π) * arcsin(√x)
        const cdf = (2 / Math.PI) * Math.asin(Math.sqrt(x));
        return direction === 'greater' ? 1 - cdf : cdf;
      }
      
      // Simple trapezoidal integration
      const n = 1000;
      const step = x / n;
      let cdf = 0;
      
      const betaConstLn = gammaLn(alpha) + gammaLn(beta) - gammaLn(alpha + beta);
      
      for (let i = 1; i < n; i++) {
        const xi = i * step;
        const logPdf = (alpha - 1) * Math.log(xi) + (beta - 1) * Math.log(1 - xi) - betaConstLn;
        const pdf = Math.exp(logPdf);
        if (isFinite(pdf)) {
          cdf += pdf * step;
        }
      }
      
      cdf = Math.max(0, Math.min(1, cdf));
      return direction === 'greater' ? 1 - cdf : cdf;
    } catch (error) {
      console.error('Error in beta probability:', error);
      return 0.5;
    }
  }, [gammaLn]);

  // Simplified probability calculation for Gamma
  const calculateGammaProbability = React.useCallback((alpha, beta, x, direction) => {
    if (x <= 0) return direction === 'greater' ? 1 : 0;
    
    try {
      const n = 1000;
      const step = x / n;
      let cdf = 0;
      
      const gammaConstLn = alpha * Math.log(beta) - gammaLn(alpha);
      
      for (let i = 1; i < n; i++) {
        const xi = i * step;
        const logPdf = (alpha - 1) * Math.log(xi) - beta * xi + gammaConstLn;
        const pdf = Math.exp(logPdf);
        if (isFinite(pdf)) {
          cdf += pdf * step;
        }
      }
      
      cdf = Math.max(0, Math.min(1, cdf));
      return direction === 'greater' ? 1 - cdf : cdf;
    } catch (error) {
      console.error('Error in gamma probability:', error);
      return 0.5;
    }
  }, [gammaLn]);

  // Calculate probability wrapper
  const calculateProbability = React.useCallback((distributionType, params, x, direction) => {
    try {
      if (distributionType === 'beta') {
        const { alpha, beta } = params;
        return calculateBetaProbability(alpha, beta, x, direction);
      } else {
        const { alpha, beta } = params;
        return calculateGammaProbability(alpha, beta, x, direction);
      }
    } catch (error) {
      console.error('Error calculating probability:', error);
      return 0;
    }
  }, [calculateBetaProbability, calculateGammaProbability]);
  
  // Calculate the posterior distribution and probabilities
  const calculatePosterior = React.useCallback(() => {
    try {
      let priorStats, posteriorStats;
      let priorProb, posteriorProb;
      
      if (distributionType === 'beta') {
        const posteriorAlpha = betaAlpha + successes;
        const posteriorBeta = betaBeta + failures;
        
        priorStats = calculateBetaStats(betaAlpha, betaBeta);
        posteriorStats = calculateBetaStats(posteriorAlpha, posteriorBeta);
        
        priorProb = calculateProbability('beta', { alpha: betaAlpha, beta: betaBeta }, 
                                       probabilityValue, probabilityDirection);
        posteriorProb = calculateProbability('beta', { alpha: posteriorAlpha, beta: posteriorBeta }, 
                                           probabilityValue, probabilityDirection);
        
        setPriorData(calculateBetaDistribution(betaAlpha, betaBeta));
        setPosteriorData(calculateBetaDistribution(posteriorAlpha, posteriorBeta));
      } else {
        const observedSum = successes;
        const observedCount = failures;
        
        const posteriorAlpha = gammaAlpha + observedSum;
        const posteriorBeta = gammaBeta + observedCount;
        
        priorStats = calculateGammaStats(gammaAlpha, gammaBeta);
        posteriorStats = calculateGammaStats(posteriorAlpha, posteriorBeta);
        
        priorProb = calculateProbability('gamma', { alpha: gammaAlpha, beta: gammaBeta }, 
                                       probabilityValue, probabilityDirection);
        posteriorProb = calculateProbability('gamma', { alpha: posteriorAlpha, beta: posteriorBeta }, 
                                           probabilityValue, probabilityDirection);
        
        setPriorData(calculateGammaDistribution(gammaAlpha, gammaBeta));
        setPosteriorData(calculateGammaDistribution(posteriorAlpha, posteriorBeta));
      }

      // Format values for display with high precision
      const formatValue = (value) => {
        if (typeof value === 'number') {
          if (Math.abs(value) < 0.0000001 && value !== 0) {
            return value.toExponential(10);
          }
          return value.toString();
        }
        return value;
      };
      
      setBeliefTable({
        prior: {
          mode: formatValue(priorStats.mode),
          mean: formatValue(priorStats.mean),
          variance: formatValue(priorStats.variance),
          stdDev: formatValue(priorStats.stdDev)
        },
        posterior: {
          mode: formatValue(posteriorStats.mode),
          mean: formatValue(posteriorStats.mean),
          variance: formatValue(posteriorStats.variance),
          stdDev: formatValue(posteriorStats.stdDev)
        }
      });
      
      setProbabilityResults({
        prior: formatValue(priorProb),
        posterior: formatValue(posteriorProb)
      });
      
    } catch (error) {
      console.error('Error calculating posterior:', error);
    }
  }, [
    distributionType, betaAlpha, betaBeta, gammaAlpha, gammaBeta, 
    successes, failures, probabilityValue, probabilityDirection,
    calculateBetaStats, calculateGammaStats, calculateProbability,
    calculateBetaDistribution, calculateGammaDistribution
  ]);
  
  // Function to set up high-resolution canvas
  const setupCanvas = React.useCallback((canvas) => {
    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    const computedStyle = window.getComputedStyle(parent);
    const width = parseInt(computedStyle.width, 10) - parseInt(computedStyle.paddingLeft, 10) - parseInt(computedStyle.paddingRight, 10);
    const height = 400;
    
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    return { ctx, width, height };
  }, []);
  
  // Check screen orientation on mount and resize
  React.useEffect(() => {
    const checkOrientation = () => {
      setIsWideLayout(window.innerWidth > window.innerHeight);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);
  
  // Effect to recalculate when parameters change
  React.useEffect(() => {
    calculatePosterior();
  }, [calculatePosterior]);
  
  // Simplified chart drawing effect with mouse hover
  React.useEffect(() => {
    if (priorData.length === 0) return;
    
    const canvas = document.getElementById('distributionChart');
    if (!canvas) return;
    
    let mouseCleanup = null;
    
    try {
      const { ctx, width, height } = setupCanvas(canvas);
      ctx.clearRect(0, 0, width, height);
      
      const hasUpdates = (successes > 0 || failures > 0);
      const padding = 40;
      const chartWidth = width - 2 * padding;
      const chartHeight = height - 2 * padding;
      
      // Calculate y-axis scaling from actual data
      let maxY = 0;
      const datasetsToCheck = hasUpdates ? [priorData, posteriorData] : [priorData];
      for (const dataset of datasetsToCheck) {
        for (const point of dataset) {
          if (isFinite(point.y) && point.y > maxY) {
            maxY = point.y;
          }
        }
      }
      maxY *= 1.1; // Add 10% padding
      
      // Set up mouse event handlers
      const handleMouseMove = (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Check if mouse is within chart area
        if (mouseX >= padding && mouseX <= width - padding && 
            mouseY >= padding && mouseY <= height - padding) {
          
          let dataX, dataY;
          
          if (distributionType === 'beta') {
            dataX = (mouseX - padding) / chartWidth;
          } else {
            const maxDataX = Math.max(
              priorData[priorData.length - 1]?.x || 0,
              hasUpdates ? (posteriorData[posteriorData.length - 1]?.x || 0) : 0
            );
            dataX = ((mouseX - padding) / chartWidth) * maxDataX;
          }
          
          // Find the closest actual data point to get the real density value
          let closestDensity = 0;
          const datasets = hasUpdates ? [priorData, posteriorData] : [priorData];
          
          for (const dataset of datasets) {
            for (const point of dataset) {
              const pointScreenX = distributionType === 'beta' ? 
                padding + (point.x * chartWidth) :
                padding + (point.x / Math.max(
                  priorData[priorData.length - 1]?.x || 0,
                  hasUpdates ? (posteriorData[posteriorData.length - 1]?.x || 0) : 0
                )) * chartWidth;
              
              // If this point is close to the mouse X position, use its density
              if (Math.abs(pointScreenX - mouseX) < 5) { // Within 5 pixels
                closestDensity = Math.max(closestDensity, point.y);
              }
            }
          }
          
          // If we found a close point, use its density, otherwise calculate from mouse position
          if (closestDensity > 0) {
            dataY = closestDensity;
          } else {
            // Fallback to coordinate conversion
            dataY = ((height - padding - mouseY) / chartHeight) * maxY;
          }
          
          setHoverInfo({
            x: dataX.toFixed(4),
            y: dataY.toFixed(4),
            mouseX: mouseX,
            mouseY: mouseY
          });
        } else {
          setHoverInfo(null);
        }
      };
      
      const handleMouseLeave = () => {
        setHoverInfo(null);
      };
      
      // Add event listeners
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
      
      // Set up cleanup function
      mouseCleanup = () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      };
      
      // Draw axes
      ctx.beginPath();
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.moveTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.moveTo(padding, height - padding);
      ctx.lineTo(padding, padding);
      ctx.stroke();
      
      // X-axis ticks
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      
      const xTicks = distributionType === 'beta' ? 5 : 10;
      for (let i = 0; i <= xTicks; i++) {
        const x = padding + (i / xTicks) * chartWidth;
        const tickValue = distributionType === 'beta' ? 
          (i / xTicks) : 
          (i / xTicks) * Math.max(
            priorData[priorData.length - 1]?.x || 0,
            hasUpdates ? (posteriorData[posteriorData.length - 1]?.x || 0) : 0
          );
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
        const tickValue = (i / 5) * maxY;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding - 5, y);
        ctx.stroke();
        ctx.fillText(tickValue.toFixed(2), padding - 8, y);
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
        if (data.length === 0) return;
        
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        let firstPoint = true;
        
        for (let i = 0; i < data.length; i++) {
          const point = data[i];
          
          let x, y;
          if (distributionType === 'beta') {
            x = padding + (point.x * chartWidth);
          } else {
            const maxX = Math.max(
              priorData[priorData.length - 1]?.x || 0,
              posteriorData[posteriorData.length - 1]?.x || 0
            );
            x = padding + (point.x / maxX) * chartWidth;
          }
          
          y = height - padding - ((point.y / maxY) * chartHeight);
          
          if (firstPoint) {
            ctx.moveTo(x, y);
            firstPoint = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      };
      
      if (hasUpdates) {
        drawDataset(priorData, 'rgba(136, 132, 216, 0.6)', 2);
        drawDataset(posteriorData, 'rgba(130, 202, 157, 1)', 3);
        
        // Legend
        const legendX = width - padding - 100;
        const legendY = padding + 20;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(legendX - 10, legendY - 15, 120, 60);
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX - 10, legendY - 15, 120, 60);
        
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
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(130, 202, 157, 1)';
        ctx.lineWidth = 3;
        ctx.moveTo(legendX, legendY + 25);
        ctx.lineTo(legendX + 20, legendY + 25);
        ctx.stroke();
        
        ctx.fillStyle = '#333';
        ctx.fillText('Posterior', legendX + 30, legendY + 25);
      } else {
        drawDataset(priorData, 'rgba(136, 132, 216, 1)', 3);
        
        // Legend
        const legendX = width - padding - 100;
        const legendY = padding + 20;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(legendX - 10, legendY - 15, 120, 40);
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX - 10, legendY - 15, 120, 40);
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(136, 132, 216, 1)';
        ctx.lineWidth = 3;
        ctx.moveTo(legendX, legendY);
        ctx.lineTo(legendX + 20, legendY);
        ctx.stroke();
        
        ctx.fillStyle = '#333';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('Prior', legendX + 30, legendY);
      }
      
    } catch (error) {
      console.error('Error drawing chart:', error);
    }
    
    // Return cleanup function
    return mouseCleanup;
  }, [priorData, posteriorData, distributionType, successes, failures, setupCanvas]);
  
  // UI rendering with responsive layout
  return (
    <div className="bayesian-visualizer">
      <h2 className="text-xl font-bold mb-4">Bayesian Distribution Visualizer</h2>
      
      <div className={`flex ${isWideLayout ? 'flex-row' : 'flex-col'} gap-4`}>
        {/* Left side - Controls */}
        <div className={`${isWideLayout ? 'w-1/3' : 'w-full'} space-y-4`}>
          {/* Distribution selector */}
          <div className="p-4 bg-gray-100 rounded">
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
              <div className="space-y-4">
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
              <div className="space-y-4">
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
          </div>
          
          {/* Measurement update section */}
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold mb-2">Measurement Update</h3>
            
            {distributionType === 'beta' ? (
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
          
          {/* Probability Calculator */}
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold mb-2">Probability Calculator</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Value:</label>
                <input 
                  type="number" 
                  min="0" 
                  max={distributionType === 'beta' ? 1 : undefined}
                  step="0.01" 
                  value={probabilityValue}
                  onChange={(e) => setProbabilityValue(parseFloat(e.target.value))}
                  className="p-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block mb-2">Direction:</label>
                <select 
                  value={probabilityDirection}
                  onChange={(e) => setProbabilityDirection(e.target.value)}
                  className="p-2 border rounded w-full"
                >
                  <option value="less">P(X &lt; x)</option>
                  <option value="greater">P(X &gt; x)</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 bg-gray-50 p-3 rounded">
              <h4 className="font-medium mb-2">Probability Results:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm text-gray-600">Prior:</span>
                  <span className="font-mono">{probabilityResults.prior}</span>
                </div>
                <div>
                  <span className="block text-sm text-gray-600">Posterior:</span>
                  <span className="font-mono">{probabilityResults.posterior}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Visualizations */}
        <div className={`${isWideLayout ? 'w-2/3' : 'w-full'} space-y-4`}>
          {/* Distribution visualization */}
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold mb-2">Distributions</h3>
            
            <div className="w-full" style={{ minHeight: "400px", position: "relative" }}>
              <canvas id="distributionChart" className="w-full h-full"></canvas>
              
              {/* Hover tooltip */}
              {hoverInfo && (
                <div 
                  className="absolute bg-black text-white px-2 py-1 rounded text-sm pointer-events-none z-10"
                  style={{
                    left: `${hoverInfo.mouseX + 10}px`,
                    top: `${hoverInfo.mouseY - 30}px`,
                    transform: hoverInfo.mouseX > 300 ? 'translateX(-100%)' : 'none'
                  }}
                >
                  x: {hoverInfo.x}, y: {hoverInfo.y}
                </div>
              )}
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
                      <td className="px-4 py-2 border font-mono">{beliefTable.prior.mode}</td>
                      <td className="px-4 py-2 border font-mono">{beliefTable.posterior.mode}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border font-medium">Mean</td>
                      <td className="px-4 py-2 border font-mono">{beliefTable.prior.mean}</td>
                      <td className="px-4 py-2 border font-mono">{beliefTable.posterior.mean}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border font-medium">Variance</td>
                      <td className="px-4 py-2 border font-mono">{beliefTable.prior.variance}</td>
                      <td className="px-4 py-2 border font-mono">{beliefTable.posterior.variance}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border font-medium">Standard Deviation</td>
                      <td className="px-4 py-2 border font-mono">{beliefTable.prior.stdDev}</td>
                      <td className="px-4 py-2 border font-mono">{beliefTable.posterior.stdDev}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mt-4">
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