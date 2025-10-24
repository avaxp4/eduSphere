# Uploads Directory

This directory contains all local media files for the educational platform.

## How to Add Files

1. Place your files in this directory
2. Reference them in the subjects data using just the filename (e.g., "my-file.pdf")
3. The system will automatically serve them from `/uploads/filename.ext`

## Supported File Types

- Images: .jpg, .jpeg, .png, .gif
- Videos: .mp4, .webm, .ogg
- Documents: .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx

## Example

In your subject media data:
```json
{
  "title": "My Document",
  "type": "file",
  "category": "ملخصات",
  "src": "my-document.pdf"
}
```

The file will be accessible at: `/uploads/my-document.pdf`