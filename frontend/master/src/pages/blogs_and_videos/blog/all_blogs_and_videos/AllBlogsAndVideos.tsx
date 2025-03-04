import { useNavigate } from "react-router-dom";
import Button from "../../../../components/button/Button";
import AllVideos from "./components/AllVideos";
import AllBlogs from "./components/AllBlogs";

const AllBlogsAndVideos = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full space-y-3">
      <div className="w-full pb-2 border-b border-primary-50 flex justify-between items-center">
        <h3 className="text-3xl font-medium">Blogs & Videos</h3>
        <div className="flex gap-5 items-center">
          <Button
            pattern="secondary"
            content="Upload Blog"
            className="!py-2.5 !px-5 !rounded-lg"
            onClick={() => navigate("/blogs_and_videos/upload_blog")}
          />
          <Button
            pattern="secondary"
            content="Upload Video"
            className="!py-2.5 !px-5 !rounded-lg text-nowrap"
          />
        </div>
      </div>
      <div className="space-y-5">
        <AllVideos />
        <AllBlogs />
      </div>
    </div>
  );
};

export default AllBlogsAndVideos;
