import { db } from './firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export async function updateRecipeText(videoId: string, recipeText: string, name: string) {
  const videoRef = doc(db, 'videos', videoId);
  await setDoc(videoRef, { recipeText, name }, { merge: true });
}