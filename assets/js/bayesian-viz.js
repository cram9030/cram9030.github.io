const BayesianVisualizer = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Distribution configuration
  const [distributionType, setDistributionType] = React.useState('beta');
  
  // Parameter states
  const [betaAlpha, setBetaAlpha] = React.useState(2);
  const [betaBeta, setBetaBeta] = React.useState(2);
  const [gammaAlpha, setGammaAlpha] = React.useState(2);
  const [gammaBeta, setGammaBeta] = React.useState(1);
  
  // Measurement states
  const [successes, setSuccesses] = React.useState(0);
  const [failures, setFailures] = React.useState(0);
  
  // UI states
  const [probabilityValue, setProbabilityValue] = React.useState(0.5);
  const [probabilityDirection, setProbabilityDirection] = React.useState('greater');
  const [isWideLayout, setIsWideLayout] = React.useState(true);
  const [plotlyDiv, setPlotlyDiv] = React.useState(null);

  // Collapse states for sections
  const [isProbabilityCalcOpen, setIsProbabilityCalcOpen] = React.useState(false);
  const [isRenderingSettingsOpen, setIsRenderingSettingsOpen] = React.useState(false);
  const [isBeliefTableOpen, setIsBeliefTableOpen] = React.useState(false); 

  // Rendering configuration states
  const [renderingConfig, setRenderingConfig] = React.useState({
    dataPoints: 300,           // Number of calculation points
    betaMargin: 0.0033,       // Distance from 0 and 1 for Beta (currently 1/300)
    gammaRangeMultiplier: 5,  // How many times the mean for Gamma max range
    gammaMinStep: true        // Whether to start Gamma from step or from gammaMinX
  });
  
  // Computed states
  const [priorData, setPriorData] = React.useState([]);
  const [posteriorData, setPosteriorData] = React.useState([]);
  const [beliefTable, setBeliefTable] = React.useState({
    prior: { mode: 0, mean: 0, variance: 0, stdDev: 0 },
    posterior: { mode: 0, mean: 0, variance: 0, stdDev: 0 }
  });
  const [probabilityResults, setProbabilityResults] = React.useState({
    prior: 0,
    posterior: 0
  });

  // ============================================================================
  // MATHEMATICAL UTILITIES
  // ============================================================================
  
  const MathUtils = React.useMemo(() => ({
    // Centralized log-gamma function using Stirling's approximation
    gammaLn: (z) => {
      try {
        if (z < 0.5) {
          return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - MathUtils.gammaLn(1 - z);
        }
        
        if (z < 1.5) {
          return MathUtils.gammaLn(z + 1) - Math.log(z);
        }
        
        const logZ = Math.log(z);
        const z2 = z * z;
        const z3 = z2 * z;
        const z5 = z3 * z2;
        
        let result = z * logZ - z - 0.5 * logZ + 0.5 * Math.log(2 * Math.PI);
        result += 1 / (12 * z);
        result -= 1 / (360 * z3);
        result += 1 / (1260 * z5);
        
        return result;
      } catch (error) {
        console.error('Error in gammaLn:', error);
        return 0;
      }
    },

    // Calculate density at a specific point
    calculateDensityAtPoint: (x, alpha, beta, isGamma = false) => {
      try {
        if (isGamma) {
          if (x <= 0) return 0;
          const gammaConstLn = alpha * Math.log(beta) - MathUtils.gammaLn(alpha);
          const logDensity = (alpha - 1) * Math.log(x) - beta * x + gammaConstLn;
          return Math.exp(logDensity);
        } else {
          if (x <= 0 || x >= 1) return 0;
          const betaFuncLn = MathUtils.gammaLn(alpha) + MathUtils.gammaLn(beta) - MathUtils.gammaLn(alpha + beta);
          const logDensity = (alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - betaFuncLn;
          return Math.exp(logDensity);
        }
      } catch (error) {
        console.error('Error calculating density:', error);
        return 0;
      }
    },

    // Format values for display with appropriate precision
    formatValue: (value) => {
      if (typeof value === 'number') {
        if (Math.abs(value) < 0.0000001 && value !== 0) {
          return value.toExponential(10);
        }
        return value.toFixed(12).toString();
      }
      return value;
    }
  }), []);

  // ============================================================================
  // DISTRIBUTION CALCULATORS
  // ============================================================================
  
  const DistributionCalculators = React.useMemo(() => ({
    // Beta distribution calculation
    calculateBetaDistribution: (alpha, beta, points = renderingConfig.dataPoints) => {
      const data = [];
      
      try {
        const betaFuncLn = (a, b) => {
          return MathUtils.gammaLn(a) + MathUtils.gammaLn(b) - MathUtils.gammaLn(a + b);
        };
        
        // Use configurable margin instead of hardcoded 1/points
        const margin = renderingConfig.betaMargin;
        const range = 1 - 2 * margin;  // Total usable range
        const step = range / (points - 1);
        
        for (let i = 0; i < points; i++) {
          const x = margin + (i * step);  // Goes from margin to (1-margin)
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
    },
    
    // Gamma distribution calculation
    calculateGammaDistribution: (alpha, beta, points = renderingConfig.dataPoints) => {
      const data = [];
      
      try {
        // Use configurable range multiplier
        const maxX = (alpha / beta) * renderingConfig.gammaRangeMultiplier;
        const step = maxX / points;
        
        // Start from step (current behavior) or allow custom minimum
        const startX = renderingConfig.gammaMinStep ? step : Math.max(step, 0.001);
        
        for (let x = startX; x <= maxX; x += step) {
          const logDensity = alpha * Math.log(beta) + (alpha - 1) * Math.log(x) - beta * x - MathUtils.gammaLn(alpha);
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
    },

    // Calculate distribution statistics
    calculateBetaStats: (alpha, beta) => {
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
    },
    
    calculateGammaStats: (alpha, beta) => {
      const mode = alpha > 1 ? (alpha - 1) / beta : "Not defined";
      const mean = alpha / beta;
      const variance = alpha / (beta * beta);
      const stdDev = Math.sqrt(variance);
      
      return { mode, mean, variance, stdDev };
    }
  }), [MathUtils, renderingConfig]);

  // ============================================================================
  // PROBABILITY CALCULATORS
  // ============================================================================
  
  const ProbabilityCalculators = React.useMemo(() => ({
    // Beta probability calculation
    calculateBetaProbability: (alpha, beta, x, direction) => {
      if (x <= 0) return direction === 'greater' ? 1 : 0;
      if (x >= 1) return direction === 'greater' ? 0 : 1;

      try {
        // For symmetric Beta(0.5, 0.5), use exact result
        if (Math.abs(alpha - 0.5) < 0.001 && Math.abs(beta - 0.5) < 0.001) {
          const cdf = (2 / Math.PI) * Math.asin(Math.sqrt(x));
          return direction === 'greater' ? 1 - cdf : cdf;
        }
        
        // Simple trapezoidal integration
        const n = 1000;
        const step = x / n;
        let cdf = 0;
        
        const betaConstLn = MathUtils.gammaLn(alpha) + MathUtils.gammaLn(beta) - MathUtils.gammaLn(alpha + beta);
        
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
    },

    // Gamma probability calculation
    calculateGammaProbability: (alpha, beta, x, direction) => {
      if (x <= 0) return direction === 'greater' ? 1 : 0;
      
      try {
        const n = 1000;
        const step = x / n;
        let cdf = 0;
        
        const gammaConstLn = alpha * Math.log(beta) - MathUtils.gammaLn(alpha);
        
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
    },

    // Unified probability calculation
    calculateProbability: (distributionType, params, x, direction) => {
      try {
        if (distributionType === 'beta') {
          const { alpha, beta } = params;
          return ProbabilityCalculators.calculateBetaProbability(alpha, beta, x, direction);
        } else {
          const { alpha, beta } = params;
          return ProbabilityCalculators.calculateGammaProbability(alpha, beta, x, direction);
        }
      } catch (error) {
        console.error('Error calculating probability:', error);
        return 0;
      }
    }
  }), [MathUtils]);

  // ============================================================================
  // PLOTLY CHART UTILITIES
  // ============================================================================
  
  const PlotlyUtils = React.useMemo(() => ({
    // Create Plotly traces from distribution data
    createTraces: (priorData, posteriorData, distributionType, successes, failures) => {
      const hasUpdates = (successes > 0 || failures > 0);
      const traces = [];
      
      // Prior distribution trace
      if (priorData.length > 0) {
        traces.push({
          x: priorData.map(d => d.x),
          y: priorData.map(d => d.y),
          type: 'scatter',
          mode: 'lines',
          name: 'Prior',
          line: {
            color: hasUpdates ? 'rgba(136, 132, 216, 0.6)' : 'rgba(136, 132, 216, 1)',
            width: hasUpdates ? 2 : 3
          },
          hovertemplate: '<b>Prior</b><br>x: %{x:.4f}<br>Density: %{y:.4f}<extra></extra>'
        });
      }
      
      // Posterior distribution trace (only if there are updates)
      if (hasUpdates && posteriorData.length > 0) {
        traces.push({
          x: posteriorData.map(d => d.x),
          y: posteriorData.map(d => d.y),
          type: 'scatter',
          mode: 'lines',
          name: 'Posterior',
          line: {
            color: 'rgba(130, 202, 157, 1)',
            width: 3
          },
          hovertemplate: '<b>Posterior</b><br>x: %{x:.4f}<br>Density: %{y:.4f}<extra></extra>'
        });
      }
      
      return traces;
    },

    // Create Plotly layout
    createLayout: (distributionType) => ({
      title: {
        text: `${distributionType.charAt(0).toUpperCase() + distributionType.slice(1)} Distribution`,
        font: { size: 16, color: '#2c4f6e' }
      },
      xaxis: {
        title: {
          text: 'Parameter Value',
          font: { color: '#333' }
        },
        showgrid: true,
        gridcolor: 'rgba(128,128,128,0.2)',
        zeroline: false
      },
      yaxis: {
        title: {
          text: 'Density', 
          font: { color: '#333' }
        },
        showgrid: true,
        gridcolor: 'rgba(128,128,128,0.2)',
        zeroline: false
      },
      plot_bgcolor: 'white',
      paper_bgcolor: 'rgba(245,245,245,0.8)',
      hovermode: 'closest',
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0.00,
        y: 1.12,
        bgcolor: 'rgba(255,255,255,0.8)',
        bordercolor: 'rgba(128,128,128,0.2)',
        borderwidth: 1
      },
      margin: { t: 100, r: 0, b: 60, l: 50, autoexpand: true },
      font: { family: 'Arial, sans-serif' },
    }),

    // Create Plotly config with custom buttons
    createConfig: (priorData, posteriorData, distributionType, exportUtils) => ({
      modeBarButtonsToAdd: [
        {
          name: 'Export Data as CSV',
          icon: {
            width: 24,
            height: 24,
            path: 'M3,3V21H21V3M12,8L8,12H11V16H13V12H16',
            transform: 'scale(0.7)'
          },
          click: () => {
            exportUtils.exportDataAsCSV(priorData, posteriorData, distributionType);
          }
        }
      ],
      modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'toggleSpikelines','zoomIn2d', 'zoomOut2d'],
      displaylogo: false,
      responsive: true,
      toImageButtonOptions: {
        format: 'png',
        filename: `bayesian-${distributionType}-plot`,
        height: 500,
        width: 700,
        scale: 2
      }
    })
  }), []);

  // ============================================================================
  // EXPORT UTILITIES
  // ============================================================================
  
  const ExportUtils = React.useMemo(() => ({
    // Export current chart as PNG
    exportAsPNG: (filename = 'bayesian-plot.png') => {
      if (plotlyDiv) {
        Plotly.toImage(plotlyDiv, {
          format: 'png',
          width: 800,
          height: 600,
          scale: 2
        }).then((dataUrl) => {
          const link = document.createElement('a');
          link.download = filename;
          link.href = dataUrl;
          link.click();
        });
      }
    },

    // Export data as CSV
    exportDataAsCSV: (priorData, posteriorData, distributionType, filename = 'bayesian-data.csv') => {
      const hasUpdates = posteriorData.length > 0;
      let csvContent = hasUpdates ? 
        'x,prior_density,posterior_density\n' : 
        'x,prior_density\n';
      
      const maxLength = Math.max(priorData.length, posteriorData.length || 0);
      
      for (let i = 0; i < maxLength; i++) {
        const prior = priorData[i];
        const posterior = posteriorData[i];
        
        if (hasUpdates && prior && posterior) {
          csvContent += `${prior.x},${prior.y},${posterior.y}\n`;
        } else if (prior) {
          csvContent += `${prior.x},${prior.y}\n`;
        }
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const link = document.createElement('a');
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      link.click();
    },

    // Export parameters and statistics as JSON
    exportParametersAsJSON: (state, filename = 'bayesian-parameters.json') => {
      const exportData = {
        distributionType: state.distributionType,
        parameters: state.distributionType === 'beta' ? 
          { alpha: state.betaAlpha, beta: state.betaBeta } :
          { alpha: state.gammaAlpha, beta: state.gammaBeta },
        measurements: {
          successes: state.successes,
          failures: state.failures
        },
        beliefTable: state.beliefTable,
        probabilityResults: state.probabilityResults,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      link.click();
    }
  }), [plotlyDiv]);

  // ============================================================================
  // CORE CALCULATIONS
  // ============================================================================
  
  const calculatePosterior = React.useCallback(() => {
    try {
      let priorStats, posteriorStats;
      let priorProb, posteriorProb;
      
      if (distributionType === 'beta') {
        const posteriorAlpha = betaAlpha + successes;
        const posteriorBeta = betaBeta + failures;
        
        priorStats = DistributionCalculators.calculateBetaStats(betaAlpha, betaBeta);
        posteriorStats = DistributionCalculators.calculateBetaStats(posteriorAlpha, posteriorBeta);
        
        priorProb = ProbabilityCalculators.calculateProbability('beta', { alpha: betaAlpha, beta: betaBeta }, 
                                       probabilityValue, probabilityDirection);
        posteriorProb = ProbabilityCalculators.calculateProbability('beta', { alpha: posteriorAlpha, beta: posteriorBeta }, 
                                           probabilityValue, probabilityDirection);
        
        setPriorData(DistributionCalculators.calculateBetaDistribution(betaAlpha, betaBeta));
        setPosteriorData(DistributionCalculators.calculateBetaDistribution(posteriorAlpha, posteriorBeta));
      } else {
        const observedSum = successes;
        const observedCount = failures;
        
        const posteriorAlpha = gammaAlpha + observedSum;
        const posteriorBeta = gammaBeta + observedCount;
        
        priorStats = DistributionCalculators.calculateGammaStats(gammaAlpha, gammaBeta);
        posteriorStats = DistributionCalculators.calculateGammaStats(posteriorAlpha, posteriorBeta);
        
        priorProb = ProbabilityCalculators.calculateProbability('gamma', { alpha: gammaAlpha, beta: gammaBeta }, 
                                       probabilityValue, probabilityDirection);
        posteriorProb = ProbabilityCalculators.calculateProbability('gamma', { alpha: posteriorAlpha, beta: posteriorBeta }, 
                                           probabilityValue, probabilityDirection);
        
        setPriorData(DistributionCalculators.calculateGammaDistribution(gammaAlpha, gammaBeta));
        setPosteriorData(DistributionCalculators.calculateGammaDistribution(posteriorAlpha, posteriorBeta));
      }
      
      setBeliefTable({
        prior: {
          mode: MathUtils.formatValue(priorStats.mode),
          mean: MathUtils.formatValue(priorStats.mean),
          variance: MathUtils.formatValue(priorStats.variance),
          stdDev: MathUtils.formatValue(priorStats.stdDev)
        },
        posterior: {
          mode: MathUtils.formatValue(posteriorStats.mode),
          mean: MathUtils.formatValue(posteriorStats.mean),
          variance: MathUtils.formatValue(posteriorStats.variance),
          stdDev: MathUtils.formatValue(posteriorStats.stdDev)
        }
      });
      
      setProbabilityResults({
        prior: MathUtils.formatValue(priorProb),
        posterior: MathUtils.formatValue(posteriorProb)
      });
      
    } catch (error) {
      console.error('Error calculating posterior:', error);
    }
  }, [
    distributionType, betaAlpha, betaBeta, gammaAlpha, gammaBeta, 
    successes, failures, probabilityValue, probabilityDirection,
    DistributionCalculators, ProbabilityCalculators, MathUtils,
    renderingConfig
  ]);

  // ============================================================================
  // UI COMPONENTS
  // ============================================================================
  
  const DistributionControls = React.useMemo(() => (
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
  ), [distributionType, betaAlpha, betaBeta, gammaAlpha, gammaBeta]);

  const MeasurementControls = React.useMemo(() => (
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
  ), [distributionType, successes, failures]);

  const ProbabilityCalculator = React.useMemo(() => (
    <div className="p-4 bg-gray-100 rounded">
      <h3 
        className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between hover:text-blue-600"
        onClick={() => setIsProbabilityCalcOpen(!isProbabilityCalcOpen)}
      >
        Probability Calculator
        <span className={`transform transition-transform ${isProbabilityCalcOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </h3>
      
      {isProbabilityCalcOpen && (
        <>
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
        </>
      )}
    </div>
  ), [distributionType, probabilityValue, probabilityDirection, probabilityResults, isProbabilityCalcOpen]);

  const RenderingControls = React.useMemo(() => (
    <div className="p-4 bg-gray-100 rounded">
      <h3 
        className="text-lg font-semibold mb-2 cursor-pointer flex items-center justify-between hover:text-blue-600"
        onClick={() => setIsRenderingSettingsOpen(!isRenderingSettingsOpen)}
      >
        Rendering Settings
        <span className={`transform transition-transform ${isRenderingSettingsOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </h3>
      
      {isRenderingSettingsOpen && (
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Data Points:</label>
            <div className="flex gap-2 items-center">
              <input 
                type="number" 
                min="50" 
                max="1000" 
                step="50" 
                value={renderingConfig.dataPoints}
                onChange={(e) => setRenderingConfig(prev => ({
                  ...prev,
                  dataPoints: parseInt(e.target.value) || 300
                }))}
                className="p-2 border rounded w-24"
              />
              <input 
                type="range" 
                min="50" 
                max="1000" 
                step="50" 
                value={renderingConfig.dataPoints}
                onChange={(e) => setRenderingConfig(prev => ({
                  ...prev,
                  dataPoints: parseInt(e.target.value)
                }))}
                className="flex-1"
              />
            </div>
            <div className="text-xs text-gray-600 mt-1">
              More points = smoother curves, slower rendering
            </div>
          </div>
          
          {distributionType === 'beta' && (
            <div>
              <label className="block mb-2">Distance from boundaries:</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="number" 
                  min="0.0001" 
                  max="0.01" 
                  step="0.0001" 
                  value={renderingConfig.betaMargin}
                  onChange={(e) => setRenderingConfig(prev => ({
                    ...prev,
                    betaMargin: parseFloat(e.target.value) || 0.0033
                  }))}
                  className="p-2 border rounded w-24 text-sm"
                />
                <input 
                  type="range" 
                  min="0.0001" 
                  max="0.01" 
                  step="0.0001" 
                  value={renderingConfig.betaMargin}
                  onChange={(e) => setRenderingConfig(prev => ({
                    ...prev,
                    betaMargin: parseFloat(e.target.value)
                  }))}
                  className="flex-1"
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Range: {renderingConfig.betaMargin.toFixed(4)} to {(1 - renderingConfig.betaMargin).toFixed(4)}
              </div>
            </div>
          )}
          
          {distributionType === 'gamma' && (
            <div>
              <label className="block mb-2">Range Multiplier: {renderingConfig.gammaRangeMultiplier}× mean</label>
              <input 
                type="range" 
                min="2" 
                max="10" 
                step="0.5" 
                value={renderingConfig.gammaRangeMultiplier}
                onChange={(e) => setRenderingConfig(prev => ({
                  ...prev,
                  gammaRangeMultiplier: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
              <div className="text-xs text-gray-600 mt-1">
                Current mean: {distributionType === 'gamma' ? (gammaAlpha / gammaBeta).toFixed(2) : 'N/A'}, 
                Max X: {distributionType === 'gamma' ? ((gammaAlpha / gammaBeta) * renderingConfig.gammaRangeMultiplier).toFixed(2) : 'N/A'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  ), [
    renderingConfig, distributionType, gammaAlpha, gammaBeta, 
    isRenderingSettingsOpen
  ]);

  const BeliefTable = React.useMemo(() => (
    <div className="mt-6">
      <h4 
        className="font-semibold mb-2 cursor-pointer flex items-center justify-between hover:text-blue-600"
        onClick={() => setIsBeliefTableOpen(!isBeliefTableOpen)}
      >
        Belief Table
        <span className={`transform transition-transform ${isBeliefTableOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </h4>
      
      {isBeliefTableOpen && (
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
      )}
    </div>
  ), [beliefTable, isBeliefTableOpen]);

  // ============================================================================
  // EFFECTS AND LIFECYCLE
  // ============================================================================
  
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
  
  // Plotly chart rendering effect
  React.useEffect(() => {
    const plotDiv = document.getElementById('plotly-chart');
    if (!plotDiv || priorData.length === 0) return;

    try {
      const traces = PlotlyUtils.createTraces(priorData, posteriorData, distributionType, successes, failures);
      const layout = PlotlyUtils.createLayout(distributionType);
      const config = PlotlyUtils.createConfig(priorData, posteriorData, distributionType, ExportUtils);

      // Create or update the plot
      if (plotlyDiv === plotDiv) {
        // Update existing plot (faster)
        Plotly.react(plotDiv, traces, layout, config);
      } else {
        // Create new plot
        Plotly.newPlot(plotDiv, traces, layout, config);
        setPlotlyDiv(plotDiv);
      }
    } catch (error) {
      console.error('Error creating Plotly chart:', error);
    }
  }, [priorData, posteriorData, distributionType, successes, failures, PlotlyUtils, ExportUtils, plotlyDiv]);

  // Plotly cleanup effect
  React.useEffect(() => {
    return () => {
      const plotDiv = document.getElementById('plotly-chart');
      if (plotDiv && plotlyDiv === plotDiv) {
        Plotly.purge(plotDiv);
      }
    };
  }, [plotlyDiv]);

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className="bayesian-visualizer">
      <h2 className="text-xl font-bold mb-4">Bayesian Distribution Visualizer</h2>
      
      <div className={`flex ${isWideLayout ? 'flex-row' : 'flex-col'} gap-4`}>
        {/* Left side - Controls */}
        <div className={`${isWideLayout ? 'w-1/4' : 'w-full'} space-y-4`}>
          {DistributionControls}
          {MeasurementControls}
          {ProbabilityCalculator}
          {RenderingControls}
        </div>
        
        {/* Right side - Visualizations */}
        <div className={`${isWideLayout ? 'w-3/4' : 'w-full'} space-y-4`}>
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold mb-2">Distributions</h3>
            
            <div id="plotly-chart" style={{ width: '100%', height: '655px' }}></div>
            
            {BeliefTable}
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