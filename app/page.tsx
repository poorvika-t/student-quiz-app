'use client';
import { useState, useEffect } from 'react';

// === PASTE YOUR GOOGLE SCRIPT URL HERE ===
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxa9m2w4hOMIDmdTP8X9DN9ttxfis_EW6SLEMm5Tdr-BjHDMc4l6YqROVA7AZCdPg/exec";

const QUESTIONS = [
  { q: "What is the output of len(\"Python\")?", opts: ["5", "6", "7", "Error"], ans: 1, letter: "Y" },
  { q: "Which symbol starts a comment in Python?", opts: ["//", "/*", "#", "--"], ans: 2, letter: "T" },
  { q: "Which Git command creates a copy of a remote repo?", opts: ["git copy", "git clone", "git fork", "git pull-copy"], ans: 1, letter: "E" },
  { q: "Which protocol is used to securely transfer web pages?", opts: ["HTTP", "FTP", "HTTPS", "SMTP"], ans: 2, letter: "S" },
  { q: "What does IP stand for?", opts: ["Internet Protocol", "Internal Program", "Internet Process", "Information Protocol"], ans: 0, letter: "S" },
  { q: "Which SQL command retrieves data from a database?", opts: ["GET", "SELECT", "FETCHDATA", "OPEN"], ans: 1, letter: "R" },
  { q: "Which operator gets the memory address of a variable in C++?", opts: ["*", "#", "&", "@"], ans: 2, letter: "N" },
  { q: "Which data structure follows FIFO?", opts: ["Stack", "Queue", "Tree", "Graph"], ans: 1, letter: "L" },
  { q: "Which data structure follows LIFO?", opts: ["Queue", "Array", "Stack", "Linked List"], ans: 2, letter: "U" },
  { q: "Which of the following is an operating system?", opts: ["MySQL", "Linux", "Python", "HTML"], ans: 1, letter: "A" },
  { q: "Which HTML tag creates a hyperlink?", opts: ["<link>", "<a>", "<href>", "<url>"], ans: 1, letter: "E" },
  { q: "Which language drives webpage interactivity?", opts: ["HTML", "CSS", "JavaScript", "SQL"], ans: 2, letter: "T" },
  { q: "What is phishing?", opts: ["A programming language", "A deceptive cyberattack", "A database technique", "A network protocol"], ans: 1, letter: "N" },
  { q: "What does AI stand for?", opts: ["Automated Internet", "Artificial Intelligence", "Advanced Information", "Artificial Internet"], ans: 1, letter: "R" },
  { q: "Which ML type uses labeled data for training?", opts: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Random Learning"], ans: 0, letter: "K" }
];

export default function Home() {
  const [step, setStep] = useState('login');
  const [user, setUser] = useState({ name: '', email: '' });
  
  const [surveyIndex, setSurveyIndex] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState<string[]>(Array(7).fill(""));

  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(1200);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [finalGuess, setFinalGuess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (step === 'quiz' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (step === 'quiz' && timeLeft === 0) {
      setStep('guess');
    }
  }, [step, timeLeft]);

  const handleStartSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.name && user.email) setStep('survey');
  };

  const handleNextSurvey = () => {
    if (surveyAnswers[surveyIndex].trim() === "") return;
    if (surveyIndex < 6) {
      setSurveyIndex(prev => prev + 1);
    } else {
      setStep('quiz');
      setStartTime(new Date().toLocaleTimeString());
    }
  };

  const handleAnswerQuiz = (selectedOptIndex: number) => {
    const currentQ = QUESTIONS[quizIndex];
    if (selectedOptIndex === currentQ.ans) {
      setScore(prev => prev + 1);
      setRevealedLetters(prev => [...prev, currentQ.letter]);
    }
    if (quizIndex < QUESTIONS.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      setStep('guess');
    }
  };

  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    const timeTakenSeconds = 1200 - timeLeft;
    const minutes = Math.floor(timeTakenSeconds / 60);
    const seconds = timeTakenSeconds % 60;
    const formattedTimeTaken = `${minutes}m ${seconds}s`;

    const payload = {
      name: user.name,
      email: user.email,
      q1: surveyAnswers[0],
      q2: surveyAnswers[1],
      q3: surveyAnswers[2],
      q4: surveyAnswers[3],
      q5: surveyAnswers[4],
      q6: surveyAnswers[5],
      q7: surveyAnswers[6],
      score: score,
      finalGuess: finalGuess,
      quizStartTime: startTime,
      timeTaken: formattedTimeTaken
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      setSubmitted(true);
    } catch (err) {
      alert("Error submitting data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const surveyQuestions = [
    "What is one thing that frustrates you the most in your current student life?",
    "Think about the most recent time this happened. What were you trying to do, and what made it difficult?",
    "How often do you face this problem?",
    "What do you currently do to deal with it?",
    "What is the biggest drawback of your current way of dealing with it?",
    "If this problem were completely solved, what would improve for you?",
    "Is there a problem you think students face that people don't talk about enough?"
  ];

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      
      {step === 'login' && (
        <div>
          <h2>Enter Participant Details</h2>
          <form onSubmit={handleStartSurvey}>
            <div style={{ marginBottom: '10px' }}>
              <label>Name: </label>
              <input type="text" required value={user.name} onChange={e => setUser({...user, name: e.target.value})} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Email: </label>
              <input type="email" required value={user.email} onChange={e => setUser({...user, email: e.target.value})} style={{ width: '100%', padding: '8px' }} />
            </div>
            <button type="submit" style={{ padding: '10px 15px' }}>Start Survey</button>
          </form>
        </div>
      )}

      {step === 'survey' && (
        <div>
          <h3>Survey ({surveyIndex + 1}/7)</h3>
          <p><strong>{surveyQuestions[surveyIndex]}</strong></p>
          
          {surveyIndex === 2 ? (
            <select 
              value={surveyAnswers[2]} 
              onChange={e => {
                const newAns = [...surveyAnswers];
                newAns[2] = e.target.value;
                setSurveyAnswers(newAns);
              }}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            >
              <option value="">-- Select Frequency --</option>
              <option value="Almost every day">Almost every day</option>
              <option value="A few times a week">A few times a week</option>
              <option value="A few times a month">A few times a month</option>
              <option value="Rarely">Rarely</option>
              <option value="It happened only once">It happened only once</option>
            </select>
          ) : (
            <textarea 
              rows={4} 
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              value={surveyAnswers[surveyIndex]}
              onChange={e => {
                const newAns = [...surveyAnswers];
                newAns[surveyIndex] = e.target.value;
                setSurveyAnswers(newAns);
              }}
            />
          )}

          <button onClick={handleNextSurvey} style={{ padding: '10px 15px' }}>
            {surveyIndex === 6 ? 'Start Quiz' : 'Next'}
          </button>
        </div>
      )}

      {step === 'quiz' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
            <span>Question {quizIndex + 1} / 15</span>
            <span>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>

          <p style={{ marginTop: '20px' }}><strong>{QUESTIONS[quizIndex].q}</strong></p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {QUESTIONS[quizIndex].opts.map((opt, i) => (
              <button key={i} onClick={() => handleAnswerQuiz(i)} style={{ padding: '10px', textAlign: 'left' }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'guess' && !submitted && (
        <div>
          <h3>Quiz Completed!</h3>
          <p>Your Score: {score} / 15</p>
          <p>Revealed Letters so far: <strong>{revealedLetters.join(" - ") || "None"}</strong></p>
          
          <div style={{ marginTop: '20px' }}>
            <label>Type your final word guess:</label>
            <input 
              type="text" 
              value={finalGuess} 
              onChange={e => setFinalGuess(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px', marginBottom: '15px' }} 
            />
          </div>

          <button onClick={handleSubmitAll} disabled={isSubmitting} style={{ padding: '10px 15px' }}>
            {isSubmitting ? "Submitting..." : "Submit Response"}
          </button>
        </div>
      )}

      {step === 'guess' && submitted && (
        <div style={{ textAlign: 'center' }}>
          <h2>Thank You!</h2>
          <p>Your responses and score have been recorded successfully in Google Sheets.</p>
        </div>
      )}

    </main>
  );
}