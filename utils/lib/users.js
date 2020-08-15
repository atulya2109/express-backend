const {body,validationResult} = require('express-validator');
const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const crypto = require('crypto');
const getHash = require('./encryption').getHash;
const validators = {

    createUser: [
        
        body('user[email]','is not valid').exists().trim().escape().normalizeEmail().isEmail(),
        body('user[email]','is already in use').custom(async (email) =>  {
            
            const uuid = crypto.createHash('sha256').update(email).digest('hex');
            return Users.findOne({uuid:uuid}).then(user => {
                console.log(user)
                if(user){
                    return Promise.reject('Email already in use');
                }
            });  
        }),
        body('user[password]','in not a valid password').exists().escape().isLength({min: 6}),
        body('user[password]','does not match').custom((password, {req}) => {

            if(req.body.user.checkPassword !== password)
                return false;
            else
                return true;

        }),
        body('user[name]','should not be empty').exists().not().isEmpty().trim(),
    ],

    loginUser: [

        body('user[email]').exists().trim().escape().normalizeEmail().isEmail().custom((email,{req}) =>  {
            
            const uuid = crypto.createHash('sha256').update(email).digest('hex');
            return Users.findOne({uuid:uuid}).then((user) => {
                
                if(!user || !user.validatePassword(req.body.user.password)){
                    return Promise.reject('Email or password invalid');
                }
                else{
                    req.loginUser = user;
                }
            });  
        }),
        

    ],
}

module.exports = {

    validate : (method) => {

        switch(method){

            case 'createUser': {

                return validators.createUser;

            }

            case 'loginUser':{

                return validators.loginUser;
            }

        }
    },

    createUser: function(req,res,next) {
        
        // console.log(req.user);

        try{
            const errors = validationResult(req);
            // console.log(errors);
            if(!errors.isEmpty()){

                return res.status(422).json({errors:errors.array()});

            }
            
            const {email,password, name} = req.body.user;

            const uuid = getHash(email);

            var user = new Users({name:name,email:email,hash:password,uuid:uuid,role:'user'});
            
            user.save((err,user) => {

                if(err)
                    throw err;

            });

            res.json({name: user.name, email:user.email,});
        }
        catch(err){
            return next(err);
        }
    },

    loginUser: async function(req,res,next) {
        
        // console.log(req.user);

        try{
            const errors = validationResult(req);
            // console.log(errors);
            if(!errors.isEmpty()){

                return res.status(422).json({errors:errors.array()});

            }

            const loginUser = req.loginUser;

            // console.log(loginUser);

            res.status(200).json({
                user: {
                    email: loginUser.email,
                    jwt: loginUser.generateAuthToken()
                }
            });
        }
        catch(err){
            // return next(err);
            res.status(500).json({message: "An Error Occured"});
        }
    }
}