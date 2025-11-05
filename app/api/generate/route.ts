import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { appName, description } = body;

    if (!appName?.trim() || !description?.trim()) {
      return new Response(
        JSON.stringify({ error: 'App name and description are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 65536,
      },
    });

    const prompt = `Generate a complete, production-ready full-stack application for: ${appName.trim()}

Requirements: ${description.trim()}

Create these files with COMPLETE working code:
1. frontend/src/App.jsx - Full React component with Tailwind CSS, all features implemented
2. backend/server.js - Complete Express.js server with all API routes, error handling, CORS, database connection
3. database/schema.sql - Complete MySQL schema with all tables, indexes, relationships
4. package.json - All required dependencies with correct versions
5. .env.example - All environment variables needed
6. README.md - Complete setup and deployment instructions

IMPORTANT:
- Frontend must have complete UI with all features working
- Backend must have all API endpoints fully implemented
- Database schema must be complete with proper constraints
- All code must be production-ready, no placeholders or TODOs
- Include proper error handling and validation
- Frontend must connect to backend API endpoints
- Backend must connect to MySQL database

Return ONLY a valid JSON array with no markdown formatting, no code blocks, no explanations:
[{"filePath": "...", "content": "..."}]`;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await model.generateContentStream(prompt);
          
          if (!result || !result.stream) {
            throw new Error('Failed to get response from Gemini API');
          }
          
          let fullResponse = '';
          let lastParsedFiles: any[] = [];

          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (!chunkText) continue;
            
            fullResponse += chunkText;
            
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`)
            );

            // Try to parse partial files
            try {
              const cleanResponse = fullResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
              const partialFiles = JSON.parse(cleanResponse);
              if (Array.isArray(partialFiles) && partialFiles.length > lastParsedFiles.length) {
                lastParsedFiles = partialFiles;
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({ type: 'partial', files: partialFiles })}\n\n`)
                );
              }
            } catch {
              // Not yet valid JSON, continue
            }
          }

          try {
            const cleanResponse = fullResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            const files = JSON.parse(cleanResponse);
            if (Array.isArray(files) && files.length > 0) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ type: 'complete', files })}\n\n`)
              );
            } else {
              throw new Error('Invalid response format');
            }
          } catch (parseError: any) {
            console.error('Parse error details:', fullResponse.substring(0, 500));
            throw new Error(`Parse error: ${parseError.message}`);
          }

          controller.close();
        } catch (error: any) {
          console.error('Generation error:', error);
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                error: error.message || 'Generation failed',
                type: 'error'
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Overall server error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error', type: 'error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
