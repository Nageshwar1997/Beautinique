import { InfoIcon, UploadCloudIcon } from "../../../../icons";
interface ImageUploadProps {
  wrapperClassName?: string;
  title?: string;
  className?: string;
  previewUrl?: string;
  errorText?: string;
}
const ImageUpload = ({
  className = "",
  wrapperClassName = "",
  errorText = "",
  previewUrl = "",
  title = "Upload",
}: ImageUploadProps) => {
  return (
    <div className={`w-full h-full flex flex-col gap-0.5 ${wrapperClassName}`}>
      <label
        htmlFor="smallThumbnail"
        className={`w-full h-full border border-primary-battleship-davys-gray rounded-xl relative overflow-hidden ${className}`}
      >
        <input
          name="smallThumbnail"
          id="smallThumbnail"
          type="file"
          className="hidden"
        />
        <div className="absolute left-0 top-0 w-full h-full bg-tertiary-inverted opacity-65 flex flex-col items-center justify-center gap-1">
          <img
            src={previewUrl || "/images/test/small.jpg"}
            alt="small"
            className="w-full h-full object-cover absolute inset-0 z-[-1]"
          />
          <UploadCloudIcon className="w-10 h-10 [&>path]:stroke-secondary" />
          <p className="text-secondary text-center text-lg font-medium">
            {title}
          </p>
        </div>
      </label>
      {errorText && (
        <span className="w-full text-start flex gap-1 items-center text-[11px] leading-tight mt-2 text-red-500">
          <InfoIcon className="w-3 h-3 md:w-4 md:h-4 fill-red-500" />
          {errorText}
        </span>
      )}
    </div>
  );
};

export default ImageUpload;
