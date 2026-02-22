import { Router, Request, Response } from 'express';
import { generateCurriculum } from '../services/ai';

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { mainSkill, overallScore, difficultyLevel, learningPace, sessionLength, resourceTypes } = req.body;

    if (!mainSkill) {
      res.status(400).json({ error: 'mainSkill is required' });
      return;
    }

    const curriculum = await generateCurriculum({
      mainSkill,
      overallScore,
      difficultyLevel,
      learningPace,
      sessionLength,
      resourceTypes,
    });

    res.status(200).json({ success: true, curriculum });
  } catch (error: any) {
    console.error('Error generating recommendation:', error);
    res.status(500).json({ error: 'Failed to generate recommendation engine output', details: error.message });
  }
});

export default router;
