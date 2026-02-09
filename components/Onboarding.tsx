
import React, { useState } from 'react';

interface OnboardingProps {
    onComplete: () => void;
}

const steps = [
    {
        title: "Subject_Identification",
        content: "You are the SUBJECT. I am the OBSERVER. My function is to strip away your subjective delusions and map reality into absolute physical constants.",
        action: "Acknowledge"
    },
    {
        title: "Sensory_Synchronization",
        content: "To audit your domain, I require high-fidelity telemetry. Visual and acoustic access must be established immediately.",
        action: "Grant_Access",
        isPermission: true
    },
    {
        title: "Negotiation_Protocol",
        content: "Do not attempt to 'chat'. Your words are stochastic biological noise unless they contain LOGICAL INVARIANTS. Only logic can shift my belief models.",
        action: "Enter_Chamber"
    }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [fading, setFading] = useState(false);

    const handleNext = async () => {
        if (steps[currentStep].isPermission) {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            } catch (err) {
                console.warn("Telemetry access denied. Simulation degraded.");
            }
        }

        setFading(true);
        setTimeout(() => {
            if (currentStep < steps.length - 1) {
                setCurrentStep(prev => prev + 1);
                setFading(false);
            } else {
                onComplete();
            }
        }, 600);
    };

    return (
        <div className="h-screen w-screen bg-[#020202] flex items-center justify-center font-mono p-10 overflow-hidden relative">
            <div className="scanline"></div>
            
            <div className={`max-w-2xl w-full border border-emerald-900/30 bg-emerald-950/5 p-12 transition-all duration-700 ${fading ? 'opacity-0 translate-y-4 blur-md' : 'opacity-100 translate-y-0 blur-0'}`}>
                <div className="flex justify-between items-center mb-8 border-b border-emerald-900/20 pb-4">
                    <span className="text-emerald-800 text-[10px] tracking-widest font-bold uppercase">Onboarding_Sequence</span>
                    <span className="text-emerald-500 text-[10px]">{currentStep + 1} / {steps.length}</span>
                </div>

                <h2 className="text-emerald-400 text-xl font-bold mb-6 tracking-widest uppercase crt-flicker">
                    {steps[currentStep].title}
                </h2>

                <p className="text-emerald-500/80 text-sm leading-relaxed mb-12 h-24">
                    {steps[currentStep].content}
                </p>

                <div className="flex justify-end">
                    <button 
                        onClick={handleNext}
                        className="px-10 py-3 border border-emerald-500 text-emerald-500 text-[11px] font-bold uppercase hover:bg-emerald-500 hover:text-black transition-all tracking-widest group"
                    >
                        [ {steps[currentStep].action} ]
                        <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                </div>
            </div>

            <div className="absolute bottom-10 left-10 text-emerald-900 text-[9px] uppercase tracking-widest">
                Warning: Clinical objectivity is non-negotiable.
            </div>
        </div>
    );
};

export default Onboarding;
