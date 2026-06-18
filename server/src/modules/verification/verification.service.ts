import { VerificationRepository } from './verification.repository';
import { NotFoundError, BadRequestError } from '@/core/exceptions/AppError';

export class VerificationService {
  /**
   * Recalculates and updates the trust score dynamically based on rules:
   * Email Verified: +10
   * Phone Verified: +20
   * Completed Rental: +5 each
   * Positive Review (>= 4): +2 each
   * Verified Identity (Aadhaar & PAN): +40
   * Max: 100
   */
  static async recalculateTrustScore(userId: string) {
    const profile = await VerificationRepository.getTrustProfile(userId);
    if (!profile) throw new NotFoundError('Trust profile not found');

    let score = 0;

    // Rules
    if (profile.emailVerified) score += 10;
    if (profile.phoneVerified) score += 20;

    if (profile.aadhaarStatus === 'VERIFIED' && profile.panStatus === 'VERIFIED') {
      score += 40;
    }

    const completedRentals = await VerificationRepository.getCompletedRentalsCount(userId);
    score += (completedRentals * 5);

    const positiveReviews = await VerificationRepository.getPositiveReviewsCount(userId);
    score += (positiveReviews * 2);

    // Cap at 100
    if (score > 100) score = 100;

    const verifiedBadge = (profile.aadhaarStatus === 'VERIFIED' && profile.panStatus === 'VERIFIED');

    await VerificationRepository.updateTrustProfile(userId, {
      trustScore: score,
      verifiedBadge
    });

    return { score, verifiedBadge };
  }

  static async uploadDocuments(userId: string, aadhaarUrl: string, panUrl: string) {
    const profile = await VerificationRepository.getTrustProfile(userId);
    if (!profile) throw new NotFoundError('Trust profile not found');

    if (profile.aadhaarStatus === 'VERIFIED' || profile.panStatus === 'VERIFIED') {
      throw new BadRequestError('Documents are already verified');
    }

    await VerificationRepository.updateTrustProfile(userId, {
      aadhaarUrl,
      panUrl,
      aadhaarStatus: 'PENDING',
      panStatus: 'PENDING'
    });

    return { message: 'Documents uploaded successfully. Verification is pending.' };
  }

  static async autoVerifyUser(userId: string, aadhaarUrl: string, selfieUrl: string, matchScore: number, ocrText: string) {
    const profile = await VerificationRepository.getTrustProfile(userId);
    
    // Calculate new trust score (+40 for verified identity)
    let newScore = profile?.trustScore || 0;
    if (profile?.aadhaarStatus !== 'VERIFIED') {
      newScore += 40;
      if (newScore > 100) newScore = 100;
    }

    // Save and mark as verified
    return await VerificationRepository.updateTrustProfile(userId, {
      aadhaarUrl,
      selfieUrl,
      faceMatchScore: matchScore,
      ocrText,
      aadhaarStatus: 'VERIFIED',
      verifiedBadge: true,
      trustScore: newScore,
      verifiedAt: new Date()
    });
  }

  static async getStatus(userId: string) {
    const profile = await VerificationRepository.getTrustProfile(userId);
    if (!profile) throw new NotFoundError('Trust profile not found');

    const completedRentals = await VerificationRepository.getCompletedRentalsCount(userId);
    
    // Privacy feature: Do not return aadhaarUrl or panUrl
    return {
      trustScore: profile.trustScore,
      verifiedBadge: profile.verifiedBadge,
      aadhaarStatus: profile.aadhaarStatus,
      panStatus: profile.panStatus,
      emailVerified: profile.emailVerified,
      phoneVerified: profile.phoneVerified,
      completedRentals,
      faceMatchScore: profile.faceMatchScore
    };
  }

  static async approveVerification(targetUserId: string) {
    await VerificationRepository.updateTrustProfile(targetUserId, {
      aadhaarStatus: 'VERIFIED',
      panStatus: 'VERIFIED'
    });

    await this.recalculateTrustScore(targetUserId);
    return { message: 'User verified successfully' };
  }

  static async rejectVerification(targetUserId: string) {
    await VerificationRepository.updateTrustProfile(targetUserId, {
      aadhaarStatus: 'REJECTED',
      panStatus: 'REJECTED'
    });

    await this.recalculateTrustScore(targetUserId);
    return { message: 'User verification rejected' };
  }
}
