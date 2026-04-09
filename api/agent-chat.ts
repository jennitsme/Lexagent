import OpenAI from 'openai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on server' });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            'You are a wallet transaction interpreter. Convert user chat into JSON only. JSON schema: {"intent":"send_sol"|"chat", "amountSol":number|null, "toAddress":string|null, "reply":string}. If user clearly asks to send SOL and includes amount + destination wallet, set intent=send_sol. Otherwise intent=chat and give helpful reply. Output must be pure JSON without markdown.'
        },
        { role: 'user', content: message },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    return res.status(200).json({
      intent: parsed?.intent === 'send_sol' ? 'send_sol' : 'chat',
      amountSol: typeof parsed?.amountSol === 'number' ? parsed.amountSol : null,
      toAddress: typeof parsed?.toAddress === 'string' ? parsed.toAddress : null,
      reply:
        typeof parsed?.reply === 'string'
          ? parsed.reply
          : "I couldn't parse that. Try: send 0.1 SOL to <wallet_address>",
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to process message' });
  }
}
