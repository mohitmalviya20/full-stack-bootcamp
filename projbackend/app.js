require("dotenv").config()
const mongoose = require("mongoose")
const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")
const cors = require("cors")
var bodyParser = require('body-parser');
const paymentBRoutes = require("./routes/payment")


//my routes
const authRoutes = require("./routes/auth")
const userRoutes=require("./routes/user")
const categoryRoutes = require("./routes/category")
const productRoutes = require("./routes/product")
const orderRoutes = require("./routes/payment")


//db connections
mongoose.connect(process.env.DATABASE, 
{useNewUrlParser: true,useUnifiedTopology:true,useCreateIndex:true}).then(()=>{
    console.log("DB CONNECTED")
}).catch(()=>(
    "DB CRASHED"
))


// middlewares
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser())
app.use(cors())


//my Routes
app.use("/api",authRoutes)
app.use("/api",userRoutes)
app.use("/api",categoryRoutes)
app.use("/api",productRoutes)
app.use("/api",orderRoutes)
app.use("/api",paymentBRoutes)

app.get("/",(req,res)=>{
    return res.send("hello worldsss")
})



const port = 5000

app.listen(port,()=>{
    console.log(`App is running at ${port}`)
})