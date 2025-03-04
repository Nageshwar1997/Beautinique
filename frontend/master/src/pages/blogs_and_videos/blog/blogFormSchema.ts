import * as yup from "yup";

export const blogFormSchema = yup.object().shape({
  largeThumbnail: yup.mixed<File | string>().nullable().defined(),
  smallThumbnail: yup.mixed<File | string>().nullable().defined(),

  seo: yup
    .object()
    .shape({
      title: yup.string().trim().required("SEO Title is required"),
      author: yup.string().trim().required("SEO Author is required"),
      description: yup.string().trim().required("SEO Description is required"),
      keywords: yup
        .array()
        .of(yup.string().trim().required())
        .min(1, "At least one keyword is required") // ✅ Now always an array
        .default([]), // ✅ Ensures it's always an array even if empty
    })
    .optional(),

  title: yup.string().trim().required("Title is required"),

  url: yup
    .string()
    .trim()
    .matches(/^[a-z0-9-]+$/, {
      message:
        "Slug / URL must only contain lowercase letters, numbers, and hyphens",
    })
    .required("Slug / URL is required"),

  publishedDate: yup.date().nullable().defined(),

  content: yup.string().trim().required("Content is required"),
});
