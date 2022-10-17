var crypto = require('crypto');
const axios = require('axios');
const lib = require('./crypto');

// save username and password
var username = 'admin';
var password = '1234';

// Base url
const baseUrl = 'http://localhost:3000';

const validateUser = async (username, password) => {
    const res = await axios.post(`${baseUrl}/authenticate`, {
        username: username,
        password: password
    });
    
    if (res && res.data && !res.data.error) {
        return res.data.token;
    }

    throw new Error('Validating Error.');
}

const sendPublicKey = async (token, password) => {
    const [publicKey, privateKey] = await lib.generateKeyPair(password);
    const res = await axios.post(`${baseUrl}/publickey`, {
        publicKey: publicKey,
        token: token
    });

    if (res && res.data && !res.data.error) {
        return {
            privateKey,
            token
        };
    }

    throw new Error('Public Key is not saved.');
}

const sendMessage = async (token, privateKey) => {
    const actualdata = {
        username: username,
        message: 'This is the message.' 
    }

    let encmsg = crypto.privateEncrypt({
        key: privateKey,
        passphrase: password
    }, Buffer.from(JSON.stringify(actualdata), 'utf8')).toString('base64');

    const res = await axios.post(`${baseUrl}/message`, {
        encmsg: encmsg,
        token: token
    })

    if (res && res.data && !res.data.error) {
        console.log('message', res.data.message);
        return;
    }

    throw new Error('Message is not sent.');
}

validateUser(username, password)
.then((token) => sendPublicKey(token, password))
.then((data) => sendMessage(data.token, data.privateKey))
.then((data) => console.log('done'))
.catch(err => {
    console.log('Error on Client Side. error:', err);
})
