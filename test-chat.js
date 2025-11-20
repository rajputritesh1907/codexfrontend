import https from 'https';

const data = JSON.stringify({
    message: 'hello'
});

const options = {
    hostname: 'codexbackend-by89.onrender.com',
    port: 443,
    path: '/chatbot/gemini',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    let body = '';
    res.on('data', (d) => {
        body += d;
    });

    res.on('end', () => {
        console.log('Response body:', body);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
