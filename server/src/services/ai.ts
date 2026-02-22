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
You are an expert technical curriculum designer creating a personalized learning path roadmap.
The user wants to learn exactly this main skill: "${mainSkill}".
Their assessment score in this skill is: ${overallScore}/10. 
(A score of 1-4 means they are a Beginner. 5-7 means Intermediate. 8-10 means Advanced.)

Their learning pace is: ${learningPace}.
Their preferred session length is: ${sessionLength}.
Their preferred resource types are: ${resourceTypes.join(', ')}.

CRITICAL INSTRUCTIONS:
1. You must act as a precise roadmap generator. Do not generate random disconnected topics.
2. The curriculum MUST be in strictly sequential order from start to finish, building upon the previous topic.
3. If they are a Beginner (Score < 5), start from absolute zero basics of the main skill. Do not skip to advanced features.
4. If they are Intermediate/Advanced, start from their current level.
5. Generate exactly 5 bite-sized modules.

For the "searchQuery" field, provide a highly specific string that will yield the exact right tutorial on YouTube or Google.
To ensure the content is modern and up-to-date, implicitly include terms like "${new Date().getFullYear()}" or "modern" in the search query where it makes sense.
For example, if the topic is "React Functional Components", the searchQuery should be "Modern React JS functional components tutorial ${new Date().getFullYear()} for beginners ${sessionLength.includes('Short') ? 'under 10 minutes' : ''}".

You MUST respond in strictly valid JSON format matching the following structure:
{
  "curriculum": [
    {
      "topic": "The exact title of the learning topic or module",
      "description": "A precise description of what will be learned and why it is next in the sequence",
      "searchQuery": "A highly targeted YouTube/Google search query optimized for their difficulty and session length",
      "type": "video" | "interactive" | "doc" | "text",
      "difficultyLevel": "Beginner | Intermediate | Advanced"
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

