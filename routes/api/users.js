const router = require('express').Router();
const mongoose = require('mongoose');
const checkAuth = require('../middlewares/check-auth');

// const passport = require('passport');

// const Users = mongoose.model('Users');

const userUtils = require('../../utils').Users;

router.post('/login',userUtils.validate('loginUser'),userUtils.loginUser);

router.post('/register',userUtils.validate('createUser'),userUtils.createUser);

router.get('/details',checkAuth,(req,res) => {

    const user = req.user;
    res.status(200).json({name:user.name});

})
module.exports = router;