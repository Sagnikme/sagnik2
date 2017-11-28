var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'iknott', 
  api_key: '668162744554695', 
  api_secret: 'VBveDyPOHUPQ84cmWPP5CDBgjVc'
});

//root route
router.get("/", function(req, res){
    
    res.render("landing");
});

// show register form

router.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
router.post("/register", upload.single('image'),function(req, res){
    
    var newUser = new User({
//         req.body.campground.image =result.secure_url ;
//   // add cloudinary url for the image to the campground object under image property   
//   
        profile_image: req.body.profile_image,
        username: req.body.username,
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        bank_balance: req.body.bank_balance,
        
    
//     //cloudinary.uploader.upload(req.file.path, function(result) {
//   // add cloudinary url for the image to the campground object under image property
//   req.body.campground.image = result.secure_url;
//   // add author to campground
//   req.body.campground.author = {
//     id: req.user._id,
//     username: req.user.username
  //}
    
    //   newUser = {username: username, bank_balance:bank_balance,profile_image: profile_image};
       
    // // Create a new campground and save to DB
    
    
    }); 
    //  newUser.create(newUser, function(err, newlyCreated){
    //     if(err){
    //         console.log(err);
    //     } else {
    //         //redirect back to campgrounds page
    //         console.log(newlyCreated);
    //         // res.redirect("/campgrounds");
    //     }
    // });
    
    
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
          req.flash("success", "Welcome to Knottpay " + user.username);
          res.redirect("/campgrounds"); 
        });
    });
});

//show login form
router.get("/login", function(req, res){
   res.render("login"); 
   req.flash("success", "Logged you out!");
});

//edit form 
router.get("/:id/edit", function(req, res) {
    User.findById(req.params.id, function(err, foundUser) {
        if(err){
            res.redirect("/campgrounds")
        }else{
            res.render("success", {User: foundUser});
        }
    });
    
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
        req.flash("success", "Logged you in!");
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
   res.render("landing");
});

router.get("/users/:id", function(req, res) {
   User.findById(req.params.id,function(err,foundUser){
       if(err){
           res.redirect("/");
       }else{
           res.render("index",{user: foundUser});
       }
   });
});




module.exports = router;