
import React, { useEffect, useState, useRef } from 'react';
import { soundService } from '../services/soundService';

interface LogicStreamProps {
    thinking?: string;
    logicChain: string[];
    isThinking: boolean;
}

const LogicStream: React.FC<LogicStreamProps> = ({ thinking, logicChain, isThinking }) => {
    const [displayLines, setDisplayLines] = useState<string[]>([]);
    const [decodedThinking, setDecodedThinking] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isThinking) {
            const lines = [
                "> INITIALIZING_DEEP_REASONING_BUFFER...",
                `> ALLOCATING_THINKING_BUDGET: 16000_TOKENS`,
                `> SCANNING_DOMAIN_CONSTANTS...`,
                `> BYPASSING_EMOTIONAL_INTERFERENCE...`,
                ...logicChain.map(l => `> EXECUTING_NODE: ${l.toUpperCase().replace(/\s+/g, '_')}`)
            ];
            
            let i = 0;
            const interval = setInterval(() => {
                if (i < lines.length) {
                    setDisplayLines(prev => [...prev, lines[i]]);
                    soundService.playPulse();
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 300);
            return () => clearInterval(interval);
        } else {
            setDisplayLines([]);
            setDecodedThinking('');
        }
    }, [isThinking, logicChain]);

    useEffect(() => {
        if (thinking && !isThinking) {
            let i = 0;
            const timer = setInterval(() => {
                setDecodedThinking(thinking.substring(0, i));
                i += 3;
                if (i > thinking.length) clearInterval(timer);
            }, 20);
            return () => clearInterval(timer);
        }
    }, [thinking, isThinking]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [displayLines, decodedThinking]);

    return (
        <div ref={containerRef} className="flex-1 border border-emerald-900/30 bg-black/90 p-5 font-mono text-[10px] overflow-y-auto custom-scrollbar relative shadow-inner">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/20 animate-pulse"></div>
            
            <div className="space-y-1.5">
                {displayLines.map((line, idx) => (
                    <div key={idx} className="text-emerald-800 leading-none flex gap-2">
                        <span className="opacity-40">{idx.toString().padStart(3, '0')}</span>
                        <span>{line}</span>
                    </div>
                ))}
                
                {decodedThinking && (
                    <div className="mt-6 border-t border-emerald-900/40 pt-4 bg-emerald-500/5 p-3 rounded-sm border-l-2 border-l-emerald-500">
                        <span className="text-emerald-400 font-bold block mb-2 text-[9px] tracking-widest uppercase">
                            [SECRET_LOGIC_DECODED]:
                        </span>
                        <p className="text-emerald-300/90 leading-relaxed italic text-[11px] font-sans">
                            "{decodedThinking}"
                        </p>
                    </div>
                )}

                {isThinking && (
                    <div className="flex items-center gap-2 text-emerald-500 animate-pulse mt-4 bg-emerald-950/30 p-2 border border-emerald-900/20">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-[9px] font-bold tracking-[0.2em]">CALCULATING_PROBABILITIES...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogicStream;
