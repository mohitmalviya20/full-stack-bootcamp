const Product = require("../models/product")
const formidable= require("formidable")
const _ = require("lodash")
const fs = require("fs")
const { sortBy } = require("lodash")
exports.getProductbyId=(req,res,next,id)=>{
    Product.findById(id)
    .populate("category")
    .exec((err,product)=>{
        if(err || !product){
            return res.status(400).json({
                err:"product not found"
            })
        }
        req.product=product
        next();
    })

}

exports.createProduct=(req,res)=>{
    let form = new formidable.IncomingForm()
    form.keepExtensions = true

    form.parse(req,(err,fields,file)=>{
        if(err){
            return res.status(400).json({
                error:"problem with image"
            })
        }
        //destructuring the fields for restriction
        const {name,description,stock,price,category}=fields
        if(
            !name||
            !description||
            !price||
            !category||
            !stock
        ){
            return res.status(400).json({
                error:"please include all fileds"
            })
        }

        let product = new Product(fields)

        //handling file here
        if(file.photo){
            if(file.photo.size>2097152){
                return res.status(400).json({
                    error:"max file size reached"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType=file.photo.type
        }
        //save the photo to db
        product.save((err,product)=>{
            if(err){
                return res.status(400).json({
                    error:"file saving failed"
                })
            }
            res.json(product)
        })
    })
}

exports.getProduct=(req,res)=>{
    req.product.photo = undefined
    return res.json(req.product)
}
//middleware
exports.photo=(req,res,next)=>{
    if(req.product.photo.data){
        res.set("Content-Type",req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next()
}
exports.deleteProduct=(req,res)=>{
    let product = req.product
    product.remove((err,product)=>{
        if(err){
            return res.status(400).json({
                error:"failed to delete the product"
            })
        }
        res.json({
            message:"Deletion was succcessful"
        })
    })

}

exports.updateProduct=(req,res)=>{
    let form = new formidable.IncomingForm()
    form.keepExtensions = true

    form.parse(req,(err,fields,file)=>{
        if(err){
            return res.status(400).json({
                error:"problem with image"
            })
        }
        
        //updation of the file
        let product = req.product
        product=_.extend(product, fields)//overwriting current fields with new fields
        

        //handling file here
        if(file.photo){
            if(file.photo.size>2097152){
                return res.status(400).json({
                    error:"max file size reached"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType=file.photo.type
        }
        //save the photo to db
        product.save((err,product)=>{
            if(err){
                return res.status(400).json({
                    error:"file updation failed"
                })
            }
            res.json(product)
        })
    })

}

exports.getAllProducts=(req,res)=>{
    let limit = req.query.limit?parseInt(req.query.limit):9 
    let sortBy = req.query.sortBy?req.query.sortBy:"_id"
    Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err,products)=>{
        if(err){
            return res.status(400).json({
                error:"no products found"
            })
        }
        res.json(products)
    })
}



exports.getAllUniqueCategories=(req,res)=>{
    Product.distinct("category",{},(err,category)=>{
        if(err){
            return res.status(400).json({
                error:"no category found"
            })
        }
        res.json(category)
    })
}



exports.updateStock=(req,res,next)=>{
    let myOperations = req.body.order.products.map(prod=>{
        return {
            updateOne:{
                filter:{ _id:prod._id},
                update:{$inc:{stock: -prod.count,sold: +prod.count}}
            }
        }
    })

    Product.bulkWrite(myOperations,{},(err,products)=>{
        if(err){
            return res.status(400).json({
                error:"bulk operation failed"
            })
        }
        res.json(product)
        next()
    })
}

