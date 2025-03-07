import { FC, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CameraIcon, InfoIcon } from "../../../../icons";

type PreviewImageType = string | ArrayBuffer | null | undefined;

interface ImageUploadProps {
  label?: string;
  onChange: (file: FileList | null) => void;
  errorText?: string | undefined;
  title?: string;
  className?: string;
  previewImage?: PreviewImageType;
  imagePreviewReset?: boolean;
}
const ImageUpload: FC<ImageUploadProps> = ({
  label,
  onChange,
  errorText,
  title,
  className,
  previewImage,
  imagePreviewReset,
}) => {
  const [previewUrl, setPreviewUrl] = useState<PreviewImageType>(null);

  useEffect(() => {
    setPreviewUrl(previewImage ?? null);
  }, [previewImage]);

  useEffect(() => {
    if (imagePreviewReset) {
      setPreviewUrl(null);
    }
  }, [imagePreviewReset]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      // Validate file type
      if (file) {
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/jpg",
        ];
        if (!validTypes.includes(file.type)) {
          toast.error("Invalid file format. Please upload a valid image file.");
          return;
        }

        const blobUrl = URL.createObjectURL(file);
        setPreviewUrl(blobUrl);

        onChange(e.target.files);

        return () => URL.revokeObjectURL(blobUrl);
      }

      setPreviewUrl(null);
      onChange(null);
    },
    [onChange]
  );

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && (
        <label className="text-xs font-medium text-surface-dark-primary">
          {label}
        </label>
      )}
      <div className="relative w-32 h-32 group mt-2">
        <div
          className={`w-32 h-32 rounded-full overflow-hidden border border-surface-light-contrast2 ${
            errorText && "!border-error"
          } ${!previewUrl ? "bg-gray-100" : ""}`}
        >
          {previewUrl ? (
            <img
              src={typeof previewUrl === "string" ? previewUrl : undefined}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CameraIcon
                className={`${errorText && "!fill-error"} fill-gray-400`}
              />
            </div>
          )}
        </div>
        <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity text-center">
          <span className="text-sm">{title ?? "Upload Photo"}</span>
          <input
            type="file"
            className="hidden"
            accept="image/webp, image/png, image/jpeg, image/jpg"
            onChange={handleImageChange}
          />
        </label>
      </div>
      {errorText && (
        <span className="flex gap-1 items-center text-error text-xs font-normal mt-2">
          <InfoIcon className="min-w-4 h-4 fill-error" />
          {errorText}
        </span>
      )}
    </div>
  );
};

export default ImageUpload;
