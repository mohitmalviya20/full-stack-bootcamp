const express =require('express')
const router = express.Router()
const {isSignedIn,isAdmin,isAuthenticated} = require('../controllers/auth')
const {getUserById}=require('../controllers/user')
const {getProductbyId,createProduct,getProduct,photo,deleteProduct,updateProduct,getAllProducts,getAllUniqueCategories}=require('../controllers/product')

// all of params
router.param("userId",getUserById)
router.param("productId",getProductbyId)

//all of create routers
router.post("/product/create/:userId",isSignedIn,isAdmin,isAuthenticated,createProduct)


//all of read routes
router.get("/product/:productId",getProduct)
router.get("/product/photo/:productId",photo)

//all of delete routes
router.delete("/product/:productId/:userId",isSignedIn,isAdmin,isAuthenticated,deleteProduct)

//all of update routes
router.put("/product/:productId/:userId",isSignedIn,isAdmin,isAuthenticated,updateProduct)


//listing routes
router.get("/products",getAllProducts)


router.get("/products/categories",getAllUniqueCategories)
module.exports = router