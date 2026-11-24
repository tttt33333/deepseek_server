const express = require('express');
const cors = require('cors');
require('dotenv').config();

const aiChat = require('./ai');
const { handle } = require('./lib/route');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// AI 接口
app.post('/api/chat', aiChat);

// 启动服务
app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ 后端服务已启动: http://localhost:${process.env.PORT || 3000}`);
});