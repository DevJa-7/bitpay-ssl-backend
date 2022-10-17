const express = require('express');
const app = express();
var crypto = require('crypto');
const jwt = require('jsonwebtoken');
const lib = require('./crypto');

const port = 3000;
var bodyParser = require('body-parser');

// create application/json parser
var jsonParser = bodyParser.json();

// store tokenKey 
var tokenKey = 'BITPAY_TOKEN_SECRET';

// store hashed password
var hashedPassword = lib.generatePassword('1234');

// store authorized token
var authorizedToken = null;

// store public key
var publicKey = null;

// check the authentication for the user.
app.post('/authenticate', jsonParser, (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (lib.validPassword(password, hashedPassword)) {
        authorizedToken = jwt.sign({userId: username}, tokenKey, {expiresIn: '24h'})
        console.log('User token generated!');
        res.status(200).json({
            error: false,
            token: authorizedToken
        });
    } else {
        console.log('User Token failed!');
        return res.status(401).json({
            error: true,
            message: 'Incorrect password!'
        });
    }
});

// verify token
const verifyToken = (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];
  
    if (!token) {
        return res.status(403).json({
            error: true,
            message: "A token is required for authentication"
        });
    }

    try {
        const decoded = jwt.verify(token, tokenKey);
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({
            error: true,
            message: "Invalid Token"
        });
    }

    return next();
};

// received the public key for authorized user.
app.post('/publickey', jsonParser, (req, res) => {
    verifyToken(req, res, () => {
        if (req.body.publicKey) {
            publicKey = req.body.publicKey;
            console.log('Public Key is saved!');
            res.status(200).json({
                error: false,
                message: 'Public key is saved!'
            })
        } else {
            console.log('Public Key not saved.');
            return res.status(401).json({
                error: true,
                message: 'No Public key'
            });
        }
    });
})

// received the message for authorized and signed user.
app.post('/message', jsonParser, (req, res) => {
    verifyToken(req, res, () => {
        const message = req.body.encmsg;
        if (publicKey && message) {
            const decresdata = crypto.publicDecrypt(publicKey,
                Buffer.from(message, 'base64')).toString();
            const parsedData = JSON.parse(decresdata);
            if (decresdata && parsedData) {
                console.log('Message Received: ', parsedData);
                return res.status(200).json({
                    error: false,
                    message: parsedData
                })
            }
        }

        console.log('Message not received');
        return res.status(401).json({
            error: true,
            message: 'No Message'
        }); 
    });
})

app.listen(port, () => {
    console.log(`BitPay Testing Backend listening at http://localhost:${port}`)
});
