import { forwardRef, RefObject, useEffect, useRef } from "react";
import Quill, {
  Delta,
  // Range
} from "quill";
import "quill/dist/quill.snow.css";

// Import & Modify Quill Image Format to Allow Blob URLs
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
    const editorRef = useRef<Quill | null>(null);
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

      if (defaultValue && quill.getText().trim().length === 0) {
        quill.setContents(defaultValue);
      }

      quill.on("text-change", (delta, oldDelta, source) => {
        onTextChange?.(delta, oldDelta, source);
        removeUnusedBlobUrls(quill, blobUrlsRef);
      });

      // quill.on("selection-change", (range, oldRange, source) => {
      //   onSelectionChange?.(range, oldRange, source);
      // });

      editorRef.current = quill;

      if (typeof ref === "function") {
        ref(quill);
      } else if (ref && "current" in ref) {
        ref.current = quill;
      }

      return () => {
        if (ref && "current" in ref) {
          ref.current = null;
        }

        container.innerHTML = ""; // ✅ Always use the stored container reference

        // Revoke all blob URLs
        blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        blobUrlsRef.current = [];
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (editorRef.current) {
        editorRef.current.enable(!readOnly);
      }
    }, [readOnly]);

    return <div ref={containerRef} />;
  }
);

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

    const blobUrl = URL.createObjectURL(file);

    const range = quill.getSelection();
    if (!range) return;

    blobUrlsRef.current.push(blobUrl);
    console.log("blobUrlsRef", blobUrlsRef.current);

    quill.insertEmbed(range.index, "image", blobUrl, "user");

    quill.setSelection(range.index + 1);
  };
};

const removeUnusedBlobUrls = (
  quill: Quill,
  blobUrlsRef: RefObject<string[]>
) => {
  const editorImages = Array.from(quill.root.querySelectorAll("img")).map(
    (img) => img.getAttribute("src")
  );

  const removedBlobUrls = blobUrlsRef.current.filter(
    (url) => !editorImages.includes(url)
  );

  removedBlobUrls.forEach((url) => URL.revokeObjectURL(url));

  blobUrlsRef.current = blobUrlsRef.current.filter((url) =>
    editorImages.includes(url)
  );
};
