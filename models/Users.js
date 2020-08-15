const mongoose = require('mongoose');
const crypto = require('crypto');
const {Schema} = mongoose;
const jwt = require('jsonwebtoken');
const Encryption = require('../utils/lib/encryption');

require('dotenv').config();

const {SECRET} = process.env;

const UserSchema = new Schema({
    
    email: {
        type: String,
        unique: true,
        index: true,
        required: [true,'cannot be empty'],
        lowercase: true,
        get: Encryption.decrypt,
        set: Encryption.encrypt,
    },
    hash: String,
    salt: String,
    name: {
        type: String,
        required: ['true','cannot be empty'],
        get: Encryption.decrypt,
        set: Encryption.encrypt,
    },
    uuid: String,
    role: {
        type: String,
        get: Encryption.decrypt,
        set: Encryption.encrypt,
    },
});

UserSchema.methods.setPassword = function(password)  {

    // console.log(this.email);
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password,this.salt,10000,512,'sha512').toString('hex');
    // console.log(this.hash);
};

UserSchema.methods.validatePassword = function(password) {

    // console.log(this);
    const hash = crypto.pbkdf2Sync(password,this.salt,10000,512,'sha512').toString('hex');
    return hash === this.hash
};

UserSchema.methods.generateJWT = function(){

    const today = new Date();
    const expiration_date = new Date(today);
    expiration_date.setTime(today.getTime() + 24*60*60*1000);

    return jwt.sign({
        email: this.email,
        id: this._id,
        exp: parseInt(expiration_date.getTime()/1000,10)
    },SECRET);

};

UserSchema.methods.generateAuthToken = function() {
    
    return{
        email: this.email,
        id: this._id,
        token: this.generateJWT()
    };
};

UserSchema.pre('save',function(next)  {

    var user = this;

    try{
        if(!user.isModified('hash'))
        return next();

        user.setPassword(user.hash);
        // console.log(user.hash);
        next()
    }
    catch(err){
        console.log(err);
        return next(err);
    }
        
});

UserSchema.set('toObject', { getters: true });
mongoose.model('Users', UserSchema);