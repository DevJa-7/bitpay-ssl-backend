var crypto = require('crypto');

 // Creating a unique salt for a particular user 
const salt = crypto.randomBytes(16).toString('hex');

exports.generatePassword = (password) => {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`); 
}

exports.validPassword = (password, hashed) => { 
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`); 
    return hashed === hash; 
};
