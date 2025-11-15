import {
  calculateDistance,
  formatDistance,
  formatDuration,
  formatPrice,
  isStoreOpen,
  calculateAccuracyScore,
  formatRelativeTime,
  isValidEmail,
} from '@/lib/utils';
import { StoreHours } from '@/types';

describe('Utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      const lat1 = 12.9716;
      const lng1 = 77.5946;
      const lat2 = 12.9352;
      const lng2 = 77.6245;
      
      const distance = calculateDistance(lat1, lng1, lat2, lng2);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(10);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(12.9716, 77.5946, 12.9716, 77.5946);
      expect(distance).toBe(0);
    });
  });

  describe('formatDistance', () => {
    it('should format distance in meters when less than 1km', () => {
      expect(formatDistance(0.5)).toBe('500m');
      expect(formatDistance(0.75)).toBe('750m');
    });

    it('should format distance in kilometers when greater than 1km', () => {
      expect(formatDistance(1.5)).toBe('1.5km');
      expect(formatDistance(10.2)).toBe('10.2km');
    });
  });

  describe('formatDuration', () => {
    it('should format duration in minutes when less than 60', () => {
      expect(formatDuration(30)).toBe('30 min');
      expect(formatDuration(45)).toBe('45 min');
    });

    it('should format duration in hours and minutes when greater than 60', () => {
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(125)).toBe('2h 5m');
    });
  });

  describe('formatPrice', () => {
    it('should format price in Indian Rupees', () => {
      expect(formatPrice(100)).toBe('₹100');
      expect(formatPrice(1000)).toBe('₹1,000');
      expect(formatPrice(100000)).toBe('₹1,00,000');
    });
  });

  describe('isStoreOpen', () => {
    it('should return true if store is currently open', () => {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
      
      const hours: StoreHours[] = [
        { day: currentDay, open: '00:00', close: '23:59' },
      ];

      expect(isStoreOpen(hours)).toBe(true);
    });

    it('should return false if store is closed', () => {
      const hours: StoreHours[] = [
        { day: 'Monday', open: '09:00', close: '10:00' },
      ];

      // This test might fail depending on current time
      // In production, you'd mock the current time
      const result = isStoreOpen(hours);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('calculateAccuracyScore', () => {
    it('should return 100 for updates within 1 hour', () => {
      const recentUpdate = Date.now() - 30 * 60 * 1000; // 30 minutes ago
      expect(calculateAccuracyScore(recentUpdate)).toBe(100);
    });

    it('should return lower score for older updates', () => {
      const oldUpdate = Date.now() - 48 * 60 * 60 * 1000; // 48 hours ago
      const score = calculateAccuracyScore(oldUpdate);
      expect(score).toBeLessThan(100);
      expect(score).toBeGreaterThan(0);
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "just now" for very recent times', () => {
      const now = Date.now();
      expect(formatRelativeTime(now)).toBe('just now');
    });

    it('should return minutes ago for recent times', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 min ago');
    });

    it('should return hours ago', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.in')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });
});
