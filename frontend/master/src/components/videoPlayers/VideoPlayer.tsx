import { FC, useEffect, useRef } from "react";
import type { VideoPlayer as CloudinaryVideoPlayer } from "cloudinary-video-player";
import { videoPlayer } from "cloudinary-video-player";
import "cloudinary-video-player/cld-video-player.min.css";

interface VideoPlayerProps {
  id?: string;
  publicId: string;
  playerConfig?: object;
  sourceConfig?: object;
}

const VideoPlayer: FC<VideoPlayerProps> = ({
  id = "cloudinary-video",
  publicId,
  playerConfig = {},
  sourceConfig = {},
  ...props
}) => {
  const cloudinaryRef = useRef<
    null | ((...args: unknown[]) => CloudinaryVideoPlayer)
  >(null);
  const playerRef = useRef<HTMLVideoElement | null>(null);

  // Load Cloudinary Player
  useEffect(() => {
    const loadCloudinaryPlayer = async () => {
      if (!playerRef.current || cloudinaryRef.current) return;

      // Type assertion for better safety
      cloudinaryRef.current = videoPlayer as (
        ...args: unknown[]
      ) => CloudinaryVideoPlayer;

      if (cloudinaryRef.current) {
        const player = cloudinaryRef.current(id, {
          cloud_name: "drbhw0nwt",
          secure: true,
          controls: true,
          muted: true,
          ...playerConfig,
        });

        player.source(publicId, sourceConfig);

        return () => {
          player?.dispose();
        };
      }
    };

    loadCloudinaryPlayer();
  }, [id, publicId, playerConfig, sourceConfig]);

  return (
    <div className="relative w-full h-[600px] border border-[red]">
      <video
        ref={playerRef}
        id={id}
        {...props}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
};

export default VideoPlayer;
