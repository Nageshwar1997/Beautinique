import Button from "../../components/button/Button";

const BlogsAndVideos = () => {
  return (
    <div className="w-full space-y-3">
      <div className="w-full pb-2 border-b border-primary-50 flex justify-between items-center">
        <h3 className="text-3xl font-medium">Blogs & Videos</h3>
        <div className="flex gap-5 items-center">
          <Button
            pattern="secondary"
            content="Upload Blog"
            className="!py-2.5 !px-5 !rounded-lg"
          />
          <Button
            pattern="secondary"
            content="Upload Video"
            className="!py-2.5 !px-5 !rounded-lg text-nowrap"
          />
        </div>
      </div>
      <div className="space-y-5">
        {/* Video Section */}
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
        {/* Blogs Section */}
        <div className="border"></div>
      </div>
    </div>
  );
};

export default BlogsAndVideos;
