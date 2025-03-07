import { UploadCloudIcon } from "../../../../icons";

const Thumbnails = () => {
  return (
    <div className="flex gap-4 w-full">
      <div className="w-1/3 h-56 border border-primary-battleship-davys-gray rounded-xl overflow-hidden relative">
        <img
          src="/images/test/small.jpg"
          alt="small"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 w-full h-full bg-tertiary-inverted opacity-65 flex flex-col items-center justify-center gap-1">
          <UploadCloudIcon className="w-10 h-10 [&>path]:stroke-secondary" />
          <p className="text-secondary text-lg font-medium">Small Thumbnail</p>
        </div>
      </div>
      <div className="w-2/3 h-56 border border-primary-battleship-davys-gray rounded-xl overflow-hidden relative">
        <img
          src="/images/test/large.jpg"
          alt="large"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 w-full h-full bg-tertiary-inverted opacity-65 flex flex-col items-center justify-center gap-1">
          <UploadCloudIcon className="w-10 h-10 [&>path]:stroke-secondary" />
          <p className="text-secondary text-lg font-medium">Large Thumbnail</p>
        </div>
      </div>
    </div>
  );
};

export default Thumbnails;
