import { useEffect, useRef, useState } from "react";
import cloudinary from "cloudinary-video-player";

interface VideoPlayerProps {
  id?: string;
  publicId: string;
  playerConfig?: object;
  sourceConfig?: object;
}

const CloudinaryPlayer: React.FC<VideoPlayerProps> = ({
  id = "cloudinary-video",
  publicId,
  playerConfig = {},
  sourceConfig = {},
  ...props
}) => {
  const cloudinaryRef = useRef<typeof cloudinary | null>(null);
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  console.log("cloudinaryref", cloudinaryRef);

  useEffect(() => {
    setIsMounted(true); // Ensure component is mounted before initializing player
  }, []);

  useEffect(() => {
    if (!isMounted || !playerRef.current || cloudinaryRef.current) return;

    cloudinaryRef.current = cloudinary;

    const player = cloudinaryRef.current.videoPlayer(id, {
      cloud_name: "drbhw0nwt",
      secure: true,
      controls: true,
      ...playerConfig,
    });

    player.source(publicId, sourceConfig);

    return () => {
      player?.dispose(); // Cleanup
    };
  }, [isMounted, id, publicId, playerConfig, sourceConfig]);

  return (
    <div className="video-container">
      <video
        ref={playerRef}
        id={id}
        className="cld-video-player cld-fluid w-96 h-auto object-cover"
        controls
        autoPlay
        loop
        muted
        {...props}
      />
    </div>
  );
};

export default CloudinaryPlayer;
