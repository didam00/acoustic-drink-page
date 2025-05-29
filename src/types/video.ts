export interface VideoData {
  id: string;
  title: string;
  name: string;
  recipeText: string;
  matchedFrom: "description" | "comment";
  publishedAt: Date;
  thumbnail: string;
  like: number;
  view: number;
  ingredients?: string[];
}