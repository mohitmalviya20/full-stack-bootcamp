const User = require("../models/user")
const Order=require("../models/order")


exports.getUserById= (req,res,next,id)=>{
    User.findById(id).exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:"no user was found in DB"
            })
        }
        req.profile = user
        next()
    })
}

exports.getUser=(req,res)=>{
    //TODO get back here for password
    req.profile.salt= undefined;
    req.profile.encry_password=undefined
    req.profile.createdAt=undefined
    req.profile.updatedAt=undefined
    return res.json(req.profile)
}

exports.getAllUsers=(req,res)=>{
    User.find().exec((err,users)=>{
        if(err || !users){
            return res.status(400).json({
                error:"no users found"
            })
        }
        
        res.json(users)
    })
}

exports.updateUser=(req,res)=>{
    User.findByIdAndUpdate(
        {_id:req.profile._id},
        {$set:req.body},
        {new:true,useFindAndModify:false},
        (err,user)=>{
            if(err || !user){
                return res.status(400).json({
                    error:"you are not authorized to update this user"
                })
            }
            res.json(user)

        }
    )
}
exports.userPurchaseList=(req,res)=>{
    Order.find({
        user:req.profile._id
    }).populate("user","_id name")
    .exec((err,order)=>{
        if(err || !order){
            return res.status(400).json({
                error:"no order in this account"
            })
        }
        return res.json(order)
    })

}

exports.pushOrderInPurchaseList=(req,res,next)=>{
    let purchasess=[]
    req.body.order.product.forEach(product=>{
        purchasess.push({
            _id: product._id,
            name:product.name,
            desciption:product.desciption,
            category:product.category,
            quantity:product.quantity,
            amount:req.body.order.amount,
            transaction_id:req.body.order.transaction_id
        })
    })

    //store this in db
    User.findOneAndUpdate(
    { _id:req.profile._id},
    {$push:{purchases:purchasess}},
    {new:true},
    (err,purchases)=>{
        if(err){
            return res.status(400).json({
                error:"unable to save purchase list"
            })
        }
        next()
    }
    )
}