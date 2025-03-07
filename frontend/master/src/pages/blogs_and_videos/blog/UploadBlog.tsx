import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "../../../components/input/Input";

import Button from "../../../components/button/Button";
import { Controller, useForm } from "react-hook-form";
import Textarea from "../../../components/input/Textarea";
import DatePicker from "./components/DatePicker";
import { useRef } from "react";
import Quill from "quill";
import QuillEditor from "./components/QuillEditor";
import { UploadCloudIcon } from "../../../icons";

interface FormBodyType {
  mainTitle: string;
  subTitle: string;
  author: string;
  description: string;
  content: string;
  publishedDate: Date | null; // Allow null explicitly
  smallThumbnail: File | string;
  largeThumbnail: File | string;
}

const initialValues = {
  mainTitle: "",
  subTitle: "",
  author: "",
  description: "",
  content: "",
  publishedDate: null,
  smallThumbnail: "",
  largeThumbnail: "",
};

const schema: yup.ObjectSchema<FormBodyType> = yup.object().shape({
  smallThumbnail: yup.mixed<File | string>().required("Thumbnail is required"),
  largeThumbnail: yup.mixed<File | string>().required("Thumbnail is required"),
  mainTitle: yup.string().required("Title is required"),
  subTitle: yup.string().required("Subtitle is required"),
  author: yup.string().required("Author is required"),
  description: yup.string().required("Description is required"),
  publishedDate: yup
    .date()
    .nullable() // Allow null values
    .transform((curr, orig) => (orig === "" ? null : curr)) // Convert empty strings to null
    .typeError("Invalid date format")
    .required("Date is required"),
  content: yup.string().required("Content is required"),
});

const UploadBlog = () => {
  const quillRef = useRef<Quill | null>(null);
  const blobUrlsRef = useRef<string[]>([]); // Store blob URLs for cleanup
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormBodyType>({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
  });
  const handleTextChange = () => {
    if (quillRef.current) {
      const content = quillRef.current.root.innerHTML;
      setValue("content", content);
    }
  };

  const onSubmit = async (data: FormBodyType) => {
    if (!quillRef.current) return;
    const quill = quillRef.current;
    let content = quill.root.innerHTML;

    const uploadPromises = blobUrlsRef.current.map(async (blobUrl, index) => {
      try {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        const file = new File([blob], `image-${index}.png`, {
          type: blob.type,
        });

        const formData = new FormData();
        formData.append("image", file);
        formData.append("folderName", "Blog_Images");

        const resp = await fetch("http://localhost:8080/api/upload/image", {
          method: "POST",
          body: formData,
        });

        const data = await resp.json();
        return { blobUrl, cloudUrl: data.cloudUrl };
      } catch (error) {
        console.error("Upload error:", error);
        return null;
      }
    });

    const uploadedImages = await Promise.all(uploadPromises);
    const validUploadedImages = uploadedImages.filter(
      (img): img is { blobUrl: string; cloudUrl: string } => img !== null
    );

    validUploadedImages.forEach(({ blobUrl, cloudUrl }) => {
      content = content.replace(blobUrl, cloudUrl);
    });

    setValue("content", content);
    quill.root.innerHTML = content; // Ensure editor updates

    console.log("Submit Data", { ...data, content });
  };
  return (
    <div className="p-4 mx-auto rounded-lg shadow-md bg-tertiary text-tertiary-inverted">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 w-full"
      >
        <div className="flex gap-4 w-full">
          <label
            htmlFor="smallThumbnail"
            className="block w-1/3 h-56 border border-primary-battleship-davys-gray rounded-xl overflow-hidden relative"
          >
            <img
              src="/images/test/small.jpg"
              alt="small"
              className="w-full h-full object-cover"
            />
            <input
              name="smallThumbnail"
              id="smallThumbnail"
              type="file"
              className="hidden"
            />
            <div className="absolute inset-0 w-full h-full bg-tertiary-inverted opacity-65 flex flex-col items-center justify-center gap-1">
              <UploadCloudIcon className="w-10 h-10 [&>path]:stroke-secondary" />
              <p className="text-secondary text-lg font-medium">
                Small Thumbnail
              </p>
            </div>
          </label>
          <label
            htmlFor="largeThumbnail"
            className="w-2/3 h-56 border border-primary-battleship-davys-gray rounded-xl overflow-hidden relative"
          >
            <img
              src="/images/test/large.jpg"
              alt="large"
              className="w-full h-full object-cover"
            />
            <input
              name="largeThumbnail"
              id="largeThumbnail"
              type="file"
              className="hidden"
            />
            <div className="absolute inset-0 w-full h-full bg-tertiary-inverted opacity-65 flex flex-col items-center justify-center gap-1">
              <UploadCloudIcon className="w-10 h-10 [&>path]:stroke-secondary" />
              <p className="text-secondary text-lg font-medium">
                Large Thumbnail
              </p>
            </div>
          </label>
        </div>
        <div className="flex flex-col gap-5 w-full">
          <div className="w-full">
            <Input
              label="Main Title"
              register={register("mainTitle")}
              errorText={errors?.mainTitle?.message}
            />
          </div>
          <div className="w-full">
            <Input
              label="Main Title"
              register={register("subTitle")}
              errorText={errors?.subTitle?.message}
            />
          </div>
          <div className="w-full">
            <Input
              label="Author"
              register={register("author")}
              errorText={errors?.author?.message}
            />
          </div>
          <div className="w-full">
            <Textarea
              label="Description"
              rows={3}
              register={register("description")}
              errorText={errors?.description?.message}
            />
          </div>
          <div className="w-full">
            <Controller
              name="publishedDate"
              control={control}
              defaultValue={null}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <DatePicker
                  label="Published date"
                  onDateChange={onChange}
                  placeholder="Select date"
                  selectedDate={value ?? null}
                  errorText={error?.message ?? ""}
                />
              )}
            />
          </div>
          <div className="w-full border border-[red]">
            <QuillEditor
              ref={quillRef}
              blobUrlsRef={blobUrlsRef}
              onTextChange={handleTextChange}
            />
            <p className="text-[red]">{errors?.content?.message}</p>
          </div>
        </div>
        <Button pattern="primary" content="Submit" type="submit" />
      </form>
    </div>
  );
};

export default UploadBlog;
