import React from "react";
import ReactPlayer from "react-player";
import {
  InstagramEmbed,
  FacebookEmbed,
  TikTokEmbed,
  XEmbed,
} from "react-social-media-embed";
import { detectUrlType, isSocialMediaUrl } from "../../helpers/videoUrlHelpers";
import { Box } from "@mui/material";

interface UniversalMediaPlayerProps {
  url: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
  controls?: boolean;
  light?: boolean;
  /**
   * When true (and NOT a social media URL) the player is rendered in a responsive 16:9 wrapper.
   * Ignored for social embeds which size themselves intrinsically.
   */
  maintainAspectRatio?: boolean;
}

const UniversalMediaPlayer: React.FC<UniversalMediaPlayerProps> = ({
  url,
  width = "100%",
  height = "100%",
  style,
  controls = true,
  light = true,
  maintainAspectRatio = false,
}) => {
  if (!url || url === "") {
    return null;
  }

  const social = isSocialMediaUrl(url);

  if (social) {
    const urlType = detectUrlType(url);

    interface SocialEmbedProps {
      url: string;
      width?: string | number;
      height?: string | number;
    }

    const embedWidth: string | number =
      typeof width === "number" ? width : width;
    const embedHeight: string | number | undefined =
      height && height !== "100%"
        ? typeof height === "number"
          ? height
          : height
        : undefined;

    const embedProps: SocialEmbedProps = { url, width: embedWidth };
    if (embedHeight !== undefined) embedProps.height = embedHeight;

    const embedStyle: React.CSSProperties = {
      display: "flex",
      justifyContent: "center",
      width: typeof width === "number" ? `${width}px` : width,
      ...style,
    };

    switch (urlType) {
      case "instagram":
        return (
          <Box style={embedStyle}>
            <InstagramEmbed {...embedProps} />
          </Box>
        );
      case "facebook":
        return (
          <Box style={embedStyle}>
            <FacebookEmbed {...embedProps} />
          </Box>
        );
      case "tiktok":
        return (
          <Box style={embedStyle}>
            <TikTokEmbed {...embedProps} />
          </Box>
        );
      case "twitter":
        return (
          <Box style={embedStyle}>
            <XEmbed {...embedProps} />
          </Box>
        );
      default:
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

  // Non-social media: optionally maintain aspect ratio
  if (maintainAspectRatio) {
    return (
      <Box
        sx={{
          position: "relative",
          width: typeof width === "number" ? `${width}px` : width,
          // 16:9 aspect ratio
          paddingTop: "56.25%",
        }}
        style={style}
      >
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          style={{ position: "absolute", top: 0, left: 0 }}
          controls={controls}
          light={light}
        />
      </Box>
    );
  }

  // Default player rendering
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

export default UniversalMediaPlayer;
