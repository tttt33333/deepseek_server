/**
 * 普通接口
 * 成功自动返回 { code: 0, data }，出错自动返回 500。
 */
function handle(fn) {
  return async (req, res) => {
    try {
      const data = await fn(req, res);
      if (data !== undefined && !res.headersSent) {
        res.json({ code: 0, message: 'ok', data });
      }
    } catch (err) {
      console.error(`[${req.method} ${req.originalUrl}]`, err);
      if (res.headersSent) return res.end();
      res.status(500).json({ code: -1, message: err.message || '服务器错误' });
    }
  };
}

module.exports = { handle };
