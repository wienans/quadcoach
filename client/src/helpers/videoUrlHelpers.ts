/**
 * Utility functions for handling video URLs and social media embeds
 */

export type VideoUrlType =
  | "youtube"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "twitter"
  | "unknown";

/**
 * Detects the type of video/social media URL
 */
export const detectUrlType = (url: string): VideoUrlType => {
  if (!url) return "unknown";

  const lowerUrl = url.toLowerCase();

  // Instagram patterns
  if (lowerUrl.includes("instagram.com")) {
    return "instagram";
  }

  // Facebook patterns
  if (lowerUrl.includes("facebook.com") || lowerUrl.includes("fb.com")) {
    return "facebook";
  }

  // TikTok patterns
  if (lowerUrl.includes("tiktok.com")) {
    return "tiktok";
  }

  // Twitter/X patterns
  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) {
    return "twitter";
  }

  // YouTube and other platforms - let react-player handle
  return "youtube";
};

/**
 * Checks if the URL should be handled by react-social-media-embed
 */
export const isSocialMediaUrl = (url: string): boolean => {
  const urlType = detectUrlType(url);
  return ["instagram", "facebook", "tiktok", "twitter"].includes(urlType);
};
