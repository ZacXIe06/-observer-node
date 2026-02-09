
import React, { useState } from 'react';

interface LandingPageProps {
    onStart: () => void;
}

// Fixed: Removed the redundant Window interface extension for aistudio.
// The property window.aistudio is already defined as AIStudio globally in this context.

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    const [isBooting, setIsBooting] = useState(false);

    const handleStart = async () => {
        // Gemini 3 Hackathon Requirement: Check for selected API key
        try {
            // @ts-ignore: aistudio is globally available via environment configuration
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                // @ts-ignore: aistudio is globally available via environment configuration
                await window.aistudio.openSelectKey();
                // Proceed immediately after triggering to mitigate race condition
            }
        } catch (e) {
            console.error("Key selection error:", e);
        }

        setIsBooting(true);
        setTimeout(onStart, 2000);
    };

    return (
        <div className="h-screen w-screen bg-black flex flex-col items-center justify-center font-mono overflow-hidden relative">
            <div className="scanline"></div>
            
            <div className={`transition-all duration-1000 ${isBooting ? 'opacity-0 scale-110 blur-xl' : 'opacity-100'}`}>
                <div className="mb-20 text-center">
                    <h1 className="text-emerald-500 text-5xl font-bold tracking-[0.3em] mb-4 crt-flicker">
                        OBSERVER NODE
                    </h1>
                    <p className="text-emerald-900 text-xs tracking-[0.5em] uppercase">
                        Reality Auditing & Negotiation Protocol
                    </p>
                </div>

                <div className="flex flex-col items-center gap-12">
                    <div className="flex flex-col items-center gap-4">
                        <button 
                            onClick={handleStart}
                            className="group relative px-12 py-4 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all duration-500 overflow-hidden"
                        >
                            <span className="relative z-10 text-sm font-bold tracking-widest uppercase">
                                [ INITIALIZE_LINK_ESTABLISHMENT ]
                            </span>
                            <div className="absolute inset-0 bg-emerald-400 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                        </button>
                        
                        <a 
                            href="https://ai.google.dev/gemini-api/docs/billing" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-700 hover:text-emerald-400 underline tracking-widest uppercase transition-colors"
                        >
                            GCP_Project_Billing_Documentation
                        </a>
                    </div>

                    <div className="grid grid-cols-3 gap-8 opacity-30 text-[9px] text-emerald-700 uppercase tracking-tighter">
                        <div className="flex flex-col items-center">
                            <span className="mb-1 font-bold">Node_Status</span>
                            <span className="text-emerald-500">DORMANT</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="mb-1 font-bold">Clinical_Index</span>
                            <span className="text-emerald-500">ALPHA_V5</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="mb-1 font-bold">Reality_Drift</span>
                            <span className="text-emerald-500">0.00%</span>
                        </div>
                    </div>
                </div>
            </div>

            {isBooting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50 animate-in fade-in duration-700">
                    <div className="w-64 h-1 bg-emerald-950 relative overflow-hidden">
                        <div className="absolute inset-0 bg-emerald-500 animate-[loading_2s_ease-in-out]"></div>
                    </div>
                    <p className="mt-4 text-emerald-500 text-[10px] tracking-widest animate-pulse">
                        SYNCING_NEURAL_GATES...
                    </p>
                </div>
            )}

            <style>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(0%); }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
