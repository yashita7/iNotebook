const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const JWT_SECRET = 'Harryisagood$boy';

//Create a user using  : POST "/api/auth". Doesn't require Auth.  No Login required
router.post('/createuser',[
    body('name','Enter a valid name : ').isLength({min : 3}),
    body('email','Enter a valid email : ').isEmail(),
    body('password','Password must have atleast 5 characters.').isLength({min : 5})
], async(req,res) =>{
    // If there are errors, return bad request and the errors.
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }
    //Check whether the user with the same email already exists

    try{

    let user = await User.findOne({email : req.body.email});
    // console.log(user);
    if(user){
        return res.status(400).json({error : "Sorry a user with the email already exists"});
    }
    
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password,salt)
    //Create a new User
    user = await User.create({
        name : req.body.name,
        email : req.body.email,
        password : secPass
    });
    const data = {
        user : {
            id : user.id
        }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    console.log(authtoken);

    // res.json(user)
    res.json({authtoken});
    //Catch error
} catch(error){
    console.error(error.message);
    res.status(500).send("Some error occured");
}
})

module.exports = router