const AllVideos = () => {
  return (
    <div className="border w-full h-[53vh] rounded-xl overflow-hidden">
      <video
        src="/videos/home/Home-Vid-1.mp4"
        className="w-full h-full object-cover"
        muted
        autoPlay
        loop
        controls
      ></video>
    </div>
  );
};

export default AllVideos;
