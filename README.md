# ID Verification Demo
This repository contains the code for the demo.
The writeup can be found on my [notes site](https://notes.ruzgara.com/Personal-Projects/Digital-ID/Digital-ID-System)

To run, install dependencies with `npm install`

Then run `node issuer.js` to start the issuer

In another terminal, run `node verifier.js` to start the verifier

Then run `node wallet.js` to start the wallet.

By default, they will be running on port 3001, 3002, and 3003 respectively

This demo uses `@mattrglobal/bbs-signatures` for the cryptographic operations, `express` for the web server, and `axios` for making HTTP requests.