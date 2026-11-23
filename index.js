const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('后端服务运行成功！');
});

// 核心接口：处理 AI 对话
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body; // 前端传过来的聊天记录

    const response = await axios.post(
      'https://api.siliconflow.cn/v1/chat/completions', 
      {
        model: 'Qwen/Qwen2.5-7B-Instruct', // https://cloud.siliconflow.c
        messages: messages,
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
      }
    );

    // 提取 AI 的回复并返回给前端
    const reply = response.data.choices[0].message.content;
    console.log(response,'response')
    res.json({ reply });
    
  } catch (error) {
    console.error('DeepSeek API 报错:', error.response?.data || error.message);
    res.status(500).json({ error: 'AI 回复失败了，请检查控制台报错' });
  }
});

// 启动服务
app.listen(process.env.PORT, () => {
  console.log(`✅ 后端服务已启动: http://localhost:${process.env.PORT}`);
});