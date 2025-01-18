const express=require("express");
const router=express.Router();
const passport = require("passport");
const userController=require("../controllers/user/userController");
const profileController = require('../controllers/user/profileController')


//Error management
router.get("/pageNotFound",userController.pageNotFound)


//Signup management
router.get("/signup",userController.loadSignup);
router.post("/signup",userController.signup);
router.post("/verify-otp",userController.verifyOtp);
router.post("/resend-otp",userController.resendOtp);
router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    req.session.user = req.user;
    res.redirect("/");
})

//Login management
router.get('/login',userController.loadLogin)
router.post('/login',userController.login)


//Home page and shopping page
router.get("/",userController.loadHomePage);
router.get('/logout',userController.logout)


//Profile management
router.get('/forgot-password',profileController.getForgotPassPage)
router.post('/forgot-email-valid',profileController.forgotEmailValid)
router.post('/verify-passForgot-otp',profileController.verifyForgotPassOtp)
router.get('/reset-password',profileController.getResetPassPage);
router.post('/resend-forgot-otp',profileController.resendOtp)
router.post('/reset-password',profileController.passNewPassword);






module.exports=router;