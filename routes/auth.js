const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'Harryisagood$boy';

// ROUTE 1 : Create a user using  : POST "/api/auth". Doesn't require Auth.  No Login required
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
    res.status(500).send("Internal Server Error");
}
})


// ROUND 2 : Authenticate a user using : POST "/api/auth/Login". No Login required
router.post('/login',[
    body('email', 'Enter a valid email : ').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async(req,res) => {
    // If there are errors return bad request and the errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }

    const {email,password} = req.body;
    try{    
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error : "Please try to login with correct credentials"});
        }

        const passwordCompare = await bcrypt.compare(password,user.password);
        //compare fn takes two inputs, first the password string and the second the hashed password
        if(!passwordCompare){
            return res.status(400).json({error : "Please try to login with correct credentials"});
        }
        
        const payload = {
            user : {
                id : user.id
            }
        }
        const authtoken = jwt.sign(payload, JWT_SECRET);
        res.json({authtoken});

    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error ");
    }
})


//ROUTE 3 : Get Loggedin user details using POST : "/api/auth/getuser". No Login required.

router.post('/getuser',fetchuser,async(req,res) => {
    try{
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        //this will select all fields except password
        res.send(user);
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


module.exports = router