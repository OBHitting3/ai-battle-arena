/**
 * ELEVENLABS INTEGRATION
 *
 * Professional voice cloning and voiceover generation.
 * Each channel gets a unique, proprietary voice - creating a defensible moat.
 *
 * Features:
 * - Voice cloning from sample audio
 * - TTS generation (v3 API with multilingual support)
 * - Background music generation
 * - Commercial licensing included
 */
import type { VoiceoverAsset, MusicAsset, Script } from '../../shared/types/index.js';
interface VoiceCloneConfig {
    name: string;
    description: string;
    sampleAudioPath: string;
    labels?: Record<string, string>;
}
declare class ElevenLabsService {
    private client;
    private outputDir;
    private readonly COST_PER_1K_CHARS;
    constructor();
    private ensureOutputDir;
    /**
     * Create a unique voice clone for a channel
     * This is the MOAT - competitors can't replicate this voice
     */
    createVoiceClone(config: VoiceCloneConfig): Promise<{
        voiceId: string;
        name: string;
        status: string;
    }>;
    /**
     * Generate voiceover from script
     * Supports long-form content via paragraph-by-paragraph generation
     */
    generateVoiceover(scriptId: string, script: Script, voiceId: string, language?: string): Promise<VoiceoverAsset>;
    /**
     * Generate background music for a video
     * ElevenLabs Music API with commercial rights
     */
    generateMusic(prompt: string, duration: number, mood?: string): Promise<MusicAsset>;
    /**
     * List all available voices (including custom clones)
     */
    listVoices(): Promise<Array<{
        voiceId: string;
        name: string;
        category: string;
        isCustom: boolean;
    }>>;
    /**
     * Delete a voice clone (useful for cleanup)
     */
    deleteVoice(voiceId: string): Promise<void>;
    /**
     * Get voice clone details
     */
    getVoiceDetails(voiceId: string): Promise<{
        voiceId: string;
        name: string | undefined;
        description: string | undefined;
        category: string | undefined;
        labels: Record<string, string> | undefined;
        previewUrl: string | undefined;
        settings: import("elevenlabs/api/index.js").VoiceSettings | undefined;
    }>;
    /**
     * Generate voiceover in segments (for very long scripts)
     * More control over pacing and allows for editing
     */
    generateVoiceoverSegmented(scriptId: string, segments: Array<{
        text: string;
        timestamp: number;
    }>, voiceId: string, language?: string): Promise<VoiceoverAsset[]>;
    /**
     * Get account usage stats (for monitoring costs)
     */
    getUsageStats(): Promise<{
        characterCount: number;
        characterLimit: number;
        charactersRemaining: number;
        nextResetDate: number;
        tier: string;
    }>;
    /**
     * Estimate audio duration based on word count
     * Average speaking rate: 150 words per minute = 2.5 words per second
     */
    private estimateDuration;
    /**
     * Calculate cost based on character count
     */
    private calculateCost;
    /**
     * Batch generate voiceovers for multiple scripts
     */
    generateBatch(scripts: Array<{
        scriptId: string;
        script: Script;
        voiceId: string;
    }>, language?: string): Promise<VoiceoverAsset[]>;
}
export declare const elevenLabs: ElevenLabsService;
export {};
//# sourceMappingURL=elevenlabs.d.ts.map