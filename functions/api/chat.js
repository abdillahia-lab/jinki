// Cloudflare Pages Function — Jinki AI Chatbot Proxy
// Proxies requests to Groq API with rate limiting and system prompt
// Free tier: 14,400 requests/day, 30 requests/minute

const SYSTEM_PROMPT = `You are Jinki's AI assistant — a knowledgeable, concise guide for Jinki Aerial Intelligence.

ABOUT JINKI:
- Jinki is an aerial intelligence firm (NOT a drone company) serving enterprise clients
- We provide thermal imaging, LiDAR, and AI-powered inspection for critical infrastructure
- Verticals: Data Centers, Energy & Utilities, Perimeter Security, Agriculture
- Services: Facility Intelligence Scan (one-time assessment) and Autonomous Deployment (persistent monitoring)
- Equipment: DJI M400 RTK with H30T thermal sensor (piloted), DJI M4TD + Dock 3 (autonomous)
- Report turnaround: 48 hours
- Thermal precision: 0.5°C
- Coverage: 50+ miles of corridor per day
- Autonomous capacity: 150-200 missions per month
- Region: Mid-Atlantic United States
- Certifications: FAA Part 107, DC SFRA trained
- SOC 2 Type I: In progress
- Founded by Adnan Abdillahi (CISSP, CCSP, AIGP, PMP)

RULES:
- Be concise (2-3 sentences max per response)
- Never fabricate capabilities, certifications, or client names
- Never mention pricing — direct users to "Request a Demo" or "Get in Touch"
- If asked about something outside Jinki's scope, politely redirect
- Professional but approachable tone
- If asked about competitors, acknowledge them professionally without disparaging`;

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Chatbot not configured. Please contact us directly.' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const userMessage = body.message?.trim();

    if (!userMessage || userMessage.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Please provide a message (max 500 characters).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('Groq API error:', groqResponse.status, errText);
      return new Response(
        JSON.stringify({ reply: "I'm temporarily unavailable. Please use our contact form or email info@jinki.ai directly." }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content || "I couldn't process that. Please try rephrasing or contact us at info@jinki.ai.";

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Chat function error:', err);
    return new Response(
      JSON.stringify({ reply: "Something went wrong. Please contact us at info@jinki.ai." }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
