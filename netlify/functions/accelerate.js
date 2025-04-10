const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 解析路径参数
  const encodedUrl = event.path.split('/').slice(3).join('/');

  if (!encodedUrl) {
    return {
      statusCode: 302,
      headers: { Location: '/' }
    };
  }

  // 解码URL
  let targetUrl;
  try {
    targetUrl = decodeURIComponent(encodedUrl);
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'http://' + targetUrl;
    }
  } catch (e) {
    return {
      statusCode: 400,
      body: '无效的URL编码'
    };
  }

  // 代理请求
  try {
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`HTTP错误! 状态码: ${res.status}`);

    // 构建响应头
    const headers = {
      'content-type': res.headers.get('content-type') || 'application/octet-stream',
      'content-disposition': `attachment; filename="${targetUrl.split('/').pop()}"`
    };

    // 处理二进制数据
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
