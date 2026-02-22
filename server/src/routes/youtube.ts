import { Router, Request, Response } from 'express';

const router = Router();

router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, sessionLength } = req.query;
    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'YOUTUBE_API_KEY is not configured on the server.' });
      return;
    }

    // Step 1: Search for the video to get the videoId
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.append('part', 'snippet');
    searchUrl.searchParams.append('q', q);
    searchUrl.searchParams.append('type', 'video');
    searchUrl.searchParams.append('key', apiKey);
    
    // Prioritize recent content since tech changes fast.
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    searchUrl.searchParams.append('publishedAfter', threeYearsAgo.toISOString());
    searchUrl.searchParams.append('order', 'relevance');
    
    // Maps "Short Sessions" to YouTube's "short" videoDuration filter (< 4 mins)
    // We could map other parameters if needed, but this prevents 15hr videos for short sessions.
    if (sessionLength && typeof sessionLength === 'string' && sessionLength.toLowerCase().includes('short')) {
       searchUrl.searchParams.append('videoDuration', 'short');
    } else if (sessionLength && typeof sessionLength === 'string' && sessionLength.toLowerCase().includes('dedicated')) {
       searchUrl.searchParams.append('videoDuration', 'long');
    }

    const searchRes = await fetch(searchUrl.toString());
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) {
      res.status(404).json({ error: 'No video found for the given query.' });
      return;
    }

    const videoId = searchData.items[0].id.videoId;

    // Step 2: Get the full video details for the full description
    const videoUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videoUrl.searchParams.append('part', 'snippet');
    videoUrl.searchParams.append('id', videoId);
    videoUrl.searchParams.append('key', apiKey);

    const videoRes = await fetch(videoUrl.toString());
    const videoData = await videoRes.json();

    if (!videoData.items || videoData.items.length === 0) {
       res.status(404).json({ error: 'Video details not found.' });
       return;
    }

    const snippet = videoData.items[0].snippet;

    res.status(200).json({
      success: true,
      data: {
        videoId,
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url
      }
    });

  } catch (error: any) {
    console.error('Error fetching YouTube API:', error);
    res.status(500).json({ error: 'Failed to fetch YouTube resource', details: error.message });
  }
});

export default router;
