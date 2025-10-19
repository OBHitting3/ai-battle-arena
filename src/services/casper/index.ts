/**
 * CASPER - THE FACELESS GHOST
 * Complete AI-Powered YouTube Success Platform
 *
 * Main exports for the CASPER system
 */

export { CasperNicheValidator } from './niche-validator';
export { MultiAIPersonaSystem, AIPersona } from './multi-ai-persona';
export { EvaluatorDebateSystem, Evaluator } from './evaluator-debate-system';
export { QRReferralSystem } from './qr-referral-system';
export {
  CasperOrchestrator,
  type CasperConfig,
  type VideoCreationRequest,
  type VideoCreationResult,
  type TestRun
} from './casper-orchestrator';

// Re-export key types
export type {
  ScriptGenerationRequest,
  ScriptGenerationResult
} from './multi-ai-persona';

export type {
  Evaluation,
  DebateRound,
  DebateResult
} from './evaluator-debate-system';
