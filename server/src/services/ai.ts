import { Groq } from 'groq-sdk';
import { z } from 'zod';

export interface CurriculumParams {
  mainSkill: string;
  overallScore: number;
  difficultyLevel: string;
  learningPace: string;
  sessionLength: string;
  resourceTypes: string[];
}

export async function generateCurriculum(params: CurriculumParams) {
  const { mainSkill, overallScore, difficultyLevel, learningPace, sessionLength, resourceTypes } = params;

  const prompt = `
You are an expert technical curriculum designer creating a personalized learning path.
The user wants to learn: ${mainSkill}.
Their assessment score is: ${overallScore}/10. (A score of 1-4 means beginner, 5-7 means intermediate, 8-10 means advanced).
Their preferred difficulty level: ${difficultyLevel}.
Their learning pace: ${learningPace}.
Their preferred session length: ${sessionLength}.
Their preferred resource types: ${resourceTypes.join(', ')}.

Based on their score, focus on fundamentals if low, or advanced edge cases if high.
Generate a cohesive curriculum consisting of 5 specific, bite-sized modules/topics.
For each topic, provide a highly specific search query to find the best free resources online. Ensure the resource type matches their preferences.

You MUST respond in strictly valid JSON format matching the following structure:
{
  "curriculum": [
    {
      "topic": "The title of the learning topic or module",
      "description": "A short description of what will be learned",
      "searchQuery": "A YouTube or Google search query optimized to find a resource for this module",
      "type": "video" | "interactive" | "doc" | "text",
      "difficultyLevel": "The calculated difficulty level of this specific module"
    }
  ]
}
`;

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
      reasoning_effort: "medium",
      response_format: {
        type: "json_object"
      },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
       throw new Error("No content generated from AI.");
    }

    const parsed = JSON.parse(content);
    return parsed.curriculum || [];
  } catch (error) {
    console.error("Error with Groq completion:", error);
    throw error;
  }
}

