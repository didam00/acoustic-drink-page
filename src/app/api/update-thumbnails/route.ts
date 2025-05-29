// import { getFirestore } from 'firebase-admin/firestore';
// import { initializeApp, cert, getApps } from 'firebase-admin/app';
// import { join } from 'path';
// import { readFileSync } from 'fs';

// // Firebase Admin SDK 초기화
// try {
//   if (getApps().length === 0) {
//     const serviceAccountPath = join(process.cwd(), 'firebase-admin-key.json');
//     const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    
//     initializeApp({
//       credential: cert(serviceAccount),
//       projectId: serviceAccount.project_id
//     });
//   }
// } catch (error) {
//   console.error('Firebase Admin SDK 초기화 실패:', error);
//   // 초기화 실패 시 앱이 시작되지 않도록 함
//   process.exit(1);
// }

// const db = getFirestore();

// export async function POST() {
//   try {
//     const snapshot = await db.collection('recipes').get();
//     let updated = 0;

//     const batch = db.batch();

//     snapshot.forEach(doc => {
//       const data = doc.data();
//       if (data.thumbnail) {
//         const newUrl = data.thumbnail.replace(
//           /(hqdefault|sddefault|mqdefault|default)\.jpg$/,
//           'maxresdefault.jpg'
//         );
//         if (newUrl !== data.thumbnail) {
//           batch.update(doc.ref, { thumbnail: newUrl });
//           updated++;
//         }
//       }
//     });

//     if (updated > 0) {
//       await batch.commit();
//     }

//     return new Response(JSON.stringify({ 
//       success: true,
//       updated 
//     }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' }
//     });
//   } catch (error: any) {
//     console.error('썸네일 업데이트 에러:', error);
    
//     // 에러 객체의 상세 정보 로깅
//     if (error.code) {
//       console.error('Firebase 에러 코드:', error.code);
//     }
//     if (error.details) {
//       console.error('Firebase 에러 상세:', error.details);
//     }

//     return new Response(JSON.stringify({ 
//       success: false,
//       error: error?.message || '알 수 없는 오류가 발생했습니다',
//       code: error?.code || 'UNKNOWN_ERROR'
//     }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' }
//     });
//   }
// } 