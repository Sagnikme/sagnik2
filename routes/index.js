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
//   
        profile_image: req.body.profile_image,
        username: req.body.username,
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone,
        bank_balance: req.body.bank_balance,
        
    

    
    }); 
    
    
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
            res.send("wrong");
        }else{
            res.render("yo",{users: foundUser});
           
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