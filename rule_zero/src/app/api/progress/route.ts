import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch a user's saved progress when they log in
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const actions = await prisma.user_actions.findMany({
      where: { user_id: userId }
    });
    return NextResponse.json(actions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

// POST: Save or remove a checked item / decoded rule
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, clauseId, actionType, isAdding } = body;

    if (isAdding) {
      // Add the record if it doesn't exist
      await prisma.user_actions.upsert({
        where: {
          user_id_clause_id_action_type: {
            user_id: userId,
            clause_id: clauseId,
            action_type: actionType
          }
        },
        update: {},
        create: {
          user_id: userId,
          clause_id: clauseId,
          action_type: actionType
        }
      });
    } else {
      // Remove the record if they unchecked the box
      await prisma.user_actions.deleteMany({
        where: {
          user_id: userId,
          clause_id: clauseId,
          action_type: actionType
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database Save Error:", error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}