import VideoPlayer from "../../components/videoPlayers/VideoPlayer";

const Home = () => {
  return (
    <div className="w-full h-fit">
      {/* Video Section */}
      <VideoPlayer
        id="player2"
        publicId="videos/wvq939qkdpzgchfpzk2m"
        playerConfig={{
          muted: true,
          autoplay: true,
          loop: true,
          controls: false,
          // logLevel: "debug",
          posterOptions: {
            transformation: { effect: "blur" },
          },
        }}
      />
    </div>
  );
};

export default Home;
