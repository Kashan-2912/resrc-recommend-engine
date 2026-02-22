import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import recommendRouter from './routes/recommend';
import youtubeRouter from './routes/youtube';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/recommend', recommendRouter);
app.use('/api/youtube', youtubeRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
