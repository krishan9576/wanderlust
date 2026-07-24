 const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

require("dotenv").config();

 
 if(process.env.NODE_ENV !="production"){
    require('dotenv').config();
 }

const express=require("express");
const app=express();

const mongoose=require("mongoose");

// const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
// const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError =require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
// const {listingSchema,reviewSchema}= require("./schema.js");
// const Review=require("./models/review.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

//  const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

const dbUrl=process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

// const dbUrl = process.env.ATLASDB_URL;

//  console.log("DB URL:", process.env.ATLASDB_URL);

async function main() {
    await mongoose.connect(dbUrl, {
        serverSelectionTimeoutMS: 30000,
    });
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const store = MongoStore.create({
    
    mongoUrl:dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter:24*3600,//for lazy update

 });

 store.on("error",(err)=>{
    console.log("ERROR in MONGO SESSION STORE",err);
 });


const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized: true,
    cookie:{
        expires:Date.now()+1000*60*60*24*3,
        maxAge:1000*60*60*24*3,
        httpOnly:true
    },
 } ;

 
//  app.get("/",(req,res)=>{
//      res.redirect("/listings");
// });

 app.use(session(sessionOptions));
 app.use(flash());

 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new LocalStrategy(User.authenticate()));

 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

 app.use((req,res,next)=>{
   res.locals.success= req.flash("success");
   res.locals.error= req.flash("error");
   res.locals.currUser = req.user;
    next();
 });

//  app.get("/demoUser",async(req,res)=>{
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });
//    let registerUser = await User.register(fakeUser,"helloworld");
//    res.send(registerUser);
//  });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// INDEX ROUTE ESKA /LISTING/ID par send krne ke liye ink ka use yani href me likhna hoga  

// app.get("/testListing",async (req,res)=>{
//     let sampleListing  = new Listing({
//         title:"My new Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute Goa",
//         country:"India",
//     });

//    await sampleListing.save();
//    console.log("sample was saved");
//    res.send("successful testing");
// });

app.all("/{*splat}",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});


app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{message});
});


app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});
