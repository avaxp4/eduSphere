import { Subject, MediaType, MediaCategory } from './types';

// Load subjects data from JSON file
export async function loadSubjects(): Promise<Subject[]> {
  try {
    const response = await fetch('/data/subjects.json');
    if (!response.ok) {
      throw new Error(`Failed to load subjects: ${response.statusText}`);
    }
    const subjectsData = await response.json();
    
    // Convert string enums to actual enum values
    return subjectsData.map((subject: any) => ({
      ...subject,
      media: subject.media.map((mediaItem: any) => ({
        ...mediaItem,
        type: mediaItem.type as MediaType,
        category: mediaItem.category as MediaCategory
      }))
    }));
  } catch (error) {
    console.error('Error loading subjects:', error);
    return [];
  }
}

// Load developers data from JSON file
export async function loadDevelopers(): Promise<any[]> {
  try {
    const response = await fetch('/data/developers.json');
    if (!response.ok) {
      throw new Error(`Failed to load developers: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading developers:', error);
    return [];
  }
}

// Load footer data from JSON file
export async function loadFooterData(): Promise<any> {
  try {
    const response = await fetch('/data/footer.json');
    if (!response.ok) {
      throw new Error(`Failed to load footer data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading footer data:', error);
    return {
      description: "هذه المنصة هي مشروع مدرسي متميز يهدف إلى توفير بيئة تعليمية تفاعلية وحديثة للطلاب.",
      schoolSocialLinks: {},
      contact: {},
      copyright: "جميع الحقوق محفوظة"
    };
  }
}

// Load media assets data from JSON file
export async function loadMediaAssets(): Promise<any> {
  try {
    const response = await fetch('/data/mediaAssets.json');
    if (!response.ok) {
      throw new Error(`Failed to load media assets: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading media assets:', error);
    return { mediaTypes: [], mediaCategories: [] };
  }
}

// For backward compatibility, we'll still export SUBJECTS but load it asynchronously
let cachedSubjects: Subject[] | null = null;

export const SUBJECTS: Subject[] = [] as Subject[];

// Initialize SUBJECTS with loaded data
loadSubjects().then(subjects => {
  cachedSubjects = subjects;
  // Clear the array and push new data
  SUBJECTS.length = 0;
  SUBJECTS.push(...subjects);
});