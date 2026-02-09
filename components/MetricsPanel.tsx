
import React from 'react';
import { BeliefState } from '../types';

interface MetricsPanelProps {
    state: BeliefState;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ state }) => {
    const MetricBar = ({ label, value, color = "bg-emerald-500" }: { label: string, value: number, color?: string }) => (
        <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
                <span className="text-emerald-700 uppercase tracking-tighter">{label}</span>
                <span className={color.replace('bg-', 'text-')}>{(value * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1 bg-emerald-950/50 w-full overflow-hidden border border-emerald-900/20">
                <div 
                    className={`h-full ${color} transition-all duration-700 ease-out`}
                    style={{ width: `${value * 100}%` }}
                />
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-2 gap-4 p-4 border border-emerald-900/20 bg-emerald-950/5 font-mono">
            <div className="space-y-3">
                <MetricBar label="Physical_Entropy" value={state.physicalMetrics?.entropy || 0} />
                <MetricBar 
                    label="Cognitive_Dissonance" 
                    value={state.cognitiveDissonance || 0} 
                    color={state.cognitiveDissonance > 0.6 ? "bg-red-500" : "bg-orange-500"}
                />
                <div className="pt-2">
                    <span className="text-[9px] text-emerald-700 uppercase block mb-1">Logic_Invariants</span>
                    <div className="flex flex-wrap gap-1">
                        {state.logicalInvariants?.length > 0 ? (
                            state.logicalInvariants.map((inv, i) => (
                                <span key={i} className="text-[8px] bg-emerald-500/10 border border-emerald-500/30 px-1 text-emerald-400">
                                    {inv}
                                </span>
                            ))
                        ) : (
                            <span className="text-[8px] text-emerald-900 italic">None established.</span>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="space-y-2 border-l border-emerald-900/20 pl-4">
                <div className="text-[9px] text-emerald-700 uppercase">Model_Stability</div>
                <div className="text-2xl font-light text-emerald-500 tracking-tight">
                    {((1 - (state.cognitiveDissonance || 0)) * 100).toFixed(1)}<span className="text-[12px] opacity-40 ml-1">%</span>
                </div>
                
                <div className="pt-2">
                    <div className="text-[9px] text-emerald-700 uppercase mb-1">Internal_Monologue</div>
                    <p className="text-[10px] text-emerald-600 leading-tight italic overflow-y-auto max-h-20 custom-scrollbar">
                        "{state.internalMonologue}"
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MetricsPanel;
