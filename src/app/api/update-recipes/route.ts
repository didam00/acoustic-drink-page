// import { NextRequest } from 'next/server';
// import { updateRecipes } from '@/lib/updateRecipes';

// export async function GET(req: NextRequest) {
//   try {
//     const result = await updateRecipes();
//     return new Response(JSON.stringify({ 
//       message: '레시피 업데이트 완료!',
//       result 
//     }), {
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