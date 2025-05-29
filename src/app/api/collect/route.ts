// import { NextRequest } from 'next/server';
// import { collectInitialRecipes } from '@/lib/collectInitialRecipes';

// export async function GET(req: NextRequest) {
//   try {
//     await collectInitialRecipes();
//     return new Response(JSON.stringify({ message: '수집 완료!' }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (e: any) {
//     return new Response(JSON.stringify({ error: e.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }