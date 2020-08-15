const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const getHash = require('../../utils').Encryption.getHash;
require('dotenv').config();

const {SECRET} = process.env;

module.exports = async (req,res,next) => {

    const token = req.headers.authorization.split(" ")[1];

    try{
        const decoded = jwt.verify(token,SECRET);
        const user = await Users.findOne({uuid:getHash(decoded.email)});
        req.user = user;
        next();
    }
    catch(err){
        console.log(err);
        res.status(401).json({message: "Auth Failed"});
    }

}