import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { sectionNumber, title, contentText, mode } = await request.json();

    if (!contentText) {
      return NextResponse.json({ error: "Missing text to simplify" }, { status: 400 });
    }

    // Explicitly grab the key right during the execution context
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("❌ Environment Error: GEMINI_API_KEY is missing from your .env file!");
      return NextResponse.json({ error: "Server misconfiguration: API identity missing." }, { status: 500 });
    }

    // Re-initialize with guaranteed key scoping
    const genAI = new GoogleGenerativeAI(apiKey);

    const systemInstruction = `
      You are an expert legal scholar translating complex Indian legislation for everyday citizens.
      Analyze Section ${sectionNumber}: "${title || 'Untitled'}".
      
      Provide your analysis strictly in the following format:
      1. THE CORE RULE: One simple sentence summarizing what is forbidden or allowed.
      2. IN PLAIN ENGLISH: A 2-3 sentence breakdown explaining the mechanics without legal jargon.
      3. THE PENALTY/IMPACT: Explicitly list fines, imprisonment, or liabilities mentioned.
      4. REAL-WORLD EXAMPLE: A concrete, modern scenario illustrating this rule in action.
    `;

    const userPrompt = mode === 'layman' 
      ? `Simplify this legal text for a complete beginner: ${contentText}`
      : `Provide a highly concise Executive Summary of this legal text: ${contentText}`;

    // Using the blazing fast, free-tier stable flash model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ summary: responseText });
  } catch (error) {
    console.error("AI Generation Failure:", error);
    return NextResponse.json({ error: "AI failed to process the clause" }, { status: 500 });
  }
}