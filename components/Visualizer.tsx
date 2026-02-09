
import React, { useMemo, useEffect } from 'react';
import { BeliefState } from '../types';
import { soundService } from '../services/soundService';

interface VisualizerProps {
    state: BeliefState;
    isThinking?: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ state, isThinking }) => {
    useEffect(() => {
        if (state.cognitiveDissonance > 0.5) {
            soundService.playDissonance(state.cognitiveDissonance);
        }
    }, [state.cognitiveDissonance]);

    const points = useMemo(() => {
        const count = isThinking ? 64 : 32;
        const radius = isThinking ? 115 : 100;
        const center = 150;
        const pts = [];
        
        // Intensity scaling for "Reality Collapse"
        const intensity = Math.pow(state.cognitiveDissonance, 2);
        const noise = (state.physicalMetrics.entropy * 30) + (intensity * 120);
        const symmetryFactor = state.physicalMetrics.symmetry;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const jitterX = (Math.random() - 0.5) * noise * (1.2 - symmetryFactor);
            const jitterY = (Math.random() - 0.5) * noise * (1.2 - symmetryFactor);
            
            // Add "Logic Breach" spike if dissonance is critical
            const spike = (state.cognitiveDissonance > 0.8 && i % 4 === 0) ? (Math.random() * 40 * intensity) : 0;
            
            const x = center + Math.cos(angle) * (radius + spike) + jitterX;
            const y = center + Math.sin(angle) * (radius + spike) + jitterY;
            pts.push({ x, y });
        }
        return pts;
    }, [state.physicalMetrics.entropy, state.physicalMetrics.symmetry, state.cognitiveDissonance, isThinking]);

    const glitchStyle = state.cognitiveDissonance > 0.7 
        ? { filter: `url(#chromaticAberration) url(#glitch)` } 
        : {};

    return (
        <div className="w-full h-full flex items-center justify-center relative bg-black border border-emerald-900/10 group overflow-hidden transition-all duration-700">
            {/* Background Glitch Layer */}
            {state.cognitiveDissonance > 0.75 && (
                <div className="absolute inset-0 z-0 opacity-10 mix-blend-color-dodge animate-pulse bg-red-900/20"></div>
            )}
            
            <svg viewBox="0 0 300 300" className="w-4/5 h-4/5 z-10" style={glitchStyle}>
                <defs>
                    <filter id="chromaticAberration">
                        <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
                        <feOffset in="red" dx={state.cognitiveDissonance * 8} dy="0" result="redOffset" />
                        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="greenBlue" />
                        <feBlend in="redOffset" in2="greenBlue" mode="screen" />
                    </filter>
                    
                    <filter id="glitch">
                        <feTurbulence type="fractalNoise" baseFrequency={0.05 + state.cognitiveDissonance * 0.2} numOctaves="2" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale={state.cognitiveDissonance * 45} xChannelSelector="R" yChannelSelector="G" />
                    </filter>

                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#064e3b" strokeWidth="0.5" opacity="0.3"/>
                    </pattern>
                </defs>

                <rect width="300" height="300" fill="url(#grid)" />

                <circle cx="150" cy="150" r="100" fill="none" stroke="#065f46" strokeWidth="0.2" strokeDasharray="2,10" className="opacity-40" />
                
                {/* Main Reality Boundary */}
                <polygon 
                    points={points.map(p => `${p.x},${p.y}`).join(' ')} 
                    fill={isThinking ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.05)"}
                    stroke={state.cognitiveDissonance > 0.8 ? "#ff4444" : "#10b981"}
                    strokeWidth={isThinking ? "2" : "1"}
                    strokeDasharray={state.cognitiveDissonance > 0.5 ? "none" : "4,2"}
                    className="transition-all duration-300"
                />

                {/* Data Points */}
                {points.filter((_, i) => i % 2 === 0).map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={isThinking ? 1.5 : 1} fill={state.cognitiveDissonance > 0.8 ? "#ff8888" : "#34d399"} className="opacity-80" />
                ))}

                <text x="10" y="290" className="fill-emerald-900 text-[7px] uppercase tracking-[0.5em] font-bold">
                    REALITY_COHESION_INDEX: {((1 - state.cognitiveDissonance) * 100).toFixed(2)}%
                </text>
            </svg>

            {/* Critical Warning Overlays */}
            <div className={`absolute inset-0 pointer-events-none border-[1px] z-30 transition-colors duration-500 ${state.cognitiveDissonance > 0.8 ? 'border-red-500/30' : 'border-emerald-500/10'}`}></div>
            
            {state.cognitiveDissonance > 0.9 && (
                <div className="absolute top-4 left-4 z-40 bg-red-600 text-black px-2 py-0.5 text-[9px] font-bold animate-bounce uppercase">
                    Logic_Breach_Detected
                </div>
            )}
        </div>
    );
};

export default Visualizer;
