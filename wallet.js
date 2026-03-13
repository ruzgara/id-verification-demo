const express = require('express');
const { blsCreateProof } = require('@mattrglobal/bbs-signatures');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const toBytes = (str) => Uint8Array.from(Buffer.from(str, 'utf-8'));

app.post('/prove', async (req, res) => {
    const { credential, revealIndex } = req.body;
    const { signature, attributes, publicKey } = credential;

    const nonce = "challenge-" + Date.now();
    const proof = await blsCreateProof({
        signature: new Uint8Array(Buffer.from(signature, 'base64')),
        publicKey: new Uint8Array(Buffer.from(publicKey, 'base64')),
        messages: attributes.map(toBytes),
        nonce: toBytes(nonce),
        revealed: [parseInt(revealIndex)],
    });

    const presentation = {
        proof: Buffer.from(proof).toString('base64'),
        revealedMessages: [attributes[revealIndex]],
        nonce
    };

    const verifyRes = await axios.post('http://localhost:3002/verify', presentation);
    res.json(verifyRes.data);
});

app.get('/', (req, res) => {
    res.send(`
        <html>
            <body style="font-family: sans-serif; padding: 20px;">
                <h2>📱 Wallet Node</h2>
                <h3>Paste Credential Package</h3>
                <textarea id="package" style="width:100%; height:150px;"></textarea>
                <p>Reveal Attribute Index: <input type="number" id="index" value="1"></p>
                <button onclick="sendProof()">Generate ZKP & Send to Verifier</button>
                <p id="status"></p>
                <script>
                    async function sendProof() {
                        const pkg = JSON.parse(document.getElementById('package').value);
                        const idx = document.getElementById('index').value;
                        const res = await fetch('/prove', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ credential: pkg, revealIndex: idx })
                        });
                        const data = await res.json();
                        document.getElementById('status').innerText = "Status: " + JSON.stringify(data);
                    }
                </script>
            </body>
        </html>
    `);
});

app.listen(3003);