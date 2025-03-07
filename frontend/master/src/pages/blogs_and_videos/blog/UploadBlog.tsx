import { FormEvent, useRef } from "react";

import Quill, { Delta, Range } from "quill";
import QuillEditor from "./components/QuillEditor";
import Input from "../../../components/input/Input";
import Textarea from "../../../components/input/Textarea";
import { UploadCloudIcon } from "../../../icons";
import DatePicker from "./components/DatePicker";
import Button from "../../../components/button/Button";

const UploadBlog = () => {
  const quillRef = useRef<Quill | null>(null);
  const blobUrlsRef = useRef<string[]>([]); // Store blob URLs for cleanup
  const contentRef = useRef("");

  const handleTextChange = () => {
    if (quillRef.current) {
      contentRef.current = quillRef.current.root.innerHTML; // Storing HTML content
      console.log("Updated Content:", contentRef.current);
    }
  };

  const handleSelectionChange = (
    range: Range | null,
    oldRange: Range | null,
    source: string
  ) => {
    if (!range) return;
    console.log("Old Selection:", oldRange);
    console.log("New Selection:", range);
    console.log("Source:", source);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!quillRef.current) return;

    const quill = quillRef.current;
    let content = quill.root.innerHTML; // Get the current Quill content
    console.log("Before Upload - Content:", content);

    // Map each blob URL to Cloudinary upload and get URLs
    const uploadPromises = blobUrlsRef.current.map(async (blobUrl, index) => {
      try {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        const file = new File([blob], `image-${index}.png`, {
          type: blob.type,
        });

        console.log("file", file);

        const formData = new FormData();
        formData.append("image", file);
        formData.append("folderName", "Blog_Images"); // Replace with your Cloudinary preset

        const resp = await fetch("http://localhost:8080/api/upload/image", {
          method: "POST",
          body: formData,
        });

        const data = await resp.json();
        console.log("Uploaded Image URL:", data);

        // return data.cloudUrl;

        // console.log(`Uploaded Image ${index}:`, data.secure_url);

        return { blobUrl, cloudUrl: data.cloudUrl };
      } catch (error) {
        console.error("Upload error:", error);
        return null;
      }
    });

    const uploadedImages = await Promise.all(uploadPromises);

    console.log("uploadedImages", uploadedImages);

    // Filter out null values to ensure type safety
    const validUploadedImages = uploadedImages.filter(
      (img): img is { blobUrl: string; cloudUrl: string } => img !== null
    );

    validUploadedImages.forEach(({ blobUrl, cloudUrl }) => {
      content = content.replace(blobUrl, cloudUrl);
    });

    console.log("After Upload - Updated Content:", content);

    // Update Quill editor with the new content
    quill.root.innerHTML = content;

    // Clear blob URL references
    blobUrlsRef.current = [];
  };
  return (
    <div className="p-4 mx-auto rounded-lg shadow-md bg-tertiary text-tertiary-inverted">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
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
            <Input label="Main Title" />
          </div>
          <div className="w-full">
            <Input label="Tags" />
          </div>
          <div className="w-full">
            <Input label="Author" />
          </div>
          <div className="w-full">
            <Input label="Sub-Title" />
          </div>
          <div className="w-full">
            <Textarea label="Description" rows={3} />
          </div>
          <div className="w-full">
            <DatePicker
              label="Published Date"
              onDateChange={() => {}}
              placeholder="YYYY-MM-DD"
              selectedDate={new Date()}
              key={"publishedDate"}
              errorText=""
            />
          </div>
        </div>

        <div className="border border-[red]">
          <QuillEditor
            ref={quillRef}
            defaultValue={new Delta().insert("Hello, world!\n")}
            blobUrlsRef={blobUrlsRef}
            onTextChange={handleTextChange}
            onSelectionChange={handleSelectionChange}
          />
        </div>
        <Button pattern="primary" content="Submit" />
      </form>
    </div>
  );
};

export default UploadBlog;
