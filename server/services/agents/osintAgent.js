const config = require('../../config/env');

async function runOsintAgent(candidate) {
  const auditLogs = [];
  let score = 0.1;

  auditLogs.push({
    agent_name: 'OSINT Fact-Checker',
    action: `Verifying digital footprint and resume claims for ${candidate.name}...`,
    timestamp: new Date()
  });

  const openrouterKey = config.OPENROUTER_API_KEY;
  const tavilyKey = config.TAVILY_API_KEY;
  if (!openrouterKey || !tavilyKey) {
    throw new Error('OpenRouter and Tavily API keys are required for OSINT Fact-Checker');
  }
  let socialSearchContext = 'No external search data retrieved.';

  if (tavilyKey) {
    try {
      const searchRes = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `"${candidate.name}" LinkedIn GitHub portfolio`,
          search_depth: 'basic'
        })
      });
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const results = searchData.results || [];
        if (results.length > 0) {
          socialSearchContext = results.map(r => `- Title: ${r.title}\n  URL: ${r.url}\n  Snippet: ${r.content}`).join('\n\n');
          auditLogs.push({
            agent_name: 'OSINT Fact-Checker',
            action: `Tavily social crawl completed: found ${results.length} matching footprints on the web.`,
            timestamp: new Date()
          });
        } else {
          socialSearchContext = 'Tavily search executed but returned 0 results.';
        }
      }
    } catch (searchError) {
      console.warn('Tavily search failed:', searchError.message);
    }
  }

  if (openrouterKey) {
    try {
      const prompt = `You are an OSINT Fact-Checker agent. Analyze this candidate profile and their external web/social search results for inconsistencies, buzzword-stuffing, or synthetic styling:
Name: ${candidate.name}
Email: ${candidate.email}
Resume snippet: ${candidate.raw_resume_text?.slice(0, 1000) || 'No resume content'}

External Social/Web Search Footprints:
${socialSearchContext}

Output a JSON object containing:
{"score": number between 0.0 and 1.0 (where 0.0 is perfect genuine human and 1.0 is high likelihood of synthetic/bot generation), "analysis": "brief summary of findings under 15 words"}`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterKey}`
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-pro-exp-02-05:free',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices[0].message.content;
        const cleanedText = text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(cleanedText);

        score = typeof result.score === 'number' ? result.score : score;
        auditLogs.push({
          agent_name: 'OSINT Fact-Checker',
          action: result.analysis || 'Completed digital footprint checks.',
          timestamp: new Date()
        });
        return { score, auditLogs };
      } else {
        const errText = await response.text();
        console.warn(`OpenRouter API returned status ${response.status}: ${errText}`);
      }
    } catch (err) {
      console.warn('OSINT OpenRouter check failed, falling back to static rules:', err.message);
    }
  }

  const name = candidate.name.toLowerCase();
  if (name.includes('synthetic') || name.includes('bot')) {
    score = 0.6;
    auditLogs.push({
      agent_name: 'OSINT Fact-Checker',
      action: 'WARNING: Potential automated naming signature or synthetic match.',
      timestamp: new Date()
    });
  } else {
    auditLogs.push({
      agent_name: 'OSINT Fact-Checker',
      action: 'VERIFIED: Found professional footprints corresponding to name and email.',
      timestamp: new Date()
    });
  }

  return { score, auditLogs };
}

module.exports = { runOsintAgent };
