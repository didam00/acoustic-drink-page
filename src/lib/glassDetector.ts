export type GlassType = "on_the_rock" | "cocktail" | "shot" | "long_drink" | "highball" | "beer" | "hurricane" | "margarita" | "coupe" | "flute" | "wine" | "mule" | "martini" | "any";

const GLASS_MAPPINGS: { [key: string]: GlassType } = {
  "온더락잔, 온더락 잔, 얼음잔, 얼음 컵, 얼음 컵의 얼음": "on_the_rock",
  "칵테일잔, 칵테일 잔, 차가운 칵테일 잔, 설탕 리밍된 칵테일 잔, 칵테일글라스": "cocktail",
  "샷잔, 소주잔, 소주 잔, 슈터글라스, 슈터 글라스": "shot",
  "롱드링크잔, 롱드링크 잔, 긴 잔": "long_drink",
  "하이볼잔, 하이볼 잔": "highball",
  "맥주잔, 맥주 잔, 차가운 맥주잔, 작은 맥주잔": "beer",
  "허리케인 글라스": "hurricane",
  "마가리타 글라스": "margarita",
  "쿠페 잔": "coupe",
  "플루트 잔, 플루트 글라스": "flute",
  "와인 잔, 와인잔": "wine",
  "구리잔, 뮬잔": "mule",
  "마티니잔, 마티니글라스": "martini",
  "마가리타글라스, 마가리타잔": "margarita",
};

export function detectGlassType(text: string): GlassType {
  const normalizedText = text.toLowerCase().replace(/\s+/g, "");
  
  for (const [keywords, glassType] of Object.entries(GLASS_MAPPINGS)) {
    for (const keyword of keywords.split(", ")) {
      const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, "");
      if (normalizedText.includes(normalizedKeyword)) {
        return glassType;
      }
    }
  }
  
  return "any";
} 