var crypto = require('crypto');

exports.generateKeyPair = (password) => {
	return new Promise((resolve, reject) => {
		crypto.generateKeyPair('rsa', {
			modulusLength: 4096,
			publicKeyEncoding: {
				type: 'pkcs1',
				format: 'pem'
			},
			privateKeyEncoding: {
				type: 'pkcs1',
				format: 'pem',
				cipher: 'aes-256-cbc',
				passphrase: password
			}
		}, (err, publicKey, privateKey) => {
            if (err) {
                reject(err);
            } else {
                resolve([publicKey, privateKey]);
            }
		});
	})
}