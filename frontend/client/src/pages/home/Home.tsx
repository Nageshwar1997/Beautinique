const Home = () => {
  return (
    <div className="w-full h-fit -mt-20 min-h-[120vh]">
      <video
        src="./videos/home/Home-Vid-1.mp4"
        // src="https://www.sugarcosmetics.com/cdn/shop/videos/c/vp/a5b5f895e0fa4f1fb2fc07c8f4f80868/a5b5f895e0fa4f1fb2fc07c8f4f80868.HD-1080p-7.2Mbps-40618378.mp4?v=0"
        className="w-full object-contain border"
        autoPlay
        loop
        muted
        controls
      ></video>
    </div>
  );
};

export default Home;
