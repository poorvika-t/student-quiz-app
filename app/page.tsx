'use client';
import { useState, useEffect } from 'react';

// === PASTE YOUR GOOGLE SCRIPT URL HERE ===
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyksTUnLbWu8DR_yK8LXhpj3j855O79x-CEL9jrdk9Zx7_qCTEmlOt3ARerWJESePw/exec";

// Optional Clue for the Mystery Word at the end
const FINAL_WORD_CLUE = "Clue: A fundamental domain of modern computing and internet architecture.";

const QUESTIONS = [
  { q: "What is the output of len(\"Python\")?", opts: ["5", "6", "7", "Error"], ans: 1, letter: "K" },
  { q: "Which symbol starts a comment in Python?", opts: ["//", "/*", "#", "--"], ans: 2, letter: "C" },
  { q: "Which Git command creates a copy of a remote repo?", opts: ["git copy", "git clone", "git fork", "git pull-copy"], ans: 1, letter: "W" },
  { q: "Which protocol is used to securely transfer web pages?", opts: ["HTTP", "FTP", "HTTPS", "SMTP"], ans: 2, letter: "O" },
  { q: "What does IP stand for?", opts: ["Internet Protocol", "Internal Program", "Internet Process", "Information Protocol"], ans: 0, letter: "O" },
  { q: "Which SQL command retrieves data from a database?", opts: ["GET", "SELECT", "FETCHDATA", "OPEN"], ans: 1, letter: "M" },
  { q: "Which operator gets the memory address of a variable in C++?", opts: ["*", "#", "&", "@"], ans: 2, letter: "E" },
  { q: "Which data structure follows FIFO?", opts: ["Stack", "Queue", "Tree", "Graph"], ans: 1, letter: "P" },
  { q: "Which data structure follows LIFO?", opts: ["Queue", "Array", "Stack", "Linked List"], ans: 2, letter: "R" },
  { q: "Which of the following is an operating system?", opts: ["MySQL", "Linux", "Python", "HTML"], ans: 1, letter: "R" },
  { q: "Which HTML tag creates a hyperlink?", opts: ["<link>", "<a>", "<href>", "<url>"], ans: 1, letter: "T" },
  { q: "Which language drives webpage interactivity?", opts: ["HTML", "CSS", "JavaScript", "SQL"], ans: 2, letter: "U" },
  { q: "What is phishing?", opts: ["A programming language", "A deceptive cyberattack", "A database technique", "A network protocol"], ans: 1, letter: "T" },
  { q: "What does AI stand for?", opts: ["Automated Internet", "Artificial Intelligence", "Advanced Information", "Artificial Internet"], ans: 1, letter: "N" },
  { q: "Which ML type uses labeled data for training?", opts: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Random Learning"], ans: 0, letter: "E" }
];

export default function Home() {
  const [step, setStep] = useState<'login' | 'survey' | 'quiz' | 'guess' | 'submitted'>('login');
  const [user, setUser] = useState({ name: '', email: '' });

  // Survey State
  const [surveyIndex, setSurveyIndex] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState<string[]>(Array(7).fill(""));

  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 Mins
  const [startTime, setStartTime] = useState<string | null>(null);

  // Feedback State for Wrong/Correct Answer
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Final Guess State
  const [finalGuess, setFinalGuess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer logic
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
    if (user.name.trim() && user.email.trim()) setStep('survey');
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
    if (feedback !== null) return; // Prevent double clicking during delay

    const currentQ = QUESTIONS[quizIndex];
    setSelectedOpt(selectedOptIndex);

    if (selectedOptIndex === currentQ.ans) {
      setScore(prev => prev + 1);
      setRevealedLetters(prev => [...prev, currentQ.letter]);
      setFeedback({
        isCorrect: true,
        text: `Correct! Letter Revealed: "${currentQ.letter}"`
      });
    } else {
      setFeedback({
        isCorrect: false,
        text: `Incorrect. The correct answer was: "${currentQ.opts[currentQ.ans]}"`
      });
    }

    // Delay auto-advance so participant can read answer feedback
    setTimeout(() => {
      setFeedback(null);
      setSelectedOpt(null);
      if (quizIndex < QUESTIONS.length - 1) {
        setQuizIndex(prev => prev + 1);
      } else {
        setStep('guess');
      }
    }, 1800);
  };

const handleSubmitAll = async () => {
    setIsSubmitting(true);
    const timeTakenSeconds = 1200 - timeLeft;
    const minutes = Math.floor(timeTakenSeconds / 60);
    const seconds = timeTakenSeconds % 60;
    const formattedTimeTaken = `${minutes}m ${seconds}s`;

    // Convert data to URL Search Params format so browser's 'no-cors' mode sends body payload intact
    const formData = new URLSearchParams();
    formData.append("name", user.name);
    formData.append("email", user.email);
    formData.append("q1", surveyAnswers[0]);
    formData.append("q2", surveyAnswers[1]);
    formData.append("q3", surveyAnswers[2]);
    formData.append("q4", surveyAnswers[3]);
    formData.append("q5", surveyAnswers[4]);
    formData.append("q6", surveyAnswers[5]);
    formData.append("q7", surveyAnswers[6]);
    formData.append("score", score.toString());
    formData.append("finalGuess", finalGuess);
    formData.append("quizStartTime", startTime || "");
    formData.append("timeTaken", formattedTimeTaken);

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      });
      setStep('submitted');
    } catch (err) {
      alert("Submission failed. Please check your internet connection.");
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '650px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', padding: '32px', border: '1px solid #e5e7eb' }}>
        
        {/* LOGIN STEP */}
        {step === 'login' && (
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#4f46e5', letterSpacing: '0.05em' }}>Step 1 of 3</span>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '8px 0 24px 0' }}>Student Onboarding</h1>
            <form onSubmit={handleStartSurvey} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Full Name</label>
                <input type="text" required placeholder="John Doe" value={user.name} onChange={e => setUser({...user, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email Address</label>
                <input type="email" required placeholder="john@example.com" value={user.email} onChange={e => setUser({...user, email: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', outline: 'none' }} />
              </div>
              <button type="submit" style={{ marginTop: '8px', backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                Continue to Survey →
              </button>
            </form>
          </div>
        )}

        {/* SURVEY STEP */}
        {step === 'survey' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#4f46e5' }}>Survey ({surveyIndex + 1} / 7)</span>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Mandatory Questions</span>
            </div>
            
            <div style={{ width: '100%', backgroundColor: '#e5e7eb', height: '6px', borderRadius: '3px', marginBottom: '24px' }}>
              <div style={{ width: `${((surveyIndex + 1) / 7) * 100}%`, backgroundColor: '#4f46e5', height: '100%', borderRadius: '3px', transition: 'width 0.3s' }}></div>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>{surveyQuestions[surveyIndex]}</h2>

            {surveyIndex === 2 ? (
              <select 
                value={surveyAnswers[2]} 
                onChange={e => {
                  const newAns = [...surveyAnswers];
                  newAns[2] = e.target.value;
                  setSurveyAnswers(newAns);
                }}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', marginBottom: '20px', backgroundColor: '#fff' }}
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
                placeholder="Type your response here..."
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', marginBottom: '20px', resize: 'vertical' }}
                value={surveyAnswers[surveyIndex]}
                onChange={e => {
                  const newAns = [...surveyAnswers];
                  newAns[surveyIndex] = e.target.value;
                  setSurveyAnswers(newAns);
                }}
              />
            )}

            <button 
              onClick={handleNextSurvey} 
              disabled={!surveyAnswers[surveyIndex].trim()}
              style={{ width: '100%', backgroundColor: surveyAnswers[surveyIndex].trim() ? '#4f46e5' : '#9ca3af', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '600', fontSize: '16px', cursor: surveyAnswers[surveyIndex].trim() ? 'pointer' : 'not-allowed' }}
            >
              {surveyIndex === 6 ? 'Start Quiz →' : 'Next Question →'}
            </button>
          </div>
        )}

        {/* QUIZ STEP */}
        {step === 'quiz' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', backgroundColor: '#f9fafb', padding: '12px 16px', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
              <span style={{ fontWeight: '700', fontSize: '14px', color: '#374151' }}>Q{quizIndex + 1} of 15</span>
              <span style={{ fontWeight: '700', fontSize: '14px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '4px 10px', borderRadius: '6px' }}>
                ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '20px', lineHeight: '1.4' }}>
              {QUESTIONS[quizIndex].q}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {QUESTIONS[quizIndex].opts.map((opt, i) => {
                let btnBg = '#ffffff';
                let btnBorder = '#e5e7eb';
                let btnColor = '#374151';

                if (selectedOpt !== null) {
                  if (i === QUESTIONS[quizIndex].ans) {
                    btnBg = '#ecfdf5';
                    btnBorder = '#10b981';
                    btnColor = '#065f46';
                  } else if (i === selectedOpt) {
                    btnBg = '#fef2f2';
                    btnBorder = '#ef4444';
                    btnColor = '#991b1b';
                  }
                }

                return (
                  <button 
                    key={i} 
                    onClick={() => handleAnswerQuiz(i)} 
                    disabled={feedback !== null}
                    style={{ padding: '14px 16px', borderRadius: '10px', border: `2px solid ${btnBorder}`, backgroundColor: btnBg, color: btnColor, fontWeight: '600', fontSize: '15px', textAlign: 'left', cursor: feedback === null ? 'pointer' : 'default', transition: 'all 0.2s' }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* ANSWER FEEDBACK DISPLAY */}
            {feedback && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: feedback.isCorrect ? '#ecfdf5' : '#fef2f2', border: `1px solid ${feedback.isCorrect ? '#a7f3d0' : '#fecaca'}`, color: feedback.isCorrect ? '#065f46' : '#991b1b', fontWeight: '600', fontSize: '14px' }}>
                {feedback.text}
              </div>
            )}
          </div>
        )}

        {/* FINAL GUESS STEP */}
        {step === 'guess' && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Quiz Finished!</h2>
            <p style={{ fontSize: '15px', color: '#4b5563', marginBottom: '20px' }}>Your Score: <strong>{score} / 15</strong></p>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Revealed Letters</span>
              <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '4px', color: '#4f46e5', margin: '8px 0' }}>
                {revealedLetters.length > 0 ? revealedLetters.join(" - ") : "None Revealed"}
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0', fontStyle: 'italic' }}>{FINAL_WORD_CLUE}</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Type Your Final Word Guess</label>
              <input 
                type="text" 
                placeholder="Enter word here..."
                value={finalGuess} 
                onChange={e => setFinalGuess(e.target.value)} 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', outline: 'none' }} 
              />
            </div>

            <button 
              onClick={handleSubmitAll} 
              disabled={isSubmitting} 
              style={{ width: '100%', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
            >
              {isSubmitting ? "Submitting to Sheet..." : "Submit Everything →"}
            </button>
          </div>
        )}

        {/* SUBMITTED STEP */}
        {step === 'submitted' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Submission Received!</h2>
            <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.5' }}>
              Thank you, <strong>{user.name}</strong>. Your survey responses, quiz results, and final guess have been automatically logged to Google Sheets.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}