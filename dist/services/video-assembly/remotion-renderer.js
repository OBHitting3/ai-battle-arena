import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { getCompositions } from '@remotion/renderer';
import path from 'path';
import fs from 'fs/promises';
export class RemotionRenderer {
    outputDir;
    tempDir;
    constructor() {
        this.outputDir = path.join(process.cwd(), 'output');
        this.tempDir = path.join(process.cwd(), 'temp');
    }
    /**
     * Render a video from composition
     */
    async renderVideo(composition, outputFileName) {
        try {
            // Ensure directories exist
            await fs.mkdir(this.outputDir, { recursive: true });
            await fs.mkdir(this.tempDir, { recursive: true });
            // Create composition file
            const compositionPath = await this.createCompositionFile(composition);
            // Bundle Remotion project
            const bundleLocation = await bundle({
                entryPoint: compositionPath,
                webpackOverride: (config) => config,
            });
            // Get available compositions
            const compositions = await getCompositions(bundleLocation);
            const selectedComposition = await selectComposition({
                serveUrl: bundleLocation,
                id: 'Main',
                inputProps: composition,
            });
            // Output path
            const outputPath = path.join(this.outputDir, outputFileName);
            // Render video
            await renderMedia({
                composition: selectedComposition,
                serveUrl: bundleLocation,
                codec: 'h264',
                outputLocation: outputPath,
                inputProps: composition,
            });
            console.log(`Video rendered successfully: ${outputPath}`);
            return outputPath;
        }
        catch (error) {
            console.error('Error rendering video:', error);
            throw new Error(`Failed to render video: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Create Remotion composition file
     */
    async createCompositionFile(composition) {
        const compositionCode = `
import { Composition } from 'remotion';
import { VideoTemplate } from './VideoTemplate';

export const RemotionRoot = () => {
  return (
    <Composition
      id="Main"
      component={VideoTemplate}
      durationInFrames={${composition.durationInFrames}}
      fps={${composition.fps}}
      width={${composition.width}}
      height={${composition.height}}
    />
  );
};
`;
        const compositionPath = path.join(this.tempDir, 'composition.tsx');
        await fs.writeFile(compositionPath, compositionCode);
        // Create VideoTemplate component
        await this.createVideoTemplate(composition);
        return compositionPath;
    }
    /**
     * Create video template component
     */
    async createVideoTemplate(composition) {
        const templateCode = `
import { useCurrentFrame, AbsoluteFill, Audio, Img, interpolate } from 'remotion';

export const VideoTemplate = (props) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Voiceover */}
      <Audio src="${composition.voiceoverPath}" />

      {/* Background music (if provided) */}
      ${composition.backgroundMusic ? `<Audio src="${composition.backgroundMusic}" volume={0.3} />` : ''}

      {/* Assets */}
      ${composition.assets.map((asset, index) => `
        ${asset.startFrame} <= frame && frame < ${asset.startFrame + asset.durationFrames} && (
          ${asset.type === 'image' ? `
            <Img
              src="${asset.url}"
              style={{
                position: 'absolute',
                top: ${asset.position?.y || 0},
                left: ${asset.position?.x || 0},
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: interpolate(
                  frame,
                  [${asset.startFrame}, ${asset.startFrame + 15}, ${asset.startFrame + asset.durationFrames - 15}, ${asset.startFrame + asset.durationFrames}],
                  [0, 1, 1, 0]
                ),
              }}
            />
          ` : asset.type === 'text' ? `
            <div
              style={{
                position: 'absolute',
                top: ${asset.position?.y || '50%'},
                left: ${asset.position?.x || '50%'},
                transform: 'translate(-50%, -50%)',
                fontSize: ${asset.style?.fontSize || 48},
                color: '${asset.style?.color || '#fff'}',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '20px',
                ...${JSON.stringify(asset.style || {})},
              }}
            >
              ${asset.text}
            </div>
          ` : ''}
        )
      `).join('\n')}
    </AbsoluteFill>
  );
};
`;
        const templatePath = path.join(this.tempDir, 'VideoTemplate.tsx');
        await fs.writeFile(templatePath, templateCode);
    }
    /**
     * Clean up temporary files
     */
    async cleanup() {
        try {
            await fs.rm(this.tempDir, { recursive: true, force: true });
        }
        catch (error) {
            console.error('Error cleaning up temp files:', error);
        }
    }
}
/**
 * Helper function to create composition from script
 */
export async function createCompositionFromScript(script, voiceoverPath, assetUrls, durationSeconds) {
    const fps = 30;
    // Use provided duration, fallback to script metadata, or default to 60s
    const audioDuration = durationSeconds || script?.metadata?.duration || 60;
    // GROK FIX: Validate duration to prevent 0 frames or memory overflows
    if (audioDuration <= 0) {
        throw new Error('Video duration must be greater than 0 seconds');
    }
    if (audioDuration > 3600) { // Max 1 hour
        throw new Error('Video duration cannot exceed 3600 seconds (1 hour)');
    }
    const durationInFrames = Math.ceil(audioDuration * fps);
    // GROK FIX: Prevent memory issues with too many frames
    const MAX_FRAMES = 108000; // 1 hour at 30fps
    if (durationInFrames > MAX_FRAMES) {
        throw new Error(`Video frames (${durationInFrames}) exceed maximum allowed (${MAX_FRAMES})`);
    }
    const assets = assetUrls.map((url, index) => ({
        type: 'image',
        url,
        startFrame: Math.floor((index / assetUrls.length) * durationInFrames),
        durationFrames: Math.floor(durationInFrames / assetUrls.length),
    }));
    return {
        fps,
        durationInFrames,
        width: 1920,
        height: 1080,
        assets,
        voiceoverPath,
    };
}
//# sourceMappingURL=remotion-renderer.js.map