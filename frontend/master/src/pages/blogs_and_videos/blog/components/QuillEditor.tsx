import { forwardRef, RefObject, useEffect, useRef } from "react";
import Quill, {
  Delta,
  // Range
} from "quill";
import "quill/dist/quill.snow.css";

// Import Image format from Quill
const Image = Quill.import("formats/image") as {
  sanitize?: (url: string) => string;
};

// Ensure Image has a sanitize method before modifying
if (Image && typeof Image.sanitize === "function") {
  Image.sanitize = function (url: string): string {
    if (url.startsWith("blob:")) {
      return url; // Allow Blob URLs
    }
    const Link = Quill.import("formats/link") as {
      sanitize?: (url: string) => string;
    };
    return Link?.sanitize ? Link.sanitize(url) : url; // Use link sanitizer if available
  };
}

// Register the modified Image format
Quill.register("formats/image", Image, true);

interface EditorProps {
  readOnly?: boolean;
  defaultValue?: Delta;
  onTextChange?: (delta: Delta, oldDelta: Delta, source: string) => void;
  blobUrlsRef: RefObject<string[]>;
  // onSelectionChange?: (
  //   range: Range | null,
  //   oldRange: Range | null,
  //   source: string
  // ) => void;
}

const QuillEditor = forwardRef<Quill | null, EditorProps>(
  (
    {
      readOnly,
      defaultValue,
      onTextChange,
      // onSelectionChange,
      blobUrlsRef,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const editorContainer = document.createElement("div");
      container.innerHTML = ""; // Clear previous content
      container.appendChild(editorContainer);

      const quill = new Quill(editorContainer, {
        theme: "snow",
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, 4, false] }],
              ["bold", "italic", "underline"],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ script: "sub" }, { script: "super" }],
              [{ indent: "-1" }, { indent: "+1" }],
              [{ size: ["small", "medium", "large", "huge"] }],
              ["link", "image"],
              ["clean"],
            ],
            handlers: {
              image: function () {
                handleImageUpload(quill, blobUrlsRef);
              },
            },
          },
        },
      });

      if (defaultValue) {
        quill.setContents(defaultValue);
      }

      quill.on("text-change", (delta, oldDelta, source) => {
        onTextChange?.(delta, oldDelta, source);
        removeUnusedBlobUrls(quill, blobUrlsRef);
      });

      // quill.on("selection-change", (range, oldRange, source) => {
      //   onSelectionChange?.(range, oldRange, source);
      // });

      // ✅ Set ref directly (no need for `quillInstance`)
      if (typeof ref === "function") {
        ref(quill);
      } else if (ref && "current" in ref) {
        ref.current = quill;
      }

      return () => {
        if (ref && "current" in ref) {
          ref.current = null;
        }
        container.innerHTML = ""; // Cleanup

        // Revoke all blob URLs to free memory
        blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        blobUrlsRef.current = [];
      };
    }, [
      blobUrlsRef,
      defaultValue,
      // onSelectionChange,
      onTextChange,
      ref,
    ]);

    useEffect(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.enable(!readOnly);
      }
    }, [readOnly, ref]);

    return <div ref={containerRef} />;
  }
);

// NewEditor.displayName = "Editor";

export default QuillEditor;

/**
 * Handles image uploads and inserts them into Quill
 */
const handleImageUpload = (quill: Quill, blobUrlsRef: RefObject<string[]>) => {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();

  input.onchange = async () => {
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be under 2MB!");
      return;
    }

    // Create a Blob URL for the image
    const blobUrl = URL.createObjectURL(file);
    console.log("✅ Image Blob URL:", blobUrl);

    // Get the current selection in the Quill editor
    const range = quill.getSelection();
    if (!range) return;

    // Store blob URL for cleanup
    blobUrlsRef.current.push(blobUrl);

    console.log("blobUrlsRef", blobUrlsRef.current);

    // Insert the image with the blob URL
    quill.insertEmbed(range.index, "image", blobUrl, "user");

    // Move cursor forward to prevent infinite loop issues
    quill.setSelection(range.index + 1);
  };
};

/**
 * Removes unused blob URLs when an image is deleted from the editor
 */
const removeUnusedBlobUrls = (
  quill: Quill,
  blobUrlsRef: RefObject<string[]>
) => {
  // Get all current images inside the editor
  const editorImages = Array.from(quill.root.querySelectorAll("img")).map(
    (img) => img.getAttribute("src")
  );

  // Find blob URLs that are no longer in the editor
  const removedBlobUrls = blobUrlsRef.current.filter(
    (url) => !editorImages.includes(url)
  );

  // Revoke removed blob URLs
  removedBlobUrls.forEach((url) => URL.revokeObjectURL(url));

  // Update blob URLs list
  blobUrlsRef.current = blobUrlsRef.current.filter((url) =>
    editorImages.includes(url)
  );

  console.log("blobUrlsRef removed", blobUrlsRef.current);
};
