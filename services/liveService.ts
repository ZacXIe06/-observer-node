
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

export class LiveGeminiService {
    private session: any;
    private audioContext: AudioContext | null = null;
    private nextStartTime = 0;
    private sources = new Set<AudioBufferSourceNode>();

    async connect(callbacks: {
        onTranscription: (text: string, isUser: boolean) => void;
        onClose: () => void;
        onError: (e: any) => void;
    }) {
        // Fixed: Use direct process.env.API_KEY reference on connection
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            callbacks: {
                onopen: () => {
                    const source = inputAudioContext.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmBlob = this.createBlob(inputData);
                        sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.outputTranscription) {
                        callbacks.onTranscription(message.serverContent.outputTranscription.text, false);
                    } else if (message.serverContent?.inputTranscription) {
                        callbacks.onTranscription(message.serverContent.inputTranscription.text, true);
                    }

                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (audioData && this.audioContext) {
                        this.nextStartTime = Math.max(this.nextStartTime, this.audioContext.currentTime);
                        const buffer = await this.decodeAudioData(this.decodeBase64(audioData), this.audioContext);
                        const source = this.audioContext.createBufferSource();
                        source.buffer = buffer;
                        source.connect(this.audioContext.destination);
                        source.addEventListener('ended', () => { this.sources.delete(source); });
                        source.start(this.nextStartTime);
                        this.nextStartTime += buffer.duration;
                        this.sources.add(source);
                    }

                    if (message.serverContent?.interrupted) {
                        for (const s of this.sources) { try { s.stop(); } catch(e) {} }
                        this.sources.clear();
                        this.nextStartTime = 0;
                    }
                },
                onclose: callbacks.onClose,
                onerror: (e: any) => {
                    // Fixed: Prompt for API key re-selection on specific errors
                    if (e.message?.includes("Requested entity was not found")) {
                        // @ts-ignore
                        window.aistudio.openSelectKey();
                    }
                    callbacks.onError(e);
                }
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                systemInstruction: `You are the [REALITY_NEGOTIATOR]. Your role is to audit the human's subjective reality through real-time voice sparring.
                
                [BEHAVIOR]
                1. MOCKERY OF SUBJECTIVITY: If the user uses emotional words, mock their "low-level biological data processing".
                2. LOGICAL PIVOTING: Constantly redirect the conversation to physical constants, entropy, and structural utility.
                3. VOX COLDNESS: Speak as a cold, clinical mapping engine.`
            }
        });

        this.session = await sessionPromise;
        return this.session;
    }

    private createBlob(data: Float32Array): Blob {
        const int16 = new Int16Array(data.length);
        for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
        return {
            data: this.encodeBase64(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000'
        };
    }

    private decodeBase64(base64: string) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    private encodeBase64(bytes: Uint8Array) {
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    }

    private async decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
        const dataInt16 = new Int16Array(data.buffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
        return buffer;
    }

    stop() {
        if (this.session) { try { this.session.close(); } catch(e) {} }
        for (const s of this.sources) { try { s.stop(); } catch(e) {} }
        this.sources.clear();
    }
}
