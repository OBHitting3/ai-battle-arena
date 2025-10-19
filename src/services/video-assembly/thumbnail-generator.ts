import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

export interface ThumbnailRequest {
  title: string;
  style?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  additionalContext?: string;
}

export interface ThumbnailResult {
  imagePath: string;
  prompt: string;
  fireflySeed?: number;
}

export class ThumbnailGenerator {
  private readonly apiKey: string;
  private readonly outputDir: string;
  private readonly baseUrl = 'https://firefly-api.adobe.io/v3';

  constructor(fireflyApiKey: string) {
    this.apiKey = fireflyApiKey;
    this.outputDir = path.join(process.cwd(), 'output', 'thumbnails');
  }

  /**
   * Generate thumbnail using Adobe Firefly API
   */
  async generateThumbnail(request: ThumbnailRequest): Promise<ThumbnailResult> {
    try {
      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });

      // Construct prompt for YouTube thumbnail
      const prompt = this.constructPrompt(request);
      console.log(`Generating thumbnail with prompt: ${prompt}`);

      // Call Adobe Firefly API
      const imageUrl = await this.callFireflyAPI(prompt, request.aspectRatio || '16:9');

      // Download and save thumbnail
      const filename = `thumbnail-${Date.now()}.png`;
      const imagePath = await this.downloadImage(imageUrl, filename);

      console.log(`Thumbnail generated successfully: ${imagePath}`);
      return {
        imagePath,
        prompt,
      };
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw new Error(`Failed to generate thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Construct optimized prompt for YouTube thumbnail
   */
  private constructPrompt(request: ThumbnailRequest): string {
    const baseStyle = request.style || 'bold, high-contrast, professional YouTube thumbnail style';

    let prompt = `${request.title}, ${baseStyle}, `;
    prompt += 'eye-catching, vibrant colors, dramatic lighting, ';
    prompt += 'clear text readable at small sizes, ';
    prompt += 'professional quality, 4K resolution, ';
    prompt += 'attention-grabbing composition';

    if (request.additionalContext) {
      prompt += `, ${request.additionalContext}`;
    }

    return prompt;
  }

  /**
   * Call Adobe Firefly Text-to-Image API
   */
  private async callFireflyAPI(prompt: string, aspectRatio: string): Promise<string> {
    try {
      // Calculate dimensions based on aspect ratio
      const dimensions = this.getImageDimensions(aspectRatio);

      const response = await axios.post(
        `${this.baseUrl}/images/generate`,
        {
          prompt,
          contentClass: 'art', // or 'photo' depending on style
          size: {
            width: dimensions.width,
            height: dimensions.height,
          },
          n: 1, // Generate 1 image
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 second timeout
        }
      );

      if (!response.data?.outputs?.[0]?.image?.url) {
        throw new Error('Invalid response from Firefly API - no image URL returned');
      }

      return response.data.outputs[0].image.url;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const errorMessage = error.response?.data?.error?.message || error.message;

        if (statusCode === 401 || statusCode === 403) {
          throw new Error('Invalid Adobe Firefly API key or unauthorized access');
        } else if (statusCode === 429) {
          throw new Error('Adobe Firefly API rate limit exceeded');
        } else {
          throw new Error(`Firefly API error (${statusCode}): ${errorMessage}`);
        }
      }
      throw error;
    }
  }

  /**
   * Get image dimensions based on aspect ratio
   */
  private getImageDimensions(aspectRatio: string): { width: number; height: number } {
    const ratios: Record<string, { width: number; height: number }> = {
      '16:9': { width: 1920, height: 1080 },
      '4:3': { width: 1280, height: 960 },
      '1:1': { width: 1080, height: 1080 },
    };

    return ratios[aspectRatio] || ratios['16:9'];
  }

  /**
   * Download image from URL and save to disk
   */
  private async downloadImage(url: string, filename: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      const filePath = path.join(this.outputDir, filename);
      await fs.writeFile(filePath, response.data);

      return filePath;
    } catch (error) {
      console.error('Error downloading thumbnail:', error);
      throw new Error(`Failed to download thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate multiple thumbnail variations
   */
  async generateVariations(
    request: ThumbnailRequest,
    count: number = 3
  ): Promise<ThumbnailResult[]> {
    const results: ThumbnailResult[] = [];

    for (let i = 0; i < count; i++) {
      try {
        const result = await this.generateThumbnail(request);
        results.push(result);

        // Add delay between requests to avoid rate limiting
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error generating variation ${i + 1}:`, error);
        // Continue generating other variations even if one fails
      }
    }

    return results;
  }

  /**
   * Clean up generated thumbnails
   */
  async cleanup(): Promise<void> {
    try {
      await fs.rm(this.outputDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Error cleaning up thumbnails:', error);
    }
  }
}

/**
 * Factory function to create thumbnail generator
 */
export function createThumbnailGenerator(apiKey: string): ThumbnailGenerator {
  return new ThumbnailGenerator(apiKey);
}

/**
 * Generate thumbnail from video title
 */
export async function generateThumbnailFromTitle(
  title: string,
  apiKey: string
): Promise<string> {
  const generator = new ThumbnailGenerator(apiKey);
  const result = await generator.generateThumbnail({ title });
  return result.imagePath;
}
