const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 获取完整的路径参数
  const rawPath = event.path.replace('/.netlify/functions/accelerate', ''); // 移除函数基础路径
  const encodedUrl = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath; // 移除开头的斜杠

  if (!encodedUrl) {
    return { statusCode: 302, headers: { Location: '/' } };
  }

  // 解码并处理URL（保持原有逻辑）
  let targetUrl;
  try {
    targetUrl = decodeURIComponent(encodedUrl);
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'http://' + targetUrl;
    }
  } catch (e) {
    return { statusCode: 400, body: '无效的URL编码' };
  }

  // 代理请求（保持原有逻辑）
  try {
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`HTTP错误! 状态码: ${res.status}`);

    const headers = {
      'content-type': res.headers.get('content-type') || 'application/octet-stream',
      'content-disposition': `attachment; filename="${targetUrl.split('/').pop()}"`
    };

    const buffer = await res.buffer();

    return {
      statusCode: 200,
      headers,
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: `请求失败: ${error.message}`
    };
  }
};
