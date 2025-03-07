import React, { useCallback, useEffect, useMemo } from "react";
import ReactQuill, { Quill } from "react-quill";

import { UseFormSetValue } from "react-hook-form";

import { InfoIcon } from "../../../../icons";
import { BlogFormValues } from "../UploadBlog";
// eslint-disable-next-line no-var
var Image = Quill.import("formats/image");
// eslint-disable-next-line no-var
var Size = Quill.import("attributors/style/size");
Size.whitelist = ["14px", "16px", "18px"];
Quill.register(Size, true);

function MarkUpEditor({
  setValue,
  errors,
  setImageList,
  quillRef,
}: {
  setValue: UseFormSetValue<BlogFormValues>;
  errors?: string;
  setImageList: React.Dispatch<React.SetStateAction<string[]>>;
  quillRef: React.RefObject<ReactQuill | null>;
}) {
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = () => {
      if (!input.files) return;

      const file = input.files[0];

      // Check if file size is under 2MB
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        alert("Image size must be under 2MB!"); // Replace with a proper toast if needed
        return;
      }

      const blobUrl = URL.createObjectURL(file);

      if (!quillRef?.current) return;
      if (!quillRef.current) return;
      const quillEditor = quillRef.current.getEditor();

      const range = quillEditor.getSelection(true);
      Image.sanitize = function (blobUrl: string) {
        return blobUrl; // You can modify the URL here
      };
      // Embed the Blob URL instead of Base64
      quillEditor.insertEmbed(range.index, "image", blobUrl, "user");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to extract all images currently present in the editor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getAllImagesInEditor = (quillEditor: any) => {
    const editorContents = quillEditor.getContents();
    return (
      editorContents.ops
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((op: any) => op.insert && op.insert.image)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((op: any) => op.insert.image)
    );
  };

  useEffect(() => {
    if (!quillRef?.current) return;
    // const quillEditor = quillRef.current.getEditor();
    if (!quillRef.current || typeof quillRef.current.getEditor !== "function")
      return;
    const quillEditor = quillRef.current.getEditor();

    const handleTextChange = () => {
      const allImages = getAllImagesInEditor(quillEditor);
      setImageList(allImages);
    };

    quillEditor.on("text-change", handleTextChange);

    return () => {
      quillEditor.off("text-change", handleTextChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, 4] }],
          ["bold", "italic", "underline"],
          [{ color: [] }],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: true,
      },
    }),
    [imageHandler]
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "clean",
  ];

  return (
    <div className="flex items-start flex-col">
      {/* <ReactQuill
        ref={quillRef}
        theme="snow"
        defaultValue={"<p>Start writing...</p>"}
        formats={formats}
        modules={modules}
        onChange={(value) => setValue("content", value)}
        className="w-full h-52 mb-10"
      /> */}
      <ReactQuill
        ref={(el) => {
          if (el) quillRef.current = el;
        }}
        theme="snow"
        defaultValue={"<p>Start writing...</p>"}
        formats={formats}
        modules={modules}
        onChange={(value) => setValue("content", value)}
        className="w-full h-52 mb-10"
      />

      {errors && (
        <span className="flex mt-2 gap-1 items-center text-error text-xs font-normal">
          <InfoIcon className="min-w-4 h-4 fill-error" />
          <span>{errors}</span>
        </span>
      )}
    </div>
  );
}

export default MarkUpEditor;
