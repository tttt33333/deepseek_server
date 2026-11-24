const axios = require('axios');

// AI 流式对话
module.exports = async function aiChat(req, res) {
  try {
    const { messages } = req.body;

    // 1. 请求上游，responseType: 'stream' 表示拿到一段一段的流
    const upstream = await axios.post(
      'https://api.siliconflow.cn/v1/chat/completions',
      {
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: messages,
        stream: true,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        responseType: 'stream',
      }
    );

    // 2. 告诉前端这是流式响应
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // 3. 上游每来一段，就解析出文字转发给前端
    let buffer = '';
    let ended = false;

    const done = () => {
      if (ended) return;
      ended = true;
      res.write('data: [DONE]\n\n');
      res.end();
    };

    upstream.data.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // 最后半行先存着，等下一段拼完整

      for (const line of lines) {
        const text = line.trim();
        if (!text.startsWith('data:')) continue;

        const data = text.slice(5).trim();
        if (data === '[DONE]') return done();

        try {
          const content = JSON.parse(data).choices?.[0]?.delta?.content;
          if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
        } catch (e) {
          // 解析失败的片段直接跳过
        }
      }
    });

    upstream.data.on('end', done);
    upstream.data.on('error', done);
  } catch (error) {
    console.error('AI 接口报错:', error.response?.data || error.message);
    if (res.headersSent) return res.end();
    res.status(500).json({ error: 'AI 回复失败了，请检查控制台报错' });
  }
};
