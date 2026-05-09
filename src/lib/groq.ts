import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'mock-key-for-now',
});

export async function generateAIInsights(
  role: string,
  scores: { communication: number, problemSolving: number, confidence: number, technical: number, culturalFit: number },
  sentiment: string,
  transcriptThemes: string
) {
  if (process.env.GROQ_API_KEY === 'mock-key-for-now' || !process.env.GROQ_API_KEY) {
    // Return mock data if no key is provided
    return [
      { type: 'strength', text: 'Demonstrated strong problem-solving skills when discussing system architecture.' },
      { type: 'strength', text: 'Maintained excellent confidence and positive sentiment throughout the interview.' },
      { type: 'improvement', text: 'Could improve on providing more concrete examples for technical questions.' }
    ];
  }

  const prompt = `System: "You are an expert hiring analyst. Given candidate interview transcripts and behavioral signals, generate a concise, fair, bias-aware evaluation."

User: "Candidate answered 5 interview questions for ${role}. Scores: Communication: ${scores.communication}, Problem Solving: ${scores.problemSolving}, Confidence: ${scores.confidence}, Technical: ${scores.technical}, Cultural Fit: ${scores.culturalFit}. Sentiment: ${sentiment}. Key transcript themes: ${transcriptThemes}. Generate exactly 3 insights: 2 strengths and 1 constructive improvement. Format as JSON array with keys: type (strength/improvement), text (1 sentence max)."`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-70b-8192', // Assuming llama3 for complex reasoning, can be changed
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error("No content generated");
    
    // Attempt to parse JSON
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : (parsed.insights || parsed);
  } catch (error) {
    console.error("Groq API error:", error);
    return [
      { type: 'strength', text: 'Candidate showed relevant experience for the role.' },
      { type: 'strength', text: 'Good baseline communication skills.' },
      { type: 'improvement', text: 'Needs deeper technical knowledge in specific areas.' }
    ];
  }
}
