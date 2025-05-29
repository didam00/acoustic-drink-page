import { NextResponse } from 'next/server';
// import { runRecipeSync } from '@/lib/recipes/sync';

export async function GET() {
  // await runRecipeSync();
  return NextResponse.json({ ok: true });
}
