
import React, { useRef, useEffect } from 'react';
import { Message } from '../types';

interface TerminalProps {
    messages: Message[];
    loading: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ messages, loading }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex-1 flex flex-col border border-emerald-900/30 bg-black/40 overflow-hidden relative">
            <div className="bg-emerald-950/20 border-b border-emerald-900/30 px-3 py-1 flex justify-between">
                <span className="text-[10px] text-emerald-700 font-mono tracking-widest uppercase">Telemetry_Stream</span>
                <span className="text-[10px] text-emerald-900 font-mono">ID: OBS_7122_A</span>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm custom-scrollbar">
                {messages.length === 0 && (
                    <div className="opacity-20 text-[10px] italic text-center mt-10">NO_DATA_LOGS_AVAILABLE</div>
                )}
                {messages.map((m, i) => (
                    <div key={m.timestamp + i} className={`animate-in fade-in slide-in-from-left-2 duration-300`}>
                        <div className="flex gap-2 items-start">
                            <span className={`text-[9px] uppercase font-bold px-1 py-0.5 rounded ${
                                m.role === 'user' ? 'bg-emerald-900/20 text-emerald-700' : 'bg-emerald-600/10 text-emerald-400'
                            }`}>
                                {m.role}
                            </span>
                            <span className="text-[9px] text-emerald-900 mt-0.5">[{new Date(m.timestamp).toLocaleTimeString()}]</span>
                        </div>
                        <div className="mt-1 pl-1">
                            {m.image && (
                                <img src={m.image} className="w-32 h-32 object-cover border border-emerald-900/50 my-2 opacity-70 grayscale sepia hover:grayscale-0 hover:sepia-0 transition-all duration-500 cursor-crosshair" />
                            )}
                            <p className={`${m.role === 'user' ? 'text-emerald-300' : 'text-emerald-500'} leading-relaxed`}>
                                {m.text}
                            </p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
                        <span className="text-[10px] px-1 bg-emerald-900/40">PROC</span>
                        <span className="text-[10px]">ANALYZING_STOCHASTIC_INPUT...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Terminal;
