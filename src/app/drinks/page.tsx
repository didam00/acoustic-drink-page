import { Suspense } from 'react';
import DrinksClient from './DrinksClient';

export default function DrinksPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <DrinksClient />
    </Suspense>
  );
}