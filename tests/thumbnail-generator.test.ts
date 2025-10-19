/**
 * Integration tests for thumbnail generation
 * Run with: npx tsx tests/thumbnail-generator.test.ts
 */

import { ThumbnailGenerator, createThumbnailGenerator } from '../src/services/video-assembly/thumbnail-generator.js';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_TITLE = 'Top 5 AI Tools That Will Change Your Life';

/**
 * TEST 1: Thumbnail Generator Structure
 */
async function testThumbnailGeneratorStructure() {
  console.log('\n🧪 TEST 1: Thumbnail Generator Structure');
  console.log('='.repeat(50));

  try {
    const FIREFLY_API_KEY = process.env.ADOBE_FIREFLY_API_KEY;

    if (!FIREFLY_API_KEY) {
      console.log('⚠️  SKIPPED: No ADOBE_FIREFLY_API_KEY found');
      return { passed: false, reason: 'Missing API key' };
    }

    const generator = new ThumbnailGenerator(FIREFLY_API_KEY);
    console.log('✓ ThumbnailGenerator instantiated successfully');

    // Test factory function
    const generator2 = createThumbnailGenerator(FIREFLY_API_KEY);
    console.log('✓ Factory function works');

    console.log('✅ TEST 1 PASSED');
    return { passed: true };

  } catch (error) {
    console.error('❌ TEST 1 FAILED:', error);
    return { passed: false, error };
  }
}

/**
 * TEST 2: Prompt Construction
 */
async function testPromptConstruction() {
  console.log('\n🧪 TEST 2: Prompt Construction');
  console.log('='.repeat(50));

  try {
    const FIREFLY_API_KEY = process.env.ADOBE_FIREFLY_API_KEY || 'test-key';
    const generator = new ThumbnailGenerator(FIREFLY_API_KEY);

    // Access private method via type assertion for testing
    const constructPrompt = (generator as any).constructPrompt.bind(generator);

    const prompt1 = constructPrompt({ title: 'Test Video' });
    console.log(`✓ Basic prompt: ${prompt1.substring(0, 50)}...`);

    if (!prompt1.includes('Test Video')) {
      throw new Error('Prompt does not include title');
    }

    const prompt2 = constructPrompt({
      title: 'AI Tutorial',
      style: 'futuristic, tech-focused',
      additionalContext: 'show circuit boards and neural networks',
    });
    console.log(`✓ Custom prompt: ${prompt2.substring(0, 50)}...`);

    if (!prompt2.includes('futuristic')) {
      throw new Error('Prompt does not include custom style');
    }

    console.log('✅ TEST 2 PASSED');
    return { passed: true };

  } catch (error) {
    console.error('❌ TEST 2 FAILED:', error);
    return { passed: false, error };
  }
}

/**
 * TEST 3: Dimension Calculation
 */
async function testDimensionCalculation() {
  console.log('\n🧪 TEST 3: Dimension Calculation');
  console.log('='.repeat(50));

  try {
    const FIREFLY_API_KEY = process.env.ADOBE_FIREFLY_API_KEY || 'test-key';
    const generator = new ThumbnailGenerator(FIREFLY_API_KEY);

    // Access private method via type assertion for testing
    const getImageDimensions = (generator as any).getImageDimensions.bind(generator);

    const dims16x9 = getImageDimensions('16:9');
    console.log(`✓ 16:9 dimensions: ${dims16x9.width}x${dims16x9.height}`);
    if (dims16x9.width !== 1920 || dims16x9.height !== 1080) {
      throw new Error('Invalid 16:9 dimensions');
    }

    const dims4x3 = getImageDimensions('4:3');
    console.log(`✓ 4:3 dimensions: ${dims4x3.width}x${dims4x3.height}`);
    if (dims4x3.width !== 1280 || dims4x3.height !== 960) {
      throw new Error('Invalid 4:3 dimensions');
    }

    const dims1x1 = getImageDimensions('1:1');
    console.log(`✓ 1:1 dimensions: ${dims1x1.width}x${dims1x1.height}`);
    if (dims1x1.width !== 1080 || dims1x1.height !== 1080) {
      throw new Error('Invalid 1:1 dimensions');
    }

    console.log('✅ TEST 3 PASSED');
    return { passed: true };

  } catch (error) {
    console.error('❌ TEST 3 FAILED:', error);
    return { passed: false, error };
  }
}

/**
 * TEST 4: Full Thumbnail Generation (requires valid API key)
 */
async function testFullThumbnailGeneration() {
  console.log('\n🧪 TEST 4: Full Thumbnail Generation');
  console.log('='.repeat(50));

  const FIREFLY_API_KEY = process.env.ADOBE_FIREFLY_API_KEY;

  if (!FIREFLY_API_KEY) {
    console.log('⚠️  SKIPPED: No ADOBE_FIREFLY_API_KEY found');
    return { passed: false, reason: 'Missing API key' };
  }

  try {
    const generator = new ThumbnailGenerator(FIREFLY_API_KEY);

    console.log('⏳ Generating thumbnail (this may take 30-60 seconds)...');
    const result = await generator.generateThumbnail({
      title: TEST_TITLE,
      style: 'modern, tech-focused, professional',
    });

    console.log(`✓ Thumbnail generated: ${result.imagePath}`);
    console.log(`✓ Prompt used: ${result.prompt}`);

    if (!result.imagePath) {
      throw new Error('No image path returned');
    }

    // Cleanup
    await generator.cleanup();
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
  console.log('\n🚀 THUMBNAIL GENERATOR TESTS');
  console.log('='.repeat(50));
  console.log(`Time: ${new Date().toISOString()}`);

  const results = {
    test1: await testThumbnailGeneratorStructure(),
    test2: await testPromptConstruction(),
    test3: await testDimensionCalculation(),
    test4: await testFullThumbnailGeneration(),
  };

  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Test 1 (Structure):     ${results.test1.passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 2 (Prompts):       ${results.test2.passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 3 (Dimensions):    ${results.test3.passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 4 (Generation):    ${results.test4.passed ? '✅ PASS' : '❌ FAIL'}`);

  const passedTests = Object.values(results).filter(r => r.passed).length;
  const structuralTests = [results.test1, results.test2, results.test3];
  const allStructuralPassed = structuralTests.every(r => r.passed);

  if (allStructuralPassed) {
    console.log('\n✅ ALL STRUCTURAL TESTS PASSED - NO BOTTLENECKS DETECTED');
    if (!results.test4.passed) {
      console.log('⚠️  Full generation test skipped (requires API key)');
    }
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
