/**
 * TREE OF THOUGHT (ToT) REASONING ENGINE
 *
 * Explores multiple narrative paths for video ideas before script generation.
 * Prunes low-potential branches and selects the optimal creative direction.
 *
 * Based on verified ToT methodology from enterprise AI synthesis.
 */
import type { TreeOfThoughtNode, VideoIdea } from '../../shared/types/index.js';
interface ToTConfig {
    maxBranches: number;
    maxDepth: number;
    pruneThreshold: number;
    contentType: 'creative' | 'factual' | 'mixed';
}
export declare class TreeOfThought {
    private config;
    constructor(config?: Partial<ToTConfig>);
    /**
     * Main ToT execution: Explore narrative paths for a video idea
     */
    explore(videoIdea: VideoIdea, niche: string): Promise<{
        selectedPath: TreeOfThoughtNode;
        tree: TreeOfThoughtNode;
        totalNodesExplored: number;
        totalNodesPruned: number;
    }>;
    /**
     * Recursively expand a node by generating child branches
     */
    private expandNode;
    /**
     * Generate multiple narrative branches from a parent node
     */
    private generateBranches;
    /**
     * Score nodes based on their potential for engagement and retention
     */
    private scoreNodes;
    /**
     * Prune nodes below the threshold score
     */
    private pruneNodes;
    /**
     * Find the best leaf node in the tree
     */
    private findBestPath;
    /**
     * Calculate tree statistics
     */
    private calculateStats;
    /**
     * Export tree as JSON for visualization
     */
    exportTree(root: TreeOfThoughtNode): string;
}
export declare const treeOfThought: TreeOfThought;
export { TreeOfThought as TreeOfThoughtEngine };
//# sourceMappingURL=tree-of-thought.d.ts.map