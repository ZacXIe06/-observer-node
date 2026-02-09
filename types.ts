
export type ScenarioDomain = string;

export interface PhysicalMetrics {
    entropy: number;         
    symmetry: number;        
    density: number;         
    primaryGeometry: string; 
}

export interface CalibrationStage {
    current: number;
    total: number;
    title: string;
    objectives: string[];
}

export interface BeliefState {
    scenario: ScenarioDomain;
    text: string;
    hypothesis: string;
    internalMonologue: string;
    logicChain: string[];
    physicalMetrics: PhysicalMetrics;
    nextDirective: string;
    confidence: number;
    cognitiveDissonance: number; // 0-1, 衡量 AI 与用户认知的冲突程度
    logicalInvariants: string[]; // 用户成功说服 AI 的逻辑点
    isSystemOverload: boolean;
    calibrationStage: CalibrationStage;
    thinkingOutput?: string;
    groundingUrls?: { title: string; uri: string }[];
    lastUpdated: number;
}

export interface Message {
    role: 'user' | 'ai';
    text: string;
    image?: string;
    timestamp: number;
}
