const crypto = require('crypto');
require('dotenv').config();
const KEY = process.env.DB_SECRET;

const algorithm = 'aes-256-cbc';
const inputEncoding = 'utf8';
const outputEncoding = 'hex';

module.exports = {

    getHash: (text) => crypto.createHash('sha256').update(text).digest('hex'),

    encrypt: (text) => {

        /* 
        NOTE: createCipher has been deprecated
            var cipher = crypto.createCipher('aes-256-cbc',SECRET);
            var crypted = cipher.update(text,'utf8','hex');
            crypted += cipher.final('hex');
            return crypted
        */
       const iv = Buffer.from(crypto.randomBytes(16));
       const cipher = crypto.createCipheriv(algorithm, KEY, iv);
       let crypted = cipher.update(text, inputEncoding, outputEncoding);
       crypted += cipher.final(outputEncoding);
       return `${iv.toString('hex')}:${crypted.toString()}`;

    },

    decrypt: (text) => {

        if(text === null || text === undefined) return text;

        const textParts = text.split(':');

        //extract the IV from the first half of the value
        const IV = Buffer.from(textParts.shift(), outputEncoding);

        //extract the encrypted text without the IV
        const encryptedText = Buffer.from(textParts.join(':'), outputEncoding);

        //decipher the string
        const decipher = crypto.createDecipheriv(algorithm,KEY, IV);
        let decrypted = decipher.update(encryptedText,  outputEncoding, inputEncoding);
        decrypted += decipher.final(inputEncoding);
        return decrypted.toString();
    }
}