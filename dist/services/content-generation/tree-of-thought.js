/**
 * TREE OF THOUGHT (ToT) REASONING ENGINE
 *
 * Explores multiple narrative paths for video ideas before script generation.
 * Prunes low-potential branches and selects the optimal creative direction.
 *
 * Based on verified ToT methodology from enterprise AI synthesis.
 */
import { llmRouter } from './llm-router.js';
export class TreeOfThought {
    config;
    constructor(config) {
        this.config = {
            maxBranches: config?.maxBranches || 5,
            maxDepth: config?.maxDepth || 3,
            pruneThreshold: config?.pruneThreshold || 0.6,
            contentType: config?.contentType || 'creative'
        };
    }
    /**
     * Main ToT execution: Explore narrative paths for a video idea
     */
    async explore(videoIdea, niche) {
        console.log(`\n🌳 Starting Tree of Thought exploration for: "${videoIdea.title}"`);
        console.log(`   Max branches: ${this.config.maxBranches}, Max depth: ${this.config.maxDepth}\n`);
        // Root node: the original idea
        const root = {
            id: 'root',
            content: videoIdea.description,
            score: 1.0,
            depth: 0,
            children: [],
            isPruned: false,
            isSelected: false
        };
        // Explore the tree depth-first
        await this.expandNode(root, videoIdea, niche);
        // Find the best leaf node
        const bestPath = this.findBestPath(root);
        // Calculate stats
        const stats = this.calculateStats(root);
        console.log(`\n✅ ToT exploration complete:`);
        console.log(`   Total nodes: ${stats.total}`);
        console.log(`   Pruned: ${stats.pruned}`);
        console.log(`   Best path score: ${bestPath.score.toFixed(2)}\n`);
        return {
            selectedPath: bestPath,
            tree: root,
            totalNodesExplored: stats.total,
            totalNodesPruned: stats.pruned
        };
    }
    /**
     * Recursively expand a node by generating child branches
     */
    async expandNode(node, videoIdea, niche) {
        // Stop if we've reached max depth
        if (node.depth >= this.config.maxDepth) {
            return;
        }
        // Generate child branches
        const children = await this.generateBranches(node, videoIdea, niche);
        // Score and prune
        const scoredChildren = await this.scoreNodes(children, videoIdea, niche);
        const prunedChildren = this.pruneNodes(scoredChildren);
        // Add surviving children to the tree
        node.children = prunedChildren;
        // Recursively expand each surviving child
        for (const child of prunedChildren) {
            await this.expandNode(child, videoIdea, niche);
        }
    }
    /**
     * Generate multiple narrative branches from a parent node
     */
    async generateBranches(parent, videoIdea, niche) {
        const prompt = `You are exploring creative narrative paths for a faceless YouTube video.

Video Title: "${videoIdea.title}"
Niche: ${niche}
Current narrative direction: "${parent.content}"

Generate ${this.config.maxBranches} different creative angles or story progressions for this video.
Each angle should be unique and engaging.

Return ONLY a JSON array of strings, each representing one narrative angle.
Example format: ["angle 1 description", "angle 2 description", ...]`;
        const request = {
            prompt,
            contentType: this.config.contentType,
            temperature: 0.9, // Higher temperature for creative diversity
            maxTokens: 1000
        };
        const response = await llmRouter.route(request);
        // Parse the response into narrative angles
        let angles;
        try {
            angles = JSON.parse(response.content);
        }
        catch {
            // Fallback: split by newlines if JSON parsing fails
            angles = response.content
                .split('\n')
                .filter(line => line.trim().length > 0)
                .slice(0, this.config.maxBranches);
        }
        // Create child nodes
        return angles.map((angle, index) => ({
            id: `${parent.id}-${index}`,
            parentId: parent.id,
            content: angle,
            score: 0, // Will be scored separately
            depth: parent.depth + 1,
            children: [],
            isPruned: false,
            isSelected: false
        }));
    }
    /**
     * Score nodes based on their potential for engagement and retention
     */
    async scoreNodes(nodes, videoIdea, niche) {
        const scorePromises = nodes.map(async (node) => {
            const prompt = `You are a YouTube performance analyst.

Video Title: "${videoIdea.title}"
Niche: ${niche}
Narrative Angle: "${node.content}"

Rate this narrative angle on a scale of 0.0 to 1.0 based on:
- Engagement potential (will viewers stay engaged?)
- Retention likelihood (will they watch to the end?)
- Virality potential (will they share it?)
- Uniqueness (is it different from competitors?)

Return ONLY a single number between 0.0 and 1.0.`;
            const request = {
                prompt,
                contentType: 'factual', // Use GPT-4o for analytical scoring
                temperature: 0.3, // Lower temperature for consistent scoring
                maxTokens: 10
            };
            const response = await llmRouter.route(request);
            // Extract score from response
            const scoreMatch = response.content.match(/0\.\d+|1\.0|0|1/);
            const score = scoreMatch ? parseFloat(scoreMatch[0]) : 0.5;
            return {
                ...node,
                score
            };
        });
        return Promise.all(scorePromises);
    }
    /**
     * Prune nodes below the threshold score
     */
    pruneNodes(nodes) {
        return nodes
            .map(node => {
            if (node.score < this.config.pruneThreshold) {
                return { ...node, isPruned: true };
            }
            return node;
        })
            .filter(node => !node.isPruned)
            .sort((a, b) => b.score - a.score); // Sort by score descending
    }
    /**
     * Find the best leaf node in the tree
     */
    findBestPath(root) {
        let bestNode = root;
        let bestScore = root.score;
        const traverse = (node) => {
            if (node.children.length === 0 && node.score > bestScore) {
                bestNode = node;
                bestScore = node.score;
            }
            for (const child of node.children) {
                traverse(child);
            }
        };
        traverse(root);
        return { ...bestNode, isSelected: true };
    }
    /**
     * Calculate tree statistics
     */
    calculateStats(root) {
        let total = 0;
        let pruned = 0;
        const traverse = (node) => {
            total++;
            if (node.isPruned)
                pruned++;
            for (const child of node.children) {
                traverse(child);
            }
        };
        traverse(root);
        return { total, pruned };
    }
    /**
     * Export tree as JSON for visualization
     */
    exportTree(root) {
        return JSON.stringify(root, null, 2);
    }
}
// Export singleton with default config
export const treeOfThought = new TreeOfThought();
// Export class for custom configurations
export { TreeOfThought as TreeOfThoughtEngine };
//# sourceMappingURL=tree-of-thought.js.map