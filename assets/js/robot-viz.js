const RobotArmVisualizer = () => {
    // State for joint angles (in degrees)
    const [joints, setJoints] = React.useState({
        J2: 0,
        J3: 0,
        J5: 0
    });

    // Constants from URDF (in meters)
    const DIMENSIONS = {
        l_base: 0.245,
        l_2: 0.710,
        l_4: 0.540,
        l_5: 0.150
    };

    // Scale factor for visualization
    const SCALE = 200;
    const ORIGIN_X = 150;
    const ORIGIN_Y = 350;

    // Forward kinematics calculation
    const calculatePositions = () => {
        const toRad = (deg) => (deg * Math.PI) / 180;
        
        const base = {
            x: ORIGIN_X,
            y: ORIGIN_Y
        };

        const j2 = {
            x: base.x,
            y: base.y - DIMENSIONS.l_base * SCALE
        };

        const theta2 = toRad(joints.J2);
        const j3 = {
            x: j2.x + DIMENSIONS.l_2 * Math.sin(theta2) * SCALE,
            y: j2.y - DIMENSIONS.l_2 * Math.cos(theta2) * SCALE
        };

        const theta3 = toRad(joints.J3);
        const j5 = {
            x: j3.x + DIMENSIONS.l_4 * Math.sin(theta2 + theta3) * SCALE,
            y: j3.y - DIMENSIONS.l_4 * Math.cos(theta2 + theta3) * SCALE
        };

        const theta5 = toRad(joints.J5);
        const endEffector = {
            x: j5.x + DIMENSIONS.l_5 * Math.sin(theta2 + theta3 + theta5) * SCALE,
            y: j5.y - DIMENSIONS.l_5 * Math.cos(theta2 + theta3 + theta5) * SCALE
        };

        return { base, j2, j3, j5, endEffector };
    };

    const positions = calculatePositions();

    const handleJointChange = (joint, value) => {
        setJoints(prev => ({
            ...prev,
            [joint]: Number(value)
        }));
    };

    return (
        <div className="card w-full max-w-4xl">
            <div className="card-header">
                <h2 className="card-title">FANUC CRX-20iA/L Robot Arm - 2D Configuration (Y-Z Plane)</h2>
            </div>
            <div className="card-content">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/3 space-y-4">
                        {Object.keys(joints).map((joint) => (
                            <div key={joint}>
                                <label className="label">{`${joint} (degrees)`}</label>
                                <input
                                    type="number"
                                    value={joints[joint]}
                                    onChange={(e) => handleJointChange(joint, e.target.value)}
                                    min={joint === "J2" ? -179.9 : joint === "J3" ? -270 : -179.9}
                                    max={joint === "J2" ? 179.9 : joint === "J3" ? 270 : 179.9}
                                    className="input"
                                />
                            </div>
                        ))}
                        <div className="mt-4 p-4 bg-gray-100 rounded-md">
                            <p className="text-sm font-medium">End Effector Position (meters):</p>
                            <p className="text-sm">X: {((positions.endEffector.x - ORIGIN_X) / SCALE).toFixed(3)}</p>
                            <p className="text-sm">Y: {((ORIGIN_Y - positions.endEffector.y) / SCALE).toFixed(3)}</p>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-2/3">
                        <svg className="w-full h-[600px]" viewBox="0 0 500 400">
                            {/* Coordinate System */}
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                                        refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="black"/>
                                </marker>
                            </defs>

                            {/* Axes */}
                            <line x1="50" y1="350" x2="450" y2="350" stroke="black" strokeWidth="2" 
                                  markerEnd="url(#arrowhead)"/>
                            <line x1="50" y1="350" x2="50" y2="50" stroke="black" strokeWidth="2" 
                                  markerEnd="url(#arrowhead)"/>
                            <text x="460" y="365">X</text>
                            <text x="35" y="40">Y</text>

                            {/* Base */}
                            <rect 
                                x={positions.base.x - 20} 
                                y={positions.base.y} 
                                width="40" 
                                height="20" 
                                fill="black"
                            />

                            {/* Robot Links */}
                            <line 
                                x1={positions.base.x}
                                y1={positions.base.y}
                                x2={positions.j2.x}
                                y2={positions.j2.y}
                                stroke="black"
                                strokeWidth="4"
                            />
                            <line 
                                x1={positions.j2.x}
                                y1={positions.j2.y}
                                x2={positions.j3.x}
                                y2={positions.j3.y}
                                stroke="black"
                                strokeWidth="4"
                            />
                            <line 
                                x1={positions.j3.x}
                                y1={positions.j3.y}
                                x2={positions.j5.x}
                                y2={positions.j5.y}
                                stroke="black"
                                strokeWidth="4"
                            />
                            <line 
                                x1={positions.j5.x}
                                y1={positions.j5.y}
                                x2={positions.endEffector.x}
                                y2={positions.endEffector.y}
                                stroke="black"
                                strokeWidth="4"
                            />

                            {/* Joints */}
                            {[positions.j2, positions.j3, positions.j5].map((pos, i) => (
                                <circle
                                    key={`joint-${i}`}
                                    cx={pos.x}
                                    cy={pos.y}
                                    r="6"
                                    fill="white"
                                    stroke="black"
                                    strokeWidth="2"
                                />
                            ))}

                            {/* End Effector */}
                            <circle
                                cx={positions.endEffector.x}
                                cy={positions.endEffector.y}
                                r="8"
                                fill="red"
                            />

                            {/* Joint Labels */}
                            <text x={positions.j2.x - 30} y={positions.j2.y} fill="blue">J2</text>
                            <text x={positions.j3.x + 10} y={positions.j3.y} fill="blue">J3</text>
                            <text x={positions.j5.x + 10} y={positions.j5.y} fill="blue">J5</text>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Remove loading message and render the component
document.querySelector('.loading')?.remove();
const root = ReactDOM.createRoot(document.getElementById('robot-viz-root'));
root.render(<RobotArmVisualizer />);