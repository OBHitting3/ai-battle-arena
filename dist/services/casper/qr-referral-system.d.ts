/**
 * QR CODE REFERRAL SYSTEM
 *
 * Gamified referral system with QR codes and competitions
 *
 * Rewards:
 * - $5 credit when someone scans your QR code
 * - $50 credit when they sign up (total)
 * - Referred user joins your team
 *
 * Features:
 * - QR code generation
 * - Team building
 * - Leaderboards (individual and team)
 * - Monthly competitions
 */
interface User {
    username: string;
    email: string;
    referralCode: string;
    qrCodePath: string;
    signupUrl: string;
    credits: number;
    team: TeamMember[];
    referredBy: string | null;
    stats: UserStats;
    createdAt: string;
}
interface TeamMember {
    username: string;
    joinedAt: string;
}
interface UserStats {
    totalShares: number;
    totalSignups: number;
    totalEarnings: number;
}
interface LeaderboardEntry {
    rank: number;
    username: string;
    totalEarnings: number;
    teamSize: number;
    totalSignups: number;
}
interface TeamLeaderboardEntry {
    rank: number;
    username: string;
    personalEarnings: number;
    teamEarnings: number;
    teamSize: number;
}
export declare class QRReferralSystem {
    private dataDir;
    private qrDir;
    private usersFile;
    private referralsFile;
    private users;
    private referrals;
    constructor(baseDir?: string);
    /**
     * Ensure required directories exist
     */
    private ensureDirectories;
    /**
     * Load user and referral data
     */
    private loadData;
    /**
     * Save user data
     */
    private saveUsers;
    /**
     * Save referral data
     */
    private saveReferrals;
    /**
     * Generate unique referral code
     */
    private generateReferralCode;
    /**
     * Create a new user
     */
    createUser(username: string, email: string): Promise<User>;
    /**
     * Handle QR code scan event
     */
    handleScan(referralCode: string): User;
    /**
     * Handle new user signup via referral
     */
    handleSignup(newUsername: string, newEmail: string, referralCode: string): Promise<{
        newUser: User;
        referrer: User;
    }>;
    /**
     * Display QR code in terminal
     */
    displayQRCode(username: string): Promise<void>;
    /**
     * Get leaderboard
     */
    getLeaderboard(limit?: number): LeaderboardEntry[];
    /**
     * Get team leaderboard
     */
    getTeamLeaderboard(limit?: number): TeamLeaderboardEntry[];
    /**
     * Calculate team earnings
     */
    private getTeamEarnings;
    /**
     * Display leaderboard
     */
    displayLeaderboard(limit?: number): void;
    /**
     * Display team leaderboard
     */
    displayTeamLeaderboard(limit?: number): void;
    /**
     * Get user stats
     */
    getUserStats(username: string): User;
}
export {};
//# sourceMappingURL=qr-referral-system.d.ts.map