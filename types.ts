
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  FILE = 'file',
  YOUTUBE = 'youtube',
}

export enum MediaCategory {
  EXPLANATION = 'شرح',
  SOLUTION = 'حل',
  EXAMS = 'امتحانات',
  SUMMARIES = 'ملخصات',
  REVIEW = 'مراجعة',
}

export interface MediaItem {
  id: number;
  title: string;
  type: MediaType;
  category: MediaCategory;
  src: string;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  teacher: string;
  image: string;
  media: MediaItem[];
}
