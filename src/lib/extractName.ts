import vision from "@google-cloud/vision";
import path from "path";
import axios from "axios";
import sharp from "sharp";

const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(process.cwd(), "vision-service-account.json"),
});

export async function extractName(imageUrl: string): Promise<string> {
  // 썸네일 이미지를 480x360으로 리사이즈
  let resizedBuffer: Buffer;
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const inputBuffer = Buffer.from(response.data);
    resizedBuffer = await sharp(inputBuffer)
      .resize(480, 360, { fit: "fill" })
      .toBuffer();
  } catch (e) {
    console.error("[extractName] 썸네일 리사이즈 실패:", e);
    return "";
  }

  const [result] = await client.textDetection({ image: { content: resizedBuffer } });
  const full = result.fullTextAnnotation;

  if (!full || !full.pages || full.pages.length === 0) return "";

  type BlockInfo = {
    text: string;
    minY: number;
    minX: number;
    height: number;
    score?: number;
  };

  const blocks: BlockInfo[] = [];

  for (const page of full.pages) {
    if (!page.blocks) continue;
    for (const block of page.blocks) {
      const box = block.boundingBox;
      const vertices = box?.vertices;
      if (!vertices || vertices.length < 3) continue;

      const minY = Math.min(...vertices.map(v => v.y ?? 0));
      const minX = Math.min(...vertices.map(v => v.x ?? 0));
      const height = Math.abs((vertices[2]?.y || 0) - (vertices[1]?.y || 0));

      if (minY < 60) continue; // 너무 위에 있는 건 무시

      if (!block.paragraphs) continue;
      const blockText = block.paragraphs
        .map(p => (p.words ? p.words.map(w => (w.symbols ? w.symbols.map(s => s.text).join("") : "")).join(" ") : ""))
        .join("");
      if (blockText.length > 0) {
        console.log("추출 텍스트:", blockText);
        console.log("└ 추출 텍스트 정보:", height + "px (" + minX + ", " + minY + ")");
        blocks.push({ text: blockText.trim(), minY, minX, height });
      }
    }
  }

  if (blocks.length === 0) return "";

  const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

  // 1. 포함관계로 더 긴 텍스트만 남긴 filteredBlocks
  const filteredBlocks = blocks.filter(
    b => !blocks.some(
      other => other !== b && normalize(other.text).includes(normalize(b.text))
    )
  );

  if (filteredBlocks.length === 0) return "";

  // 한글이 포함된 텍스트가 하나라도 있으면, 한글만 남기기
  const hasHangul = filteredBlocks.some(bk => /[가-힣]/.test(bk.text));

  let finalBlocks = filteredBlocks;
  if (hasHangul) {
    finalBlocks = filteredBlocks
      .map(bk => {
        // 한글+공백만 남기기
        const hangulOnly = bk.text.replace(/[^가-힣\s]/g, "").replace(/\s+/g, " ").trim();
        return { ...bk, text: hangulOnly };
      })
      .filter(bk => bk.text.length > 0);
  }

  if (finalBlocks.length === 0) return "";

  // 2. 점수 계산 (가중치는 필요에 따라 조정)
  const a = 2;    // 높이 가중치
  const b = 1;    // 글자수 가중치
  const c = 0.5;  // y좌표 가중치

  finalBlocks.forEach(bk => {
    bk.score = (bk.height * a) + (bk.text.length * b) - (bk.minY * c);
    console.log(`[score] "${bk.text}" = ${bk.score} (height:${bk.height}, len:${bk.text.length}, y:${bk.minY})`);
  });

  // 3. 가장 점수 높은 블록 선정
  let candidate = finalBlocks.reduce((a, b) => (a.score! > b.score! ? a : b));

  console.log("최종 추출 텍스트:", candidate.text);
  return candidate.text;
}
