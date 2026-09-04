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

async function generatePoWChallenge(project) {
  const roleName = project?.title || 'Software Developer';

  const openrouterKey = config.OPENROUTER_API_KEY;
  if (!openrouterKey) {
    throw new Error('OpenRouter API key is required for Proof of Work challenge generation');
  }



  if (openrouterKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterKey}`
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            {
              role: 'user',
              content: `You are a Proof of Work challenge generator. Output ONLY a single JSON object containing: {"type": "logic_arithmetic" | "logic_pattern" | "code_fix", "question": "string", "answer": "string"}. The question must be a brief coding puzzle or logic riddle. The answer must be a single lowercase word or number. Generate one suited for: ${roleName}`
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices[0].message.content;
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
      console.warn('OpenRouter challenge generation failed, using local mock fallback...', err.message);
    }
  }

  return fallbackChallenges[Math.floor(Math.random() * fallbackChallenges.length)];
}

module.exports = { generatePoWChallenge };
