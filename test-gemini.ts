/**
 * TEST SCRIPT FOR @google/genai SDK
 *
 * This tests the EXACT API verified from node_modules/@google/genai/dist/node/node.d.ts
 * Run with: npx tsx test-gemini.ts
 */

import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

async function testGeminiAPI() {
  console.log('\n🧪 Testing @google/genai SDK...\n');

  // VERIFIED: Line 3350 in node.d.ts - GoogleGenAI class constructor
  // constructor(options: GoogleGenAIOptions);
  // Line 3375: GoogleGenAIOptions has apiKey?: string
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });
  console.log('✅ Step 1: GoogleGenAI initialized');

  try {
    // VERIFIED: Line 5157 in node.d.ts - Models.generateContent signature
    // generateContent: (params: types.GenerateContentParameters) => Promise<types.GenerateContentResponse>;

    // VERIFIED: Line 2680-2689 in node.d.ts - GenerateContentParameters interface
    // interface GenerateContentParameters {
    //   model: string;
    //   contents: ContentListUnion;
    //   config?: GenerateContentConfig;
    // }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: 'Respond with exactly this JSON: {"test": "success", "message": "API is working"}'
    });
    console.log('✅ Step 2: generateContent() called successfully');

    // VERIFIED: Line 2693 in node.d.ts - GenerateContentResponse class
    // class GenerateContentResponse {
    //   candidates?: Candidate[];
    // }

    // VERIFIED: Line 873-894 in node.d.ts - Candidate interface
    // interface Candidate {
    //   content?: Content;
    // }

    // VERIFIED: Line 1115-1122 in node.d.ts - Content interface
    // interface Content {
    //   parts?: Part[];
    // }

    // VERIFIED: Line 5725-5751 in node.d.ts - Part interface
    // interface Part {
    //   text?: string;
    // }

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No candidates in response');
    }

    const firstCandidate = response.candidates[0];
    if (!firstCandidate.content) {
      throw new Error('No content in first candidate');
    }

    if (!firstCandidate.content.parts || firstCandidate.content.parts.length === 0) {
      throw new Error('No parts in content');
    }

    const textPart = firstCandidate.content.parts[0];
    if (!textPart.text) {
      throw new Error('No text in first part');
    }

    console.log('✅ Step 3: Response structure validated');
    console.log('\n📝 Response text:', textPart.text);

    // Try to parse JSON
    const jsonMatch = textPart.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Step 4: JSON parsing successful');
      console.log('📦 Parsed object:', parsed);
    } else {
      console.log('⚠️  Warning: No JSON found in response (model might not have followed instructions)');
    }

    console.log('\n✅ ALL TESTS PASSED\n');

  } catch (error: any) {
    console.error('\n❌ TEST FAILED:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testGeminiAPI();
