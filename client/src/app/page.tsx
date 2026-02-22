'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, ArrowRight, Trophy, BookOpen, Video, FileText, Code, X } from 'lucide-react';

const PACES = [
  { id: 'Slow', title: 'Slow', description: 'Take your time, no pressure' },
  { id: 'Medium', title: 'Medium', description: 'Steady and comfortable' },
  { id: 'Fast', title: 'Fast', description: 'Fast-paced learning' },
];

const SESSIONS = [
  { id: 'Short Sessions', title: 'Short Sessions', description: 'Quick bursts when available' },
  { id: 'Regular', title: 'Regular', description: 'Consistent daily sessions' },
  { id: 'Dedicated', title: 'Dedicated', description: 'Extended study blocks' },
];

const DIFFICULTIES = [
  { id: 'Beginner', title: 'Beginner', description: 'Start from basics' },
  { id: 'Moderate', title: 'Moderate', description: 'Some experience' },
  { id: 'Advanced', title: 'Advanced', description: 'Deep dive topics' },
];

const RESOURCE_TYPES = [
  { id: 'video', title: 'Video', icon: Video },
  { id: 'text', title: 'Articles', icon: FileText },
  { id: 'interactive', title: 'Interactive', icon: Code },
  { id: 'doc', title: 'Documentation', icon: BookOpen },
];

export default function Home() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Assessment Mocks (These would come from real quiz in production)
  const [mainSkill, setMainSkill] = useState('React.js Development');
  const [score, setScore] = useState(3);
  
  // User Preferences
  const [learningPace, setLearningPace] = useState(PACES[1].id);
  const [sessionLength, setSessionLength] = useState(SESSIONS[0].id);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0].id);
  const [selectedResources, setSelectedResources] = useState<string[]>(['video', 'interactive']);
  
  // Results
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [searchingQuery, setSearchingQuery] = useState<string | null>(null);

  const handleSearchVideo = async (query: string) => {
    setSearchingQuery(query);
    try {
      const res = await fetch(`http://localhost:4000/api/youtube/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setSelectedVideo(data.data);
      } else {
        alert(data.error || "Failed to search video");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting YouTube API");
    } finally {
      setSearchingQuery(null);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainSkill,
          overallScore: score,
          learningPace,
          sessionLength,
          difficultyLevel: difficulty,
          resourceTypes: selectedResources
        })
      });
      const data = await res.json();
      if (data.curriculum) {
        setCurriculum(data.curriculum);
        setStep(4);
      } else {
        alert("Failed to generate curriculum");
      }
    } catch(err) {
      console.error(err);
      alert("Error contacting recommendation server");
    } finally {
      setLoading(false);
    }
  };

  const SelectionCard = ({ item, selected, onClick, Icon }: any) => (
    <div 
      onClick={onClick}
      className={`border p-5 rounded-xl cursor-pointer transition-all duration-200
        ${selected ? 'border-red-600 bg-red-950/20' : 'border-zinc-800 bg-[#151515] hover:border-zinc-600'}
      `}
    >
      <div className="flex items-center gap-3 mb-1">
        {Icon && <Icon className="w-5 h-5 text-zinc-400" />}
        <h3 className="text-lg font-medium text-zinc-100">{item.title}</h3>
      </div>
      {item.description && <p className="text-zinc-500 text-sm">{item.description}</p>}
    </div>
  );

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto flex flex-col pt-12">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: Main Skill & Score Mock Setup */}
        {step === 1 && (
          <motion.div key="step1" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
            <h1 className="text-3xl font-bold mb-2">Configure Learner Profile</h1>
            <p className="text-zinc-400 mb-8">Set the assessment results to feed into the recommendation engine.</p>
            
            <div className="space-y-6 bg-[#151515] border border-zinc-800 p-6 rounded-2xl">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Main Skill to Learn</label>
                <input 
                  type="text" 
                  value={mainSkill}
                  onChange={e => setMainSkill(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Assessment Score (out of 10)</label>
                <input 
                  type="number" 
                  min="1" max="10"
                  value={score}
                  onChange={e => setScore(Number(e.target.value))}
                  className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-full flex items-center gap-2 transition"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: The Preferences UI (Matches Screenshot 1) */}
        {step === 2 && (
          <motion.div key="step2" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-6 h-6 text-red-500" />
              <h1 className="text-3xl font-bold">What is your learning style?</h1>
            </div>
            <p className="text-zinc-400 mb-10">Help us match content to your preferred approach.</p>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-sm font-semibold text-zinc-300 mb-4 px-1">Learning Pace</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PACES.map(p => (
                    <SelectionCard key={p.id} item={p} selected={learningPace === p.id} onClick={() => setLearningPace(p.id)} />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-zinc-300 mb-4 px-1">Session Length</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SESSIONS.map(s => (
                    <SelectionCard key={s.id} item={s} selected={sessionLength === s.id} onClick={() => setSessionLength(s.id)} />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-zinc-300 mb-4 px-1">Difficulty Level</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DIFFICULTIES.map(d => (
                    <SelectionCard key={d.id} item={d} selected={difficulty === d.id} onClick={() => setDifficulty(d.id)} />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-zinc-800 flex justify-between items-center">
              <button onClick={() => setStep(1)} className="text-zinc-400 hover:text-white flex items-center gap-2 font-medium">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="bg-[#991b1b] hover:bg-[#b91c1c] text-white font-medium py-3 px-8 rounded-lg flex items-center gap-2 transition"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: The Intermediate Assessment Result (Matches Screenshot 2) */}
        {step === 3 && (
          <motion.div key="step3" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, y:-10}} className="max-w-2xl mx-auto w-full">
            <div className="bg-[#0e100f] border border-zinc-800 rounded-3xl p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-950/30 flex items-center justify-center mb-6">
                <Trophy className="w-8 h-8 text-green-500" />
              </div>
              
              <h1 className="text-3xl font-bold mb-3 flex items-center gap-2">
                Great Job! 🎉
              </h1>
              <p className="text-zinc-400 mb-10 text-lg">
                You've demonstrated {score > 6 ? "excellent" : score > 3 ? "good" : "basic"} understanding of the fundamentals!
              </p>

              <div className="flex justify-center gap-4 mb-12 w-full max-w-lg">
                <div className="flex-1 bg-black/40 border border-zinc-800/80 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-red-500 mb-2">{score}/10</div>
                  <div className="text-sm text-zinc-500">Overall Score</div>
                </div>
                <div className="flex-1 bg-black/40 border border-zinc-800/80 rounded-2xl p-6">
                  <div className="text-3xl font-bold text-purple-500 mb-2">{mainSkill}</div>
                  <div className="text-sm text-zinc-500">Target Skill</div>
                </div>
              </div>

              <div className="bg-[#151515] border border-zinc-800/80 rounded-xl p-4 w-full flex items-start gap-3 text-left mb-8">
                <span className="text-xl pt-1">💡</span>
                <p className="text-sm text-zinc-400">
                  Your responses have been recorded. Our AI will analyze your performance and generate a personalized skill score to recommend the best learning resources for you!
                </p>
              </div>

              <div className="w-full flex justify-between items-center gap-4 border-t border-zinc-800 pt-8 mt-4">
                 <button onClick={() => setStep(2)} className="text-zinc-400 hover:text-white px-4">
                  Back
                </button>
                <button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition text-lg"
                >
                  {loading ? (
                     <><Loader2 className="w-5 h-5 animate-spin"/> Generating Path...</>
                  ) : "Generate AI Learning Path"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Results AI Curriculum */}
        {step === 4 && (
          <motion.div key="step4" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  Your Personalized Blueprint
                </h1>
                <p className="text-zinc-400">Generated for a {score}/10 score user aiming at {mainSkill}.</p>
              </div>
              <button onClick={() => setStep(1)} className="px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm">
                Start Over
              </button>
            </div>

            <div className="grid gap-6">
              {curriculum.map((item, idx) => (
                <div key={idx} className="bg-[#111] border border-zinc-800 p-6 rounded-2xl flex gap-6 hover:border-zinc-700 transition">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-red-950/40 text-red-500 border border-red-900/50 flex items-center justify-center font-bold text-lg">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                       <h3 className="text-xl font-bold text-zinc-100">{item.topic}</h3>
                       <span className="px-3 py-1 bg-zinc-800 text-xs rounded-full border border-zinc-700 uppercase tracking-wider text-zinc-400 font-medium flex gap-2 items-center">
                         {item.type === 'video' && <Video className="w-3 h-3"/>}
                         {item.type === 'interactive' && <Code className="w-3 h-3"/>}
                         {item.type === 'doc' && <BookOpen className="w-3 h-3"/>}
                         {item.type === 'text' && <FileText className="w-3 h-3"/>}
                         {item.type}
                       </span>
                    </div>
                    <p className="text-zinc-400 mb-4">{item.description}</p>
                    <div className="bg-black/50 p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
                       <code className="text-sm text-zinc-500">🔍 Suggested Query: {item.searchQuery}</code>
                       <button 
                          onClick={() => handleSearchVideo(item.searchQuery)}
                          disabled={searchingQuery === item.searchQuery}
                          className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1 justify-center disabled:opacity-50"
                       >
                         {searchingQuery === item.searchQuery ? (
                           <><Loader2 className="w-3 h-3 animate-spin"/> Loading...</>
                         ) : (
                           <>Search <ArrowRight className="w-3 h-3" /></>
                         )}
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#11] border border-zinc-800 rounded-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-[#151515]">
                <h3 className="font-bold text-lg truncate pr-4 text-zinc-100">{selectedVideo.title}</h3>
                <button onClick={() => setSelectedVideo(null)} className="p-2 hover:bg-zinc-800 rounded-full transition text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="w-full bg-black aspect-video relative">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
              <div className="p-6 overflow-y-auto bg-[#0a0a0a]">
                <h4 className="text-sm font-bold text-zinc-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Context / Article Base
                </h4>
                <p className="text-zinc-400 text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedVideo.description}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
