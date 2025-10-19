/**
 * FACELESS AUTOMATION PLATFORM - MAIN ENTRY POINT
 *
 * This file demonstrates how to trigger the content creation workflow.
 * In production, this would be called by your FastAPI backend.
 */
import type { ContentWorkflowInput, ContentWorkflowResult } from './workflows/content-workflow.js';
/**
 * Trigger a content creation workflow
 */
declare function createVideo(input: ContentWorkflowInput): Promise<ContentWorkflowResult>;
export { createVideo };
//# sourceMappingURL=index.d.ts.map