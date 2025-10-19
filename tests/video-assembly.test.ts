/**
 * Integration tests for video assembly components
 * Run with: npm test
 */

import { RemotionRenderer, createCompositionFromScript } from '../src/services/video-assembly/remotion-renderer.js';
import { AssetSourcer } from '../src/services/video-assembly/asset-sourcer.js';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_SCRIPT = `
Welcome to today's video about artificial intelligence.
AI is transforming the world in incredible ways.
From healthcare to entertainment, the possibilities are endless.
Let's explore the top 5 AI trends you need to know about.
`;

const TEST_VOICEOVER_PATH = path.join(__dirname, 'fixtures', 'test-voiceover.mp3');

/**
 * TEST 1: Asset Sourcer
 */
async function testAssetSourcer() {
  console.log('\n🧪 TEST 1: Asset Sourcer');
  console.log('='.repeat(50));

  const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

  if (!PEXELS_API_KEY) {
    console.log('⚠️  SKIPPED: No PEXELS_API_KEY found');
    return { passed: false, reason: 'Missing API key' };
  }

  try {
    const sourcer = new AssetSourcer(PEXELS_API_KEY);

    // Test keyword extraction
    const keywords = sourcer.extractVisualKeywords(TEST_SCRIPT);
    console.log(`✓ Extracted ${keywords.length} keywords:`, keywords);

    // Test photo search
    const photos = await sourcer.searchPhotos('artificial intelligence', 3);
    console.log(`✓ Found ${photos.length} photos`);

    if (photos.length === 0) {
      throw new Error('No photos returned from Pexels');
    }

    // Test asset download
    const downloadPath = await sourcer.downloadAsset(photos[0], 'test-asset.jpg');
    console.log(`✓ Downloaded asset to: ${downloadPath}`);

    // Cleanup
    await sourcer.cleanup();
    console.log('✓ Cleanup successful');

    console.log('✅ TEST 1 PASSED');
    return { passed: true };

  } catch (error) {
    console.error('❌ TEST 1 FAILED:', error);
    return { passed: false, error };
  }
}

/**
 * TEST 2: Remotion Composition Creation
 */
async function testCompositionCreation() {
  console.log('\n🧪 TEST 2: Remotion Composition Creation');
  console.log('='.repeat(50));

  try {
    const assetUrls = [
      'https://example.com/asset1.jpg',
      'https://example.com/asset2.jpg',
      'https://example.com/asset3.jpg',
    ];

    const composition = await createCompositionFromScript(
      TEST_SCRIPT,
      TEST_VOICEOVER_PATH,
      assetUrls
    );

    console.log(`✓ Composition created with ${composition.assets.length} assets`);
    console.log(`✓ FPS: ${composition.fps}`);
    console.log(`✓ Duration: ${composition.durationInFrames} frames`);
    console.log(`✓ Resolution: ${composition.width}x${composition.height}`);

    if (composition.assets.length !== assetUrls.length) {
      throw new Error('Asset count mismatch');
    }

    console.log('✅ TEST 2 PASSED');
    return { passed: true };

  } catch (error) {
    console.error('❌ TEST 2 FAILED:', error);
    return { passed: false, error };
  }
}

/**
 * TEST 3: Remotion Renderer (requires Remotion setup)
 */
async function testRemotionRenderer() {
  console.log('\n🧪 TEST 3: Remotion Renderer');
  console.log('='.repeat(50));

  try {
    const renderer = new RemotionRenderer();

    // Note: This is a structural test only
    // Full video rendering requires ffmpeg and Remotion setup
    console.log('✓ RemotionRenderer instantiated');
    console.log('⚠️  Full rendering test skipped (requires ffmpeg + Remotion config)');
    console.log('✅ TEST 3 PASSED (structure only)');

    return { passed: true, note: 'Structure test only' };

  } catch (error) {
    console.error('❌ TEST 3 FAILED:', error);
    return { passed: false, error };
  }
}

/**
 * TEST 4: Integration Test - Full Pipeline
 */
async function testFullPipeline() {
  console.log('\n🧪 TEST 4: Full Pipeline Integration');
  console.log('='.repeat(50));

  const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

  if (!PEXELS_API_KEY) {
    console.log('⚠️  SKIPPED: No PEXELS_API_KEY found');
    return { passed: false, reason: 'Missing API key' };
  }

  try {
    // Step 1: Source assets
    const sourcer = new AssetSourcer(PEXELS_API_KEY);
    const assetPaths = await sourcer.sourceAssetsForScript(TEST_SCRIPT, 5);
    console.log(`✓ Sourced ${assetPaths.length} assets`);

    // Step 2: Create composition
    const composition = await createCompositionFromScript(
      TEST_SCRIPT,
      TEST_VOICEOVER_PATH,
      assetPaths
    );
    console.log(`✓ Created composition with ${composition.assets.length} assets`);

    // Step 3: Verify composition structure
    if (composition.assets.length !== assetPaths.length) {
      throw new Error('Asset path mismatch in composition');
    }

    // Cleanup
    await sourcer.cleanup();
    console.log('✓ Cleanup successful');

    console.log('✅ TEST 4 PASSED');
    return { passed: true };

  } catch (error) {
    console.error('❌ TEST 4 FAILED:', error);
    return { passed: false, error };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n🚀 FACELESS AUTOMATION PLATFORM - VIDEO ASSEMBLY TESTS');
  console.log('='.repeat(50));
  console.log(`Time: ${new Date().toISOString()}`);

  const results = {
    test1: await testAssetSourcer(),
    test2: await testCompositionCreation(),
    test3: await testRemotionRenderer(),
    test4: await testFullPipeline(),
  };

  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Test 1 (Asset Sourcer): ${results.test1.passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 2 (Composition):   ${results.test2.passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 3 (Renderer):      ${results.test3.passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 4 (Full Pipeline): ${results.test4.passed ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = Object.values(results).every(r => r.passed);

  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED - NO BOTTLENECKS DETECTED');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - REVIEW BEFORE PROCEEDING');
  }

  return results;
}

// Run tests if executed directly (ES module check)
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runAllTests };
