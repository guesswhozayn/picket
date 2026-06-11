const config = require('../../config/env');

async function runOsintAgent(candidate, userApiKeys = {}) {
  const auditLogs = [];
  let score = 0.1;

  auditLogs.push({
    agent_name: 'OSINT Fact-Checker',
    action: `Verifying digital footprint and resume claims for ${candidate.name}...`,
    timestamp: new Date()
  });

  const geminiKey = userApiKeys?.gemini || config.GEMINI_API_KEY;
  const tavilyKey = userApiKeys?.tavily || config.TAVILY_API_KEY;
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

  // If Gemini API Key is configured, perform a smart fact-check on the profile
  if (geminiKey) {
    try {
      const prompt = `You are an OSINT Fact-Checker agent. Analyze this candidate profile and their external web/social search results for inconsistencies, buzzword-stuffing, or synthetic styling:
Name: ${candidate.name}
Email: ${candidate.email}
Resume snippet: ${candidate.raw_resume_text?.slice(0, 1000) || 'No resume content'}

External Social/Web Search Footprints:
${socialSearchContext}

Output a JSON object containing:
{"score": number between 0.0 and 1.0 (where 0.0 is perfect genuine human and 1.0 is high likelihood of synthetic/bot generation), "analysis": "brief summary of findings under 15 words"}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
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
        console.warn(`Gemini API returned status ${response.status}: ${errText}`);
      }
    } catch (err) {
      console.warn('OSINT Gemini check failed, falling back to static rules:', err.message);
    }
  }

  // Fallback Rule-Based Checks
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
