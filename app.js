const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 静态文件服务
app.use(express.static('public'));

// 处理所有请求
app.get('*', async (req, res) => {
    let targetUrl = req.path.slice(1);
    targetUrl = decodeURIComponent(targetUrl);

    if (!targetUrl) {
        res.sendFile(__dirname + '/public/index.html');
        return;
    }

    if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'http://' + targetUrl;
    }

    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(targetUrl, { headers: req.headers });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        res.setHeader('Content-Disposition', 'attachment');
        response.body.pipe(res);
    } catch (error) {
        res.status(502).send(`Request to ${targetUrl} failed: ${error.message}`);
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
    
