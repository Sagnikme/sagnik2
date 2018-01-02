var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds"),
    react       = require("react"),
    paypal      = require("paypal-rest-sdk")

//requiring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");
    
var router  = express.Router(); 
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//var url = 'http://knottpay-iknott.c9users.io/';
var url = "http://localhost:9229" ;       
//paypal details
paypal.configure({
  "mode": "sandbox", //sandbox or live
  "client_id": "AQcZGsKSgTKhfmod5UAXJauxxx-NVBCs9kyBgNOtI--DFHvfHFwBNizU0NKSzvqZtmCQD_e_mZ84mOTG",
  "client_secret": "EHt90a_H5mXyQ2kDX_qBjYJh7IxSfcrtft0G50FAMYVIuROn92Titz1T6YhQl-wQTI4P36QXBCPyORaK"
});
    
//mongoose.connect("mongodb://localhost/yelp_camp_v10");    
mongoose.connect("mongodb://Sagnik:12345@ds239217.mlab.com:39217/knottpay");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.post("/pay",(req,res) => {
    const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://knottpay-iknott.c9users.io/success",
        "cancel_url": "http://knottpay-iknott.c9users.io/success"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "payment",
                "sku": "001",
                "price": "10.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "10.00"
        },
        "description": "This is the payment description."
    }]
};
paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
  }
});

});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "10.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
       
        // req.users.credit += 50;
        // const user = req.User.save();
         res.render('success');
   
 


    }
});
});

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("PORT");
});
