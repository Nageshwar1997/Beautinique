import { useEffect, useRef } from "react";
import Hls from "hls.js";

const HLSVideoPlayer = ({
  videoUrl,
  className,
  isMuted = true,
  isLooping = true,
  controls = false,
  autoplay = true,
  posterURL = "",
}: {
  videoUrl: string;
  className?: string;
  isMuted?: boolean;
  isLooping?: boolean;
  autoplay?: boolean;
  controls?: boolean;
  posterURL?: string;
}) => {
  videoUrl =
    "https://res.cloudinary.com/drbhw0nwt/video/upload/sp_auto/v1739693059/videos/wvq939qkdpzgchfpzk2m.m3u8";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // const [playedTime, setPlayedTime] = useState(0);
  // const [remainingTime, setRemainingTime] = useState(0);
  // const [totalDuration, setTotalDuration] = useState(0);
  // const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(videoRef.current);

      // ✅ Log all available quality levels when manifest loads
      // hls.on(Hls.Events.MANIFEST_PARSED, () => {
      //   console.log(
      //     "Available quality levels:",
      //     hls.levels.map((l, i) => ({
      //       index: i,
      //       resolution: l.height + "p",
      //       bitrate: l.bitrate,
      //     }))
      //   );
      // });

      // ✅ Log when HLS switches quality automatically
      // hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      //   console.log(
      //     `Switched to quality level: ${data.level} (${
      //       hls.levels[data.level]?.height
      //     }p)`
      //   );
      // });

      // videoRef.current.onloadedmetadata = () => {
      //   setTotalDuration(videoRef.current?.duration || 0);
      // };

      // videoRef.current.ontimeupdate = () => {
      //   const currentTime = videoRef.current?.currentTime || 0;
      //   setPlayedTime(currentTime);
      //   setRemainingTime((videoRef.current?.duration || 0) - currentTime);
      // };
      return () => {
        hls.destroy();
      };
    }
  }, [videoUrl]);

  // const toggleMute = () => {
  //   if (videoRef.current) {
  //     videoRef.current.muted = !videoRef.current.muted;
  //     setIsMuted(videoRef.current.muted);
  //   }
  // };

  return (
    // <div>
    //   <p>
    //     {playedTime.toFixed()} / {totalDuration.toFixed()}
    //   </p>
    //   <p>{remainingTime.toFixed()}</p>
    <video
      ref={videoRef}
      controls={controls}
      muted={isMuted}
      autoPlay={autoplay}
      loop={isLooping}
      className={className}
      poster={posterURL}
    />
    //   <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>
    // </div>
  );
};

export default HLSVideoPlayer;
