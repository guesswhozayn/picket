const config = require('../../config/env');

const fallbackChallenges = [
  {
    type: 'logic_arithmetic',
    question: 'In a sequence: 4, 8, 16, 32... What is the next number?',
    answer: '64'
  },
  {
    type: 'logic_pattern',
    question: 'Complete the pattern: A1, B2, C3, ...',
    answer: 'D4'
  },
  {
    type: 'code_fix',
    question: 'What is the output of `console.log(typeof null)`?',
    answer: 'object'
  }
];

async function generatePoWChallenge(project, userApiKeys = {}) {
  const roleName = project?.title || 'Software Developer';

  const groqKey = userApiKeys?.groq;
  const geminiKey = userApiKeys?.gemini;
  if (!groqKey && !geminiKey) {
    throw new Error('Groq or Gemini API key is required for Proof of Work challenge generation');
  }

  if (groqKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a Proof of Work challenge generator. Output ONLY a valid JSON object matching this schema: {"type": "logic_arithmetic" | "logic_pattern" | "code_fix", "question": "string", "answer": "string"}. The question must be a short logical riddle or code fix. The answer must be a single lowercase word or number.'
            },
            {
              role: 'user',
              content: `Generate a challenge for a candidate applying for: ${roleName}`
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        if (content.question && content.answer) {
          return {
            type: content.type || 'logic_arithmetic',
            question: content.question,
            answer: content.answer.trim().toLowerCase()
          };
        }
      }
    } catch (err) {
      console.warn('Groq challenge generation failed, trying Gemini...', err.message);
    }
  }

  if (geminiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are a Proof of Work challenge generator. Output ONLY a single JSON object containing: {"type": "logic_arithmetic" | "logic_pattern" | "code_fix", "question": "string", "answer": "string"}. The question must be a brief coding puzzle or logic riddle. The answer must be a single lowercase word or number. Generate one suited for: ${roleName}`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        const content = JSON.parse(text);
        if (content.question && content.answer) {
          return {
            type: content.type || 'logic_arithmetic',
            question: content.question,
            answer: content.answer.trim().toLowerCase()
          };
        }
      }
    } catch (err) {
      console.warn('Gemini challenge generation failed, using local mock fallback...', err.message);
    }
  }

  return fallbackChallenges[Math.floor(Math.random() * fallbackChallenges.length)];
}

module.exports = { generatePoWChallenge };
