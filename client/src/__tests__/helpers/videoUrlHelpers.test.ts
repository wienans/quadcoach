import { describe, it, expect } from 'vitest';
import { detectUrlType, isSocialMediaUrl } from '../../helpers/videoUrlHelpers';

describe('videoUrlHelpers', () => {
  describe('detectUrlType', () => {
    it('should return "unknown" for empty or invalid URLs', () => {
      expect(detectUrlType('')).toBe('unknown');
      expect(detectUrlType(null as any)).toBe('unknown');
      expect(detectUrlType(undefined as any)).toBe('unknown');
    });

    it('should detect Instagram URLs', () => {
      expect(detectUrlType('https://www.instagram.com/p/ABC123/')).toBe('instagram');
      expect(detectUrlType('https://instagram.com/reel/XYZ789')).toBe('instagram');
      expect(detectUrlType('HTTPS://WWW.INSTAGRAM.COM/P/ABC123/')).toBe('instagram');
    });

    it('should detect Facebook URLs', () => {
      expect(detectUrlType('https://www.facebook.com/video/12345')).toBe('facebook');
      expect(detectUrlType('https://facebook.com/watch?v=67890')).toBe('facebook');
      expect(detectUrlType('https://fb.com/video/12345')).toBe('facebook');
      expect(detectUrlType('HTTPS://WWW.FACEBOOK.COM/VIDEO/12345')).toBe('facebook');
    });

    it('should detect TikTok URLs', () => {
      expect(detectUrlType('https://www.tiktok.com/@user/video/12345')).toBe('tiktok');
      expect(detectUrlType('https://tiktok.com/t/ABC123')).toBe('tiktok');
      expect(detectUrlType('HTTPS://WWW.TIKTOK.COM/@USER/VIDEO/12345')).toBe('tiktok');
    });

    it('should detect Twitter/X URLs', () => {
      expect(detectUrlType('https://twitter.com/user/status/12345')).toBe('twitter');
      expect(detectUrlType('https://www.twitter.com/user/status/67890')).toBe('twitter');
      expect(detectUrlType('https://x.com/user/status/12345')).toBe('twitter');
      expect(detectUrlType('HTTPS://TWITTER.COM/USER/STATUS/12345')).toBe('twitter');
    });

    it('should default to "youtube" for other URLs', () => {
      expect(detectUrlType('https://www.youtube.com/watch?v=ABC123')).toBe('youtube');
      expect(detectUrlType('https://youtu.be/ABC123')).toBe('youtube');
      expect(detectUrlType('https://vimeo.com/12345')).toBe('youtube');
      expect(detectUrlType('https://example.com/video.mp4')).toBe('youtube');
      expect(detectUrlType('https://unknown-platform.com/video')).toBe('youtube');
    });

    it('should handle URLs with various protocols and subdomains', () => {
      expect(detectUrlType('http://instagram.com/p/test')).toBe('instagram');
      expect(detectUrlType('https://m.facebook.com/video/test')).toBe('facebook');
      expect(detectUrlType('https://vm.tiktok.com/test')).toBe('tiktok');
      expect(detectUrlType('https://mobile.twitter.com/test')).toBe('twitter');
    });
  });

  describe('isSocialMediaUrl', () => {
    it('should return true for social media URLs', () => {
      expect(isSocialMediaUrl('https://www.instagram.com/p/ABC123/')).toBe(true);
      expect(isSocialMediaUrl('https://www.facebook.com/video/12345')).toBe(true);
      expect(isSocialMediaUrl('https://www.tiktok.com/@user/video/12345')).toBe(true);
      expect(isSocialMediaUrl('https://twitter.com/user/status/12345')).toBe(true);
      expect(isSocialMediaUrl('https://x.com/user/status/12345')).toBe(true);
    });

    it('should return false for non-social media URLs', () => {
      expect(isSocialMediaUrl('https://www.youtube.com/watch?v=ABC123')).toBe(false);
      expect(isSocialMediaUrl('https://youtu.be/ABC123')).toBe(false);
      expect(isSocialMediaUrl('https://vimeo.com/12345')).toBe(false);
      expect(isSocialMediaUrl('https://example.com/video.mp4')).toBe(false);
      expect(isSocialMediaUrl('')).toBe(false);
      expect(isSocialMediaUrl('invalid-url')).toBe(false);
    });

    it('should handle case insensitive URLs', () => {
      expect(isSocialMediaUrl('HTTPS://WWW.INSTAGRAM.COM/P/ABC123/')).toBe(true);
      expect(isSocialMediaUrl('HTTPS://WWW.FACEBOOK.COM/VIDEO/12345')).toBe(true);
      expect(isSocialMediaUrl('HTTPS://WWW.TIKTOK.COM/@USER/VIDEO/12345')).toBe(true);
      expect(isSocialMediaUrl('HTTPS://TWITTER.COM/USER/STATUS/12345')).toBe(true);
    });
  });
});