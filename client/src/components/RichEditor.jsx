import { Editor } from "@tinymce/tinymce-react";

export default function RichEditor({ value, onChange }) {
  return (
    <Editor
      apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
      value={value || ""}
      onEditorChange={(content) => onChange(content)}
      init={{
        height: 400,
        menubar: true,
        elementpath: false,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic underline | alignleft aligncenter alignright | " +
          "bullist numlist | link image media | " +
          "removeformat | code",
        content_style:
          "body { font-family:Arial,sans-serif; font-size:14px; }",
      }}
    />
  );
}