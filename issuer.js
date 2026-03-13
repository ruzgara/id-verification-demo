const express = require('express');
const { generateBls12381G2KeyPair, blsSign } = require('@mattrglobal/bbs-signatures');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let keyPair;
const toBytes = (str) => Uint8Array.from(Buffer.from(str, 'utf-8'));

(async () => {
    keyPair = await generateBls12381G2KeyPair();
    console.log('✅ Issuer Ready');
})();

app.get('/public-key', (req, res) => {
    res.json({ publicKey: Buffer.from(keyPair.publicKey).toString('base64') });
});

app.post('/issue', async (req, res) => {
    const messageBytes = req.body.attributes.map(toBytes);
    const signature = await blsSign({ keyPair, messages: messageBytes });
    res.json({
        signature: Buffer.from(signature).toString('base64'),
        attributes: req.body.attributes,
        publicKey: Buffer.from(keyPair.publicKey).toString('base64')
    });
});

app.get('/', (req, res) => {
    res.send(`
        <html>
            <body style="font-family: sans-serif; padding: 20px;">
                <h2>🏛️ Issuer Node</h2>
                <div id="inputs">
                    <input type="text" class="attr" value="Name: Alice">
                    <input type="text" class="attr" value="Citizenship: UK">
                    <input type="text" class="attr" value="Credit: 750">
                </div>
                <button onclick="addInput()">+ Add Attribute</button>
                <button onclick="issue()">Sign & Issue</button>
                <hr>
                <h3>Credential Package (Copy this to Wallet)</h3>
                <textarea id="output" style="width:100%; height:200px; font-family: monospace;"></textarea>
                <script>
                    function addInput() {
                        const div = document.createElement('div');
                        div.innerHTML = '<input type="text" class="attr" style="margin-top:5px">';
                        document.getElementById('inputs').appendChild(div);
                    }
                    async function issue() {
                        const attrs = Array.from(document.querySelectorAll('.attr')).map(i => i.value).filter(v => v);
                        const res = await fetch('/issue', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ attributes: attrs })
                        });
                        const data = await res.json();
                        document.getElementById('output').value = JSON.stringify(data, null, 2);
                    }
                </script>
            </body>
        </html>
    `);
});

app.listen(3001);