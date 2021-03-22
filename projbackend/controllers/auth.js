const User = require("../models/user")
const {validationResult}=require("express-validator")
const jwt=require("jsonwebtoken")
const expressJwt = require('express-jwt')


exports.signup = (req, res) => {
  //getting errors that was created on auth routes
    const errors= validationResult(req)
    if(!errors.isEmpty()){ //checking if the error is not empty
      return res.status(422).json({
          error:errors.array()[0].msg
      })
    }
    const user = new User(req.body)//getting data from the body in the request
    user.save((err, user) => {				
      if(err || !user){
      console.log(err)
        return res.status(400).json({
          err: "Not able to save user in DB" //sending error for signup
        })
      }
       res.json({ //sending data after signup
        name: user.name,
        email: user.email,
        id: user._id
      });
    });
  };

exports.signin=(req,res)=>{
  const {email,password}=req.body
  const errors= validationResult(req)
    if(!errors.isEmpty()){
      return res.status(422).json({
          error:errors.array()[0].msg
      })
    }
  User.findOne({email},(err,user)=>{ //finding the data that matches with the db
    if(err || !user){
      return res.status(400).json({
        error:"USER email does not exist"
      })
    }
    if(!user.authenticate(password)){ //checking the password with the corresponding user
      return res.status(401).json({
        error:"email and password did not match"
      })

    }
    const token = jwt.sign({_id:user._id},process.env.SECRET) //creating the token
    res.cookie("token",token,{expire: new Date()+9999}) //pushing the token into the cookie
    const {_id,name,email,role}=user
    return res.json({ //returning the data if everything goes right
      token,
      user:{
        _id,
        name,
        email,
        role
      }
    })
  })

}


exports.signout = (req,res)=>{
    res.clearCookie("token")
    res.json({
        message:"user signed out successfully"

    })

}

//protected routes
exports.isSignedIn = expressJwt({
  secret:process.env.SECRET,
  userProperty:"auth"

})



//custom middlewares

exports.isAuthenticated=(req,res,next)=>{
  var checker = req.profile && req.auth && req.profile._id==req.auth._id
  if(!checker){
    return res.status(403).json({
      error:"access denied"
    })
  }
  next()
}

exports.isAdmin=(req,res,next)=>{
  if(req.profile.role===0){
    return res.status(403).json({
      error:"you are not admin"
    })
  }
  next()
}