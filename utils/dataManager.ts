/**
 * Utility functions for managing educational platform data
 */

// Function to add a new subject
export async function addSubject(newSubject: any): Promise<boolean> {
  try {
    const response = await fetch('/data/subjects.json');
    if (!response.ok) {
      throw new Error(`Failed to load subjects: ${response.statusText}`);
    }
    
    const subjects = await response.json();
    subjects.push(newSubject);
    
    // In a real application, you would save this to the server
    // For now, we're just demonstrating the structure
    console.log('New subject would be added:', newSubject);
    return true;
  } catch (error) {
    console.error('Error adding subject:', error);
    return false;
  }
}

// Function to update an existing subject
export async function updateSubject(subjectId: string, updatedData: any): Promise<boolean> {
  try {
    const response = await fetch('/data/subjects.json');
    if (!response.ok) {
      throw new Error(`Failed to load subjects: ${response.statusText}`);
    }
    
    const subjects = await response.json();
    const subjectIndex = subjects.findIndex((s: any) => s.id === subjectId);
    
    if (subjectIndex === -1) {
      console.error('Subject not found:', subjectId);
      return false;
    }
    
    subjects[subjectIndex] = { ...subjects[subjectIndex], ...updatedData };
    
    // In a real application, you would save this to the server
    // For now, we're just demonstrating the structure
    console.log(`Subject ${subjectId} would be updated with:`, updatedData);
    return true;
  } catch (error) {
    console.error('Error updating subject:', error);
    return false;
  }
}

// Function to delete a subject
export async function deleteSubject(subjectId: string): Promise<boolean> {
  try {
    const response = await fetch('/data/subjects.json');
    if (!response.ok) {
      throw new Error(`Failed to load subjects: ${response.statusText}`);
    }
    
    let subjects = await response.json();
    subjects = subjects.filter((s: any) => s.id !== subjectId);
    
    // In a real application, you would save this to the server
    // For now, we're just demonstrating the structure
    console.log('Subject would be deleted:', subjectId);
    return true;
  } catch (error) {
    console.error('Error deleting subject:', error);
    return false;
  }
}

// Function to add media to a subject
export async function addMediaToSubject(subjectId: string, newMedia: any): Promise<boolean> {
  try {
    const response = await fetch('/data/subjects.json');
    if (!response.ok) {
      throw new Error(`Failed to load subjects: ${response.statusText}`);
    }
    
    const subjects = await response.json();
    const subjectIndex = subjects.findIndex((s: any) => s.id === subjectId);
    
    if (subjectIndex === -1) {
      console.error('Subject not found:', subjectId);
      return false;
    }
    
    subjects[subjectIndex].media.push(newMedia);
    
    // In a real application, you would save this to the server
    // For now, we're just demonstrating the structure
    console.log(`Media would be added to subject ${subjectId}:`, newMedia);
    return true;
  } catch (error) {
    console.error('Error adding media to subject:', error);
    return false;
  }
}