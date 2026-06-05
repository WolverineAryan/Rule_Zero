import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const acts = await prisma.acts.findMany({
      include: {
        // This tells Prisma to follow the relation and get the linked categories
        act_categories: {
          include: {
            categories: true
          }
        }
      },
      orderBy: {
        title: 'asc',
      }
    });
    return NextResponse.json(acts);
  } catch (error) {
    console.error("Database fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch acts" }, { status: 500 });
  }
}