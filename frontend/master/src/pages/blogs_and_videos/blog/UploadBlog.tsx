import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "../../../components/input/Input";
import Button from "../../../components/button/Button";
import { Controller, useForm } from "react-hook-form";
import Textarea from "../../../components/input/Textarea";
import DatePicker from "./components/DatePicker";
import { useRef } from "react";
import Quill, { Delta } from "quill";
import QuillEditor from "./components/QuillEditor";
import ImageUpload from "./components/ImageUpload";
import TagInput from "./components/TagInput";

interface FormBodyType {
  mainTitle: string;
  subTitle: string;
  author: string;
  description: string;
  content: string;
  tags: string[];
  publishedDate: Date | null;
  smallThumbnail: File | string | null;
  largeThumbnail: File | string | null;
}

const initialValues = {
  mainTitle: "",
  subTitle: "",
  author: "",
  description: "",
  content: "",
  tags: [],
  publishedDate: null,
  smallThumbnail: null,
  largeThumbnail: null,
};

const schema: yup.ObjectSchema<FormBodyType> = yup.object().shape({
  smallThumbnail: yup.mixed<File | string>().required("Thumbnail is required"),
  largeThumbnail: yup.mixed<File | string>().required("Thumbnail is required"),
  mainTitle: yup.string().required("Title is required"),
  subTitle: yup.string().required("Subtitle is required"),
  author: yup.string().required("Author is required"),
  description: yup.string().required("Description is required"),
  tags: yup
    .array(yup.string().required())
    .min(1, "At least one tag is required")
    .defined(),
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
    control,
    handleSubmit,
    register,
    setValue,
    trigger,
    watch,
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
        const file = new File([blob], `image_${index}.webp`, {
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
    <div className="p-4 mx-auto rounded-lg shadow-md bg-tertiary-inverted text-tertiary-inverted">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 w-full"
      >
        <div className="flex gap-4 w-full">
          <ImageUpload
            id="smallThumbnail"
            wrapperClassName="!w-1/3"
            className="!h-56"
            errorText={errors?.smallThumbnail?.message}
            previewImage={
              watch("smallThumbnail") instanceof File
                ? URL.createObjectURL(watch("smallThumbnail") as File)
                : ""
            }
            onChange={(file) => {
              if (file) {
                setValue("smallThumbnail", file);
                trigger("smallThumbnail");
              }
            }}
          />
          <ImageUpload
            id="largeThumbnail"
            wrapperClassName="!w-2/3"
            className="!h-56"
            errorText={errors?.largeThumbnail?.message}
            previewImage={
              watch("largeThumbnail") instanceof File
                ? URL.createObjectURL(watch("largeThumbnail") as File)
                : ""
            }
            onChange={(file) => {
              if (file) {
                setValue("largeThumbnail", file);
                trigger("largeThumbnail");
              }
            }}
          />
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
              label="Sub Title"
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
          <div className="w-ful">
            <Controller
              name="tags"
              control={control}
              defaultValue={[]}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <TagInput
                  label="tags"
                  setValue={onChange}
                  placeholder={"Enter Tags"}
                  tagsData={["3D models", "Render Quality", "Meta-Verse"]}
                  errorText={error?.message ?? ""}
                  selectedTagsData={value}
                />
              )}
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
              defaultValue={new Delta().insert("Write content here...")}
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
