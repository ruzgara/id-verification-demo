const express = require('express');
const { blsVerifyProof } = require('@mattrglobal/bbs-signatures');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let history = [];
let cachedPk = null;
const toBytes = (str) => Uint8Array.from(Buffer.from(str, 'utf-8'));

app.post('/verify', async (req, res) => {
    if (!cachedPk) {
        const resp = await axios.get('http://localhost:3001/public-key');
        cachedPk = new Uint8Array(Buffer.from(resp.data.publicKey, 'base64'));
    }

    const { proof, revealedMessages, nonce } = req.body;
    const isValid = await blsVerifyProof({
        proof: new Uint8Array(Buffer.from(proof, 'base64')),
        publicKey: cachedPk,
        messages: revealedMessages.map(toBytes),
        nonce: toBytes(nonce),
    });

    if (isValid) {
        history.push({ time: new Date().toLocaleTimeString(), data: revealedMessages });
        res.json({ status: "Verified" });
    } else {
        res.status(400).json({ status: "Failed" });
    }
});

app.get('/', (req, res) => {
    const list = history.map(h => `<li>[${h.time}] Revealed: <b>${h.data.join(', ')}</b></li>`).join('');
    res.send(`
        <html>
            <body style="font-family: sans-serif; padding: 20px;">
                <h2>🔍 Verifier Node</h2>
                <h3>Received Verifications</h3>
                <ul id="log">${list}</ul>
                <button onclick="location.reload()">Refresh Log</button>
            </body>
        </html>
    `);
});

app.listen(3002);