
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from './services/geminiService';
import { LiveGeminiService } from './services/liveService';
import { Message, BeliefState } from './types';
import { INITIAL_BELIEF_STATE } from './constants';
import Terminal from './components/Terminal';
import MetricsPanel from './components/MetricsPanel';
import Visualizer from './components/Visualizer';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import LogicStream from './components/LogicStream';

type GameState = 'LANDING' | 'ONBOARDING' | 'ACTIVE';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('LANDING');
    const [messages, setMessages] = useState<Message[]>([]);
    const [belief, setBelief] = useState<BeliefState>(INITIAL_BELIEF_STATE);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [rationalizing, setRationalizing] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gemini = useRef(new GeminiService());
    const liveGemini = useRef(new LiveGeminiService());

    useEffect(() => {
        if (gameState === 'ACTIVE') {
            const bootMessages: Message[] = [
                { role: 'ai', text: 'REALITY_NEGOTIATOR_BOOT... SUCCESS.', timestamp: Date.now() },
                { role: 'ai', text: 'PROTOCOL_V5: STANDING BY FOR REALITY AUDIT.', timestamp: Date.now() + 100 }
            ];
            setMessages(bootMessages);
        }
    }, [gameState]);

    useEffect(() => {
        if (showCamera && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [showCamera, stream]);

    const handleAudit = async (customMessage?: string, imageBase64?: string) => {
        const textToProcess = customMessage || input;
        if (!textToProcess.trim() && !imageBase64) return;

        setLoading(true);
        setIsThinking(true);
        const userMsg: Message = { 
            role: 'user', 
            text: textToProcess || "Physical telemetry uploaded.", 
            image: imageBase64,
            timestamp: Date.now() 
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            const nextState = await gemini.current.auditInput(textToProcess, belief, imageBase64);
            setBelief(nextState);
            setMessages(prev => [...prev, {
                role: 'ai',
                text: nextState.text || 'Reality model updated with high-confidence induction.',
                timestamp: Date.now()
            }]);
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'ai', text: 'CRITICAL_FAULT: NEGOTIATION_CHANNEL_ERROR.', timestamp: Date.now() }]);
        } finally {
            setLoading(false);
            setIsThinking(false);
        }
    };

    const handleRationalize = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setRationalizing(true);
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx?.drawImage(videoRef.current, 0, 0);
        const rawData = canvasRef.current.toDataURL('image/jpeg');
        
        try {
            const rationalizedImg = await gemini.current.rationalizeVisual(
                `Rationalizing Domain [${belief.scenario}].`, 
                rawData, 
                belief
            );
            setMessages(prev => [...prev, {
                role: 'ai',
                text: `NEGOTIATED BLUEPRINT GENERATED. COGNITIVE_DISSONANCE_ADJUSTED.`,
                image: rationalizedImg,
                timestamp: Date.now()
            }]);
            toggleCamera();
        } catch (e: any) {
            setMessages(prev => [...prev, { role: 'ai', text: 'CRITICAL_FAULT: RATIONALIZATION_FAILURE.', timestamp: Date.now() }]);
        } finally {
            setRationalizing(false);
        }
    };

    const toggleCamera = async () => {
        if (!showCamera) {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                setStream(mediaStream);
                setShowCamera(true);
            } catch (err) { console.error("Camera failed:", err); }
        } else {
            if (stream) stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setShowCamera(false);
        }
    };

    const toggleLiveSession = async () => {
        if (!isLive) {
            try {
                await liveGemini.current.connect({
                    onTranscription: (text, isUser) => {
                        if (text.length > 3) {
                            setMessages(prev => [...prev, { role: isUser ? 'user' : 'ai', text, timestamp: Date.now() }]);
                        }
                    },
                    onClose: () => setIsLive(false),
                    onError: () => setIsLive(false)
                });
                setIsLive(true);
            } catch (err) { console.error("Live session failed:", err); }
        } else {
            liveGemini.current.stop();
            setIsLive(false);
        }
    };

    if (gameState === 'LANDING') {
        return <LandingPage onStart={() => setGameState('ONBOARDING')} />;
    }

    if (gameState === 'ONBOARDING') {
        return <Onboarding onComplete={() => setGameState('ACTIVE')} />;
    }

    return (
        <div className={`flex flex-col h-screen bg-[#020202] text-emerald-500 font-mono overflow-hidden relative transition-all duration-1000 ${belief.cognitiveDissonance > 0.8 ? 'hue-rotate-[-30deg] saturate-200' : ''}`}>
            <div className="scanline"></div>
            
            <header className="flex items-center justify-between px-8 py-5 border-b border-emerald-900/40 bg-black/60 z-10 relative">
                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none"></div>
                <div className="flex items-center gap-6 relative z-10">
                    <h1 className="text-sm font-bold tracking-[0.6em] text-emerald-400 crt-flicker uppercase">Observer_Node_v5</h1>
                    <div className="flex items-center gap-4">
                        <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse shadow-[0_0_10px_red]' : 'bg-emerald-900'}`} />
                        <span className="text-[10px] opacity-60 uppercase tracking-widest font-bold">
                            Condition: {belief.cognitiveDissonance > 0.7 ? 'CRITICAL_NEGOTIATION' : 'STABLE_AUDIT'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="text-[10px] border border-emerald-900/60 px-4 py-1.5 uppercase tracking-widest font-bold bg-emerald-950/30 text-emerald-300">
                        DOMAIN: {belief.scenario}
                    </div>
                    <button 
                        onClick={toggleLiveSession}
                        className={`px-5 py-1.5 text-[10px] border transition-all uppercase tracking-widest font-bold ${isLive ? 'border-red-600 text-red-500 bg-red-950/20' : 'border-emerald-500 hover:bg-emerald-500 hover:text-black'}`}
                    >
                        {isLive ? 'Abort_Session' : 'Live_Debate'}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <aside className="w-96 border-r border-emerald-900/30 bg-black/50 flex flex-col p-3 space-y-3">
                    <Terminal messages={messages} loading={loading} />
                    <LogicStream 
                        thinking={belief.thinkingOutput} 
                        logicChain={belief.logicChain} 
                        isThinking={isThinking} 
                    />
                </aside>

                <main className="flex-1 flex flex-col p-8 space-y-6 overflow-hidden">
                    <div className="flex-1 flex gap-6 min-h-0">
                        <div className="flex-1 flex flex-col space-y-5">
                            <div className="flex-1 relative border border-emerald-900/20 shadow-[0_0_20px_rgba(0,0,0,1)]">
                                <Visualizer state={belief} isThinking={isThinking || isLive} />
                                {showCamera && (
                                    <div className="absolute inset-0 bg-black z-20 flex flex-col border-2 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale contrast-150 brightness-75" />
                                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-6 bg-black/95 p-6 border border-emerald-900/60 shadow-2xl z-30">
                                            <button onClick={() => {
                                                const ctx = canvasRef.current!.getContext('2d');
                                                canvasRef.current!.width = videoRef.current!.videoWidth;
                                                canvasRef.current!.height = videoRef.current!.videoHeight;
                                                ctx?.drawImage(videoRef.current!, 0, 0);
                                                handleAudit(undefined, canvasRef.current!.toDataURL('image/jpeg'));
                                                toggleCamera();
                                            }} className="bg-emerald-600 text-black text-[11px] px-8 py-3 uppercase font-bold hover:bg-emerald-400 transition-colors shadow-lg">Capture_Telemetry</button>
                                            <button onClick={handleRationalize} disabled={rationalizing} className="bg-blue-700 text-white text-[11px] px-8 py-3 uppercase font-bold disabled:opacity-50 hover:bg-blue-500 transition-colors shadow-lg">
                                                {rationalizing ? 'Synthesizing...' : 'Final_Blueprint'}
                                            </button>
                                            <button onClick={toggleCamera} className="text-red-600 text-[11px] uppercase px-5 font-bold hover:text-red-400">Exit</button>
                                        </div>
                                        <canvas ref={canvasRef} className="hidden" />
                                    </div>
                                )}
                            </div>
                            <div className="bg-emerald-950/10 border border-emerald-900/30 p-5 relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 group-hover:h-full transition-all duration-500"></div>
                                <p className="text-emerald-400 text-xs font-mono uppercase tracking-wider">
                                    <span className="opacity-40 mr-2">[ACTIVE_DIRECTIVE]:</span> {belief.nextDirective}
                                </p>
                            </div>
                        </div>

                        <div className="w-96 flex flex-col gap-6">
                            <MetricsPanel state={belief} />
                            <div className="flex-1 border border-emerald-900/30 bg-emerald-950/5 p-6 overflow-y-auto custom-scrollbar relative">
                                <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-emerald-900/20 pointer-events-none"></div>
                                <h3 className="text-[11px] text-emerald-600 uppercase font-bold border-b border-emerald-900/30 pb-3 mb-6 tracking-[0.2em]">Calibration_Protocol: {belief.calibrationStage.title}</h3>
                                <div className="space-y-5">
                                    {belief.calibrationStage.objectives.map((obj, i) => (
                                        <div key={i} className="flex gap-4 text-[11px] text-emerald-400/70 leading-relaxed group cursor-default">
                                            <span className="text-emerald-900 font-bold group-hover:text-emerald-500 transition-colors">0{i+1}</span> 
                                            <span className="group-hover:text-emerald-300 transition-colors">{obj}</span>
                                        </div>
                                    ))}
                                </div>
                                {belief.groundingUrls && belief.groundingUrls.length > 0 && (
                                    <div className="mt-12 pt-6 border-t border-emerald-900/30">
                                        <h3 className="text-[10px] text-emerald-800 uppercase mb-4 font-bold tracking-widest">Grounding_Evidence_Buffer</h3>
                                        <div className="space-y-3">
                                            {belief.groundingUrls.map((url, i) => (
                                                <a key={i} href={url.uri} target="_blank" className="block text-[10px] text-blue-400/60 hover:text-blue-300 hover:underline truncate bg-blue-950/10 p-2 border border-blue-900/20 transition-all">
                                                    SRC_NODE_{i}: {url.title}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 h-20 items-center">
                        <button onClick={toggleCamera} className="w-20 h-full border border-emerald-900/50 bg-emerald-950/10 flex items-center justify-center hover:bg-emerald-900/40 transition-all group">
                            <svg className="w-7 h-7 text-emerald-700 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
                        </button>
                        <div className="flex-1 h-full relative group">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
                                placeholder={isLive ? "VOICE_CHANNEL_ACTIVE_IN_NEGOTIATION..." : "SUBMIT_LOGICAL_INVARIANT_FOR_CALIBRATION..."}
                                className="w-full h-full bg-black border border-emerald-900/40 p-6 text-sm text-emerald-400 focus:outline-none focus:border-emerald-400 placeholder:text-emerald-950 uppercase tracking-[0.2em] transition-all"
                                disabled={isLive}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-emerald-900 opacity-0 group-hover:opacity-100 transition-opacity uppercase pointer-events-none">Press_Enter_to_Transmit</div>
                        </div>
                        <button 
                            onClick={() => handleAudit()}
                            disabled={loading || !input.trim() || isLive}
                            className="px-16 h-full bg-emerald-950/20 border border-emerald-800 text-emerald-600 text-[11px] font-bold uppercase hover:bg-emerald-500 hover:text-black transition-all tracking-[0.3em] relative overflow-hidden group disabled:opacity-20"
                        >
                            <span className="relative z-10">{loading ? "PROCESSING" : "Negotiate"}</span>
                            <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
