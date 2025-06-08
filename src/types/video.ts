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
  ingredients: string[];
  glass: "on_the_rock" | "cocktail" | "shot" | "long_drink" | "highball" | "beer" | "hurricane" | "margarita" | "coupe" | "flute" | "wine" | "mule" | "martini" | "any";
}