import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Notice we changed params to be a Promise type
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // We must AWAIT the params before extracting the ID in Next.js 15
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const act = await prisma.acts.findUnique({
      where: { id: id },
      include: {
        clauses: true, 
        rules: true,   
      },
    });

    if (!act) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(act);
  } catch (error) {
    console.error("Single document query error:", error);
    return NextResponse.json({ error: "Failed to pull document details" }, { status: 500 });
  }
}