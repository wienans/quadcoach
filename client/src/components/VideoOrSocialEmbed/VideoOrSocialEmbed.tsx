import React from 'react';
import ReactPlayer from 'react-player';
import { 
  InstagramEmbed, 
  FacebookEmbed, 
  TikTokEmbed, 
  XEmbed 
} from 'react-social-media-embed';
import { detectUrlType, isSocialMediaUrl } from '../../helpers/videoUrlHelpers';
import { Box } from '@mui/material';

interface VideoOrSocialEmbedProps {
  url: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
  controls?: boolean;
  light?: boolean;
}

const VideoOrSocialEmbed: React.FC<VideoOrSocialEmbedProps> = ({
  url,
  width = '100%',
  height = '100%',
  style,
  controls = true,
  light = true,
}) => {
  if (!url || url === '') {
    return null;
  }

  // If it's a social media URL, use react-social-media-embed
  if (isSocialMediaUrl(url)) {
    const urlType = detectUrlType(url);
    
    // Common props for social embeds
    const embedProps = {
      url,
      width: typeof width === 'string' ? width : `${width}px`,
      height: typeof height === 'string' ? height : `${height}px`,
    };

    const embedStyle = {
      display: 'flex',
      justifyContent: 'center',
      ...style,
    };

    switch (urlType) {
      case 'instagram':
        return (
          <Box style={embedStyle}>
            <InstagramEmbed {...embedProps} />
          </Box>
        );
      
      case 'facebook':
        return (
          <Box style={embedStyle}>
            <FacebookEmbed {...embedProps} />
          </Box>
        );
      
      case 'tiktok':
        return (
          <Box style={embedStyle}>
            <TikTokEmbed {...embedProps} />
          </Box>
        );
      
      case 'twitter':
        return (
          <Box style={embedStyle}>
            <XEmbed {...embedProps} />
          </Box>
        );
      
      default:
        // Fallback to ReactPlayer for unknown social media URLs
        return (
          <ReactPlayer
            url={url}
            width={width}
            height={height}
            style={style}
            controls={controls}
            light={light}
          />
        );
    }
  }

  // For YouTube and other platforms, use react-player
  return (
    <ReactPlayer
      url={url}
      width={width}
      height={height}
      style={style}
      controls={controls}
      light={light}
    />
  );
};

export default VideoOrSocialEmbed;