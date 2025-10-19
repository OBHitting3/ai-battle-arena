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

import QRCode from 'qrcode';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

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

export class QRReferralSystem {
  private dataDir: string;
  private qrDir: string;
  private usersFile: string;
  private referralsFile: string;
  private users: Record<string, User> = {};
  private referrals: Record<string, any[]> = {};

  constructor(baseDir: string = process.cwd()) {
    this.dataDir = path.join(baseDir, 'data', 'referrals');
    this.qrDir = path.join(baseDir, 'data', 'qr-codes');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.referralsFile = path.join(this.dataDir, 'referrals.json');

    this.ensureDirectories();
    this.loadData();
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectories(): void {
    [this.dataDir, this.qrDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Load user and referral data
   */
  private loadData(): void {
    // Load users
    if (fs.existsSync(this.usersFile)) {
      this.users = JSON.parse(fs.readFileSync(this.usersFile, 'utf8'));
    } else {
      this.saveUsers();
    }

    // Load referrals
    if (fs.existsSync(this.referralsFile)) {
      this.referrals = JSON.parse(fs.readFileSync(this.referralsFile, 'utf8'));
    } else {
      this.saveReferrals();
    }
  }

  /**
   * Save user data
   */
  private saveUsers(): void {
    fs.writeFileSync(this.usersFile, JSON.stringify(this.users, null, 2));
  }

  /**
   * Save referral data
   */
  private saveReferrals(): void {
    fs.writeFileSync(this.referralsFile, JSON.stringify(this.referrals, null, 2));
  }

  /**
   * Generate unique referral code
   */
  private generateReferralCode(username: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(username + Date.now())
      .digest('hex')
      .substring(0, 8)
      .toUpperCase();

    return `CASPER-${hash}`;
  }

  /**
   * Create a new user
   */
  async createUser(username: string, email: string): Promise<User> {
    if (this.users[username]) {
      throw new Error('Username already exists');
    }

    const referralCode = this.generateReferralCode(username);
    const signupUrl = `https://casper.app/signup?ref=${referralCode}`;

    // Generate QR code
    const qrPath = path.join(this.qrDir, `${referralCode}.png`);
    await QRCode.toFile(qrPath, signupUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Create user profile
    this.users[username] = {
      username,
      email,
      referralCode,
      qrCodePath: qrPath,
      signupUrl,
      credits: 0,
      team: [],
      referredBy: null,
      stats: {
        totalShares: 0,
        totalSignups: 0,
        totalEarnings: 0
      },
      createdAt: new Date().toISOString()
    };

    this.saveUsers();

    console.log(`\n✅ User created: ${username}`);
    console.log(`   Referral Code: ${referralCode}`);
    console.log(`   QR Code saved: ${qrPath}\n`);

    return this.users[username];
  }

  /**
   * Handle QR code scan event
   */
  handleScan(referralCode: string): User {
    const referrer = Object.values(this.users).find(
      user => user.referralCode === referralCode
    );

    if (!referrer) {
      throw new Error('Invalid referral code');
    }

    // Award $5 for the share
    referrer.credits += 5;
    referrer.stats.totalShares += 1;
    referrer.stats.totalEarnings += 5;

    this.saveUsers();

    console.log(`\n💰 ${referrer.username} earned $5 for sharing!`);
    console.log(`   Total credits: $${referrer.credits}`);

    return referrer;
  }

  /**
   * Handle new user signup via referral
   */
  async handleSignup(
    newUsername: string,
    newEmail: string,
    referralCode: string
  ): Promise<{ newUser: User; referrer: User }> {
    const referrer = Object.values(this.users).find(
      user => user.referralCode === referralCode
    );

    if (!referrer) {
      throw new Error('Invalid referral code');
    }

    // Create the new user
    const newUser = await this.createUser(newUsername, newEmail);
    newUser.referredBy = referrer.username;

    // Award $45 to referrer (already got $5 from scan, total $50)
    const signupBonus = 45;
    referrer.credits += signupBonus;
    referrer.stats.totalSignups += 1;
    referrer.stats.totalEarnings += signupBonus;

    // Add to team
    referrer.team.push({
      username: newUsername,
      joinedAt: new Date().toISOString()
    });

    // Track referral
    if (!this.referrals[referrer.username]) {
      this.referrals[referrer.username] = [];
    }

    this.referrals[referrer.username].push({
      referredUser: newUsername,
      signedUpAt: new Date().toISOString(),
      earnings: 50
    });

    this.saveUsers();
    this.saveReferrals();

    console.log(`\n🎉 ${referrer.username} earned $50 for ${newUsername}'s signup!`);
    console.log(`   Total credits: $${referrer.credits}`);
    console.log(`   Team size: ${referrer.team.length}`);

    return { newUser, referrer };
  }

  /**
   * Display QR code in terminal
   */
  async displayQRCode(username: string): Promise<void> {
    const user = this.users[username];
    if (!user) {
      throw new Error('User not found');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 YOUR REFERRAL QR CODE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Generate ASCII QR code for terminal display
    const qrAscii = await QRCode.toString(user.signupUrl, {
      type: 'terminal',
      small: true
    });

    console.log(qrAscii);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 SHARE THIS CODE TO EARN MONEY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`Referral Code: ${user.referralCode}`);
    console.log(`Signup URL: ${user.signupUrl}`);
    console.log(`QR Image: ${user.qrCodePath}\n`);

    console.log('💰 Rewards:');
    console.log('   • $5 when someone scans your code');
    console.log('   • $50 when they sign up (total)');
    console.log('   • They join your team for competitions\n');

    console.log('📊 Your Stats:');
    console.log(`   • Current Credits: $${user.credits}`);
    console.log(`   • Total Shares: ${user.stats.totalShares}`);
    console.log(`   • Total Signups: ${user.stats.totalSignups}`);
    console.log(`   • Total Earnings: $${user.stats.totalEarnings}`);
    console.log(`   • Team Size: ${user.team.length}\n`);

    if (user.team.length > 0) {
      console.log('👥 Your Team:');
      user.team.forEach((member, i) => {
        console.log(`   ${i + 1}. ${member.username} (joined ${new Date(member.joinedAt).toLocaleDateString()})`);
      });
      console.log();
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(limit: number = 10): LeaderboardEntry[] {
    return Object.values(this.users)
      .sort((a, b) => b.stats.totalEarnings - a.stats.totalEarnings)
      .slice(0, limit)
      .map((user, index) => ({
        rank: index + 1,
        username: user.username,
        totalEarnings: user.stats.totalEarnings,
        teamSize: user.team.length,
        totalSignups: user.stats.totalSignups
      }));
  }

  /**
   * Get team leaderboard
   */
  getTeamLeaderboard(limit: number = 10): TeamLeaderboardEntry[] {
    return Object.values(this.users)
      .map(user => this.getTeamEarnings(user.username))
      .sort((a, b) => b.teamEarnings - a.teamEarnings)
      .slice(0, limit)
      .map((team, index) => ({
        rank: index + 1,
        ...team
      }));
  }

  /**
   * Calculate team earnings
   */
  private getTeamEarnings(username: string): Omit<TeamLeaderboardEntry, 'rank'> {
    const user = this.users[username];
    if (!user) {
      throw new Error('User not found');
    }

    let teamEarnings = user.stats.totalEarnings;

    // Add earnings from all team members
    user.team.forEach(member => {
      const teamMember = this.users[member.username];
      if (teamMember) {
        teamEarnings += teamMember.stats.totalEarnings;
      }
    });

    return {
      username: user.username,
      personalEarnings: user.stats.totalEarnings,
      teamEarnings,
      teamSize: user.team.length
    };
  }

  /**
   * Display leaderboard
   */
  displayLeaderboard(limit: number = 10): void {
    const leaderboard = this.getLeaderboard(limit);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏆 TOP EARNERS LEADERBOARD');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (leaderboard.length === 0) {
      console.log('No users yet. Be the first!\n');
    } else {
      leaderboard.forEach(user => {
        const medal = user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : '  ';
        console.log(`${medal} #${user.rank}. ${user.username}`);
        console.log(`    Earnings: $${user.totalEarnings} | Team: ${user.teamSize} | Signups: ${user.totalSignups}\n`);
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Display team leaderboard
   */
  displayTeamLeaderboard(limit: number = 10): void {
    const teamLeaderboard = this.getTeamLeaderboard(limit);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 TEAM COMPETITION LEADERBOARD');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (teamLeaderboard.length === 0) {
      console.log('No teams yet. Build yours!\n');
    } else {
      teamLeaderboard.forEach(team => {
        const medal = team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : team.rank === 3 ? '🥉' : '  ';
        console.log(`${medal} #${team.rank}. ${team.username}'s Team`);
        console.log(`    Team Earnings: $${team.teamEarnings} | Personal: $${team.personalEarnings} | Team Size: ${team.teamSize}\n`);
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Get user stats
   */
  getUserStats(username: string): User {
    const user = this.users[username];
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
