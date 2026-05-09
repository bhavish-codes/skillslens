"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle2, Video, StopCircle, ArrowRight, Clock, Mic, MicOff } from "lucide-react";

const FALLBACK_QUESTIONS = [
  { id: "q1", text: "Tell us about your background and experience relevant to this role.", timeLimit: 60 },
  { id: "q2", text: "How do you handle challenging situations or tight deadlines?", timeLimit: 90 },
  { id: "q3", text: "What makes you a great fit for this position?", timeLimit: 60 },
];

interface Question {
  id: string;
  text: string;
  timeLimit: number;
}

interface Response {
  questionIndex: number;
  transcript: string;
  duration: number;
}

export default function CandidateInterviewScreen() {
  const router = useRouter();
  const params = useParams();
  const token = params.id as string;

  const [step, setStep] = useState<"welcome" | "info" | "interview" | "done">("welcome");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [interviewId, setInterviewId] = useState<string>("");
  const [interviewTitle, setInterviewTitle] = useState("Interview");
  const [interviewRole, setInterviewRole] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [startTime, setStartTime] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch interview by token
  useEffect(() => {
    if (!token) return;
    fetch(`/api/interviews/token/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.interview) {
          setInterviewId(data.interview._id);
          setInterviewTitle(data.interview.title);
          setInterviewRole(data.interview.role);
          setQuestions(data.interview.questions || FALLBACK_QUESTIONS);
        } else {
          // Use fallback for demo
          setQuestions(FALLBACK_QUESTIONS);
          setInterviewTitle("Demo Interview");
        }
      })
      .catch(() => {
        setQuestions(FALLBACK_QUESTIONS);
        setInterviewTitle("Demo Interview");
      });
  }, [token]);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "interview" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (step === "interview" && timeLeft === 0 && isRecording) {
      stopRecording();
    }
    return () => clearInterval(timer);
  }, [timeLeft, step, isRecording]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const startQuestion = async () => {
    if (!streamRef.current) await startCamera();
    setTimeLeft(questions[currentQIdx]?.timeLimit || 60);
    startRecording();
    setStartTime(Date.now());
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleNextQuestion = () => {
    stopRecording();
    const duration = Math.round((Date.now() - startTime) / 1000);
    // Save response (with mock transcript for now)
    const newResponse: Response = {
      questionIndex: currentQIdx,
      transcript: `[Video Response] Candidate answered question ${currentQIdx + 1}: "${questions[currentQIdx]?.text}"`,
      duration: duration || 30,
    };
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(p => p + 1);
      setTimeLeft(questions[currentQIdx + 1]?.timeLimit || 60);
      startRecording();
      setStartTime(Date.now());
    } else {
      // Final question — submit
      submitInterview(updatedResponses);
    }
  };

  const submitInterview = async (finalResponses: Response[]) => {
    setIsSubmitting(true);
    stopCamera();

    try {
      // If we have a real session, submit to it; otherwise just show done screen
      if (sessionId) {
        await fetch(`/api/sessions/${sessionId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responses: finalResponses }),
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
      setStep("done");
    }
  };

  const handleStartInterview = async () => {
    if (!candidateName || !candidateEmail) {
      alert("Please enter your name and email.");
      return;
    }

    // Create a session
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: interviewId || "demo",
          candidateEmail,
          candidateName,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session._id);
      }
    } catch (err) {
      // Continue without session for demo
    }

    setStep("interview");
    await startCamera();
    setTimeLeft(questions[0]?.timeLimit || 60);
    startRecording();
    setStartTime(Date.now());
  };

  // Welcome screen
  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white p-10 rounded-2xl border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-blue-100 text-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Video className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-[#0F1F3D] mb-2">{interviewTitle}</h1>
          {interviewRole && <p className="text-[#2563EB] font-medium mb-4">{interviewRole}</p>}
          <p className="text-slate-600 mb-8 leading-relaxed">
            This async interview has <strong>{questions.length || 3} questions</strong>. You'll record your answers with a time limit per question. Find a quiet place with good lighting before starting.
          </p>
          <button
            onClick={() => setStep("info")}
            className="w-full py-4 bg-[#2563EB] text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
          >
            Let's Get Started →
          </button>
          <p className="text-xs text-slate-400 mt-4">By starting, you agree to our Terms of Service & Privacy Policy.</p>
        </div>
      </div>
    );
  }

  // Info screen
  if (step === "info") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
          <h2 className="text-2xl font-bold text-[#0F1F3D] mb-2">Your Details</h2>
          <p className="text-slate-500 mb-6">We need a few details before you start.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="John Smith"
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="john@example.com"
                value={candidateEmail}
                onChange={e => setCandidateEmail(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleStartInterview}
            className="mt-6 w-full py-4 bg-[#0F1F3D] text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Start Recording →
          </button>
        </div>
      </div>
    );
  }

  // Done screen
  if (step === "done") {
    return (
      <div className="min-h-screen bg-[#0F1F3D] flex items-center justify-center p-6 text-center text-white">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Interview Complete! 🎉</h1>
          <p className="text-slate-400 mb-8">
            Your responses have been securely submitted. The AI scoring engine is analyzing your answers. You'll hear from the recruiting team soon.
          </p>
          <button onClick={() => router.push("/")} className="px-8 py-3 bg-white text-[#0F1F3D] rounded-lg font-bold hover:bg-slate-200 transition-colors">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Interview screen
  const currentQuestion = questions[currentQIdx];
  const progress = ((currentQIdx) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-black flex flex-col text-white overflow-hidden">
      {/* Header overlay */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6">
        <span className="font-bold text-lg text-white/90">SkillsLens</span>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-mono">
            Q {currentQIdx + 1} / {questions.length}
          </div>
          <div className={`px-4 py-2 rounded-full font-mono text-sm font-bold flex items-center gap-2 transition-colors ${timeLeft <= 10 ? 'bg-red-500/80 animate-pulse' : 'bg-white/10 backdrop-blur-sm'}`}>
            <Clock className="w-4 h-4" />
            00:{String(timeLeft).padStart(2, '0')}
          </div>
          {isRecording && (
            <div className="flex items-center gap-1.5 bg-red-500/80 backdrop-blur-sm px-3 py-2 rounded-full text-xs font-bold">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div> REC
            </div>
          )}
        </div>
      </header>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/10">
        <div className="h-full bg-[#2563EB] transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Camera feed */}
      <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50" />

      {/* Question overlay */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        {currentQuestion && (
          <div className="max-w-2xl w-full bg-black/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 text-center shadow-2xl">
            <div className="text-[#67E8F9] text-xs font-bold uppercase tracking-widest mb-4">Question {currentQIdx + 1}</div>
            <h2 className="text-2xl font-bold text-white leading-relaxed">{currentQuestion.text}</h2>
            <p className="text-slate-400 text-sm mt-4">Time limit: {currentQuestion.timeLimit}s</p>
          </div>
        )}
      </main>

      {/* Controls */}
      <div className="relative z-20 flex items-center justify-center gap-6 p-12">
        {!isRecording ? (
          <button
            onClick={startQuestion}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center border-4 border-white/20 hover:scale-110 transition-transform shadow-lg"
          >
            <div className="w-6 h-6 rounded-full bg-white"></div>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white hover:scale-110 transition-transform"
          >
            <StopCircle className="w-8 h-8 text-red-400" />
          </button>
        )}

        <button
          onClick={handleNextQuestion}
          disabled={isSubmitting}
          className="h-16 px-8 rounded-full bg-[#2563EB] flex items-center gap-3 font-bold text-white hover:bg-blue-600 transition-colors border-4 border-[#2563EB]/50 disabled:opacity-70"
        >
          {isSubmitting ? "Submitting..." : currentQIdx === questions.length - 1 ? "Submit Interview" : "Next Question"}
          {!isSubmitting && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
