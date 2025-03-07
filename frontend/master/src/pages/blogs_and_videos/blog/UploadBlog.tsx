import { useNavigate } from "react-router-dom";
import { LeftArrowIcon } from "../../../icons";
import ImageUpload from "./components/ImageUpload";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { blogFormSchema } from "./blogFormSchema";
import { InferType } from "yup";
import { useRef, useState } from "react";
import { add_image_to_cdn, useAddBlogs } from "./apis";
import ReactQuill from "react-quill";
import Input from "../../../components/input/Input";
import TagInput from "./components/TagInput";
import DatePicker from "./components/DatePicker";
import MarkUpEditor from "./components/MarkUpEditor";
import Button from "../../../components/button/Button";

export type BlogFormValues = Omit<
  InferType<typeof blogFormSchema>,
  | "publishedDate"
  | "smallThumbnail"
  | "largeThumbnail"
  | "seoKeywords"
  | "seoTitle"
  | "seoDescription"
  | "seoAuthor"
> & {
  _id?: string;
  publishedDate: Date | null;
  largeThumbnail: File | null | string;
  smallThumbnail: File | null | string;
  seo?: {
    title: string;
    author: string;
    description: string;
    keywords: string[];
  };
};

const initialValues: BlogFormValues = {
  _id: undefined, // Optional ID
  title: "",
  content: "",
  url: "",
  publishedDate: null,
  smallThumbnail: null,
  largeThumbnail: null,
  seo: {
    title: "",
    author: "",
    description: "",
    keywords: [],
  },
};

const UploadBlog = () => {
  const navigate = useNavigate();
  const addBlogs = useAddBlogs();
  const [imageList, setImageList] = useState<string[]>([]);
  const quillRef = useRef<ReactQuill | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    trigger,
    watch,
    formState: { errors },
  } = useForm<BlogFormValues>({
    resolver: yupResolver(blogFormSchema),
    defaultValues: initialValues,
  });

  const handleReset = () => {
    reset();
  };

  const onSubmit = async (data: BlogFormValues) => {
    if (addBlogs.isPending || isExecuting) return;
    if (!quillRef?.current) return;

    setIsExecuting(true);

    const quillEditor = quillRef.current.getEditor();
    let editorContent = quillEditor.root.innerHTML;

    try {
      const addFormData = new FormData();

      // Handle images inside editor
      if (imageList.length > 0) {
        const formData = new FormData();

        const uploadPromises = imageList.map(async (localUrl) => {
          const response = await fetch(localUrl);
          const blob = await response.blob();
          const file = new File([blob], `image-${Date.now()}.webp`, {
            type: "image/webp",
          });
          formData.append("files", file);
        });

        await Promise.all(uploadPromises);
        const cdnUrls = await add_image_to_cdn(formData);

        if (cdnUrls?.data?.data?.length) {
          cdnUrls.data.data.forEach((cdnUrl: string, index: number) => {
            editorContent = editorContent.replace(imageList[index], cdnUrl);
          });
        }
      }

      // Append form fields
      addFormData.append(
        "seo",
        JSON.stringify({
          title: data.seo?.title || "",
          author: data.seo?.author || "",
          description: data.seo?.description || "",
          keywords: data.seo?.keywords || [],
        })
      );
      addFormData.append("title", data.title);
      addFormData.append("url", data.url);
      addFormData.append(
        "publishedDate",
        data.publishedDate ? data.publishedDate.toISOString() : ""
      );
      addFormData.append("content", editorContent);

      // Append thumbnails only if they exist
      if (data.smallThumbnail instanceof File) {
        addFormData.append("smallThumbnail", data.smallThumbnail);
      }
      if (data.largeThumbnail instanceof File) {
        addFormData.append("largeThumbnail", data.largeThumbnail);
      }

      // Submit data
      // addBlogs.mutate(addFormData, {
      //   onSuccess: () => {
      //     navigate(-1);
      //   },
      //   onSettled: () => {
      //     setIsExecuting(false);
      //   },
      // });
    } catch (error) {
      console.error("Error during submission:", error);
      setIsExecuting(false);
    }
  };

  return (
    <div className="p-4 mx-auto rounded-lg shadow-md bg-tertiary text-tertiary-inverted">
      <div className="flex justify-start gap-4 items-center">
        <LeftArrowIcon
          className="cursor-pointer [&>path]:!fill-tertiary-inverted w-5 h-5"
          onClick={() => navigate(-1)}
        />
        <h1 className="font-semibold text-xl">New Blog</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <ImageUpload
          onChange={(fileList) => {
            const file = fileList?.[0];
            if (file) {
              setValue("largeThumbnail", file, { shouldValidate: true });
              trigger("largeThumbnail");
            }
          }}
          title="Upload large thumbnail"
          label="Large thumbnail"
          errorText={errors.largeThumbnail?.message}
          className="items-start [&>div]:w-full [&>div]:h-48 [&>div>div]:w-full [&>div>div]:h-48 [&>div>div]:rounded-md [&>div>label]:rounded-md"
          previewImage={
            watch("largeThumbnail")
              ? URL.createObjectURL(watch("largeThumbnail") as File)
              : null
          }
        />
        <ImageUpload
          onChange={(fileList) => {
            const file = fileList?.[0];
            if (file) {
              setValue("smallThumbnail", file);
              trigger("smallThumbnail");
            }
          }}
          title="Upload small thumbnail"
          label="Small thumbnail"
          errorText={errors.smallThumbnail?.message}
          className="items-start [&>div]:w-full [&>div>div]:w-full [&>div>div]:rounded-md [&>div>label]:rounded-md"
          previewImage={
            watch("smallThumbnail")
              ? URL.createObjectURL(watch("smallThumbnail") as File)
              : null
          }
        />
        <div className="flex items-center gap-2 mt-4">
          <h1 className="font-semibold text-lg">SEO</h1>
          <div className="h-px bg-primary-inverted w-full" />
        </div>
        <div className="">
          <p>Title</p>
          <Input
            placeholder="Enter title"
            {...register("seo.title")}
            errorText={errors.seo?.title?.message}
          />
        </div>
        <div className="">
          <p>Description</p>
          <Input
            placeholder={"Enter description"}
            register={register("seo.description")}
            errorText={errors?.seo?.description?.message}
          />
        </div>
        <div className="">
          <p>Keywords</p>
          <Controller
            name="seo.keywords"
            control={control}
            defaultValue={[]}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TagInput
                label="Keywords"
                setValue={onChange}
                placeholder={"Enter keywords"}
                tagsData={["3D models", "Render Quality", "Meta-Verse"]}
                errorText={error?.message ?? ""}
                selectedTagsData={value}
              />
            )}
          />
        </div>
        <div className="">
          <p>Author</p>
          <Input
            placeholder={"Enter author"}
            register={register("seo.author")}
            errorText={errors.seo?.author?.message}
          />
        </div>
        <div className="flex items-center gap-2 mt-4">
          <h1 className="font-semibold text-lg">Info</h1>
          <div className="h-px bg-primary-inverted w-full" />
        </div>
        <div className="">
          <p>Title</p>
          <Input
            placeholder={"Enter title"}
            register={register("title")}
            errorText={errors.title?.message}
          />
        </div>
        <div className="">
          <p>Slug / URL</p>
          <Input
            placeholder={"Enter Slug / URL"}
            register={register("url")}
            errorText={errors.url?.message}
          />
        </div>
        <Controller
          name="publishedDate"
          control={control}
          defaultValue={null}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <DatePicker
              label="Published date"
              selectedDate={value}
              onDateChange={onChange}
              errorText={error?.message ?? ""}
            />
          )}
        />
        <div className="flex items-center gap-2 mt-4">
          <h1 className="font-semibold text-lg">Content</h1>
          <div className="h-px bg-primary-inverted w-full" />
        </div>
        <MarkUpEditor
          errors={errors.content?.message}
          setValue={setValue}
          setImageList={setImageList}
          quillRef={quillRef}
        />
        <div className="flex w-1/2 mx-auto gap-5">
          <Button
            pattern="primary"
            onClick={handleReset}
            // className="!bg-surface-light-contrast1 !text-surface-dark-primary !leading-0 !max-w-full"
            content={"Reset"}
          />
          <Button
            pattern="secondary"
            type="submit"
            // className="!bg-surface-light-contrast1 !text-surface-dark-primary !leading-0 !max-w-full"
            content={"Reset"}
          />
        </div>
      </form>
    </div>
  );
};

export default UploadBlog;
