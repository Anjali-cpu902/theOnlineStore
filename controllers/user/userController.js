const User = require('../../models/userSchema');
const env = require("dotenv").config()
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")


const pageNotFound=async(req,res)=>{
    try {

        res.render("page-404")
        
    } catch (error) {

        res.redirect("/pageNotFound")
        
    }
}

const loadHomePage=async (req,res)=>{
    try {
        const user = req.session.user;
        
        if(user){
            const userData = await User.findOne({_id:user._id})
            res.render("home",{user:userData})
        }else{
            return res.render("home")
        }

        
        
    } catch (error) {

        console.log("home page not found");
        res.status(500).send("Server error");
        
    }
}


const loadSignup = async(req,res) =>{
    try {
        return res.render('signup');
    } catch (error) {
        console.log("Home page not loading",error);
        res.status(500).send('Server error')
    }
}


function generateOtp(){
    return Math.floor(100000 + Math.random()*900000).toString();
}



async function sendVerificationEmail(email,otp){
    try {

        const transporter = nodemailer.createTransport({

            service: 'gmail',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })


        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            to: email,
            subject:"Verify your account",
            text:`your otp is ${otp}`,
            html:`<b>Your otp: ${otp}</b>`
        })


        return info.accepted.length>0
        
    } catch (error) {

        console.error("Error sending email",error);
        return false;
        
    }
}




const signup = async(req,res)=>{
    const {name,email,phone,password} = req.body;
    try {

        const {name,phone,email, password, cPassword}=req.body;
        if(password != cPassword){
            return res.render("signup",{message:"Passwords do not match"})
        }

        const findUser = await User.findOne({email})
        if(findUser){
            return res.render("signup",{message:"The user with this email id already exists"})
        }

        const otp = generateOtp();

        const emailSent = await sendVerificationEmail(email,otp)
        if(!emailSent){
            return res.json("email-error")
        }

        req.session.userOtp=otp;
        req.session.userData={name,phone,email,password}


        res.render("verify-otp")
        console.log("OTP send",otp)
        
        
    } catch (error) {


        console.error("signup error",error)
        res.redirect("/pageNotFound")
       
        
    }
}



const verifyOtp=async (req,res)=>{
    try {

        const {otp}=req.body;

        console.log(otp);

        if(otp===req.session.userOtp){
            const user= req.session.userData;
            const passwordHash = await bcrypt.hash(user.password,10)

            const saveUserData = new User({
                name:user.name,
                email:user.email,
                phone:user.phone,
                password:passwordHash
            })

            await saveUserData.save()
            req.session.user = saveUserData._id
            res.json({success:true,redirectUrl:"/"})
        }else{
            res.status(400).json({success:false,message:"Invalid otp,Please try again"})
        }
        
    } catch (error) {

        console.log("Error verifying OTP",error)
        res.status(500).json({success:false,message:"An error occurred"})
        
    }
}



const resendOtp = async (req,res) =>{
    try {

        const {email} = req.session.userData;
        if(!email){
            return res.status(400).json({success:false,message:"Email not found in session"})
        }

        const otp = generateOtp();
        req.session.userOtp = otp;

        const emailSent = await sendVerificationEmail(email,otp)
        if(emailSent){
            console.log("resend otp:",otp);
            res.status(200).json({success:true,message:"OTP resend successfully"})
        }else{
            res.status(500).json({success:false,message:"Failed to send otp, try again."})
        }
        
    } catch (error) {

        console.error("Error sending OTP",error);
        res.status(500).json({success:false,message:"Internal server error. Please try again."})
        
    }
}


const loadLogin = async(req,res)=>{
    try {

        if(!req.session.user){
            return res.render("login")
        } else{
            res.redirect("/")
        }
        
    } catch (error) {

        res.redirect('/pageNotFound')
        
    }
}

const login = async(req,res)=>{
    try {

        const {email,password} = req.body;
        console.log("Email:", email);
        console.log("Password:", password);


        const findUser = await User.findOne({isAdmin:0,email:email})
        


        if(!findUser){
            return res.render('login',{message:"User not found"})
        }
        if(findUser.isBlocked){
            return res.render('login',{message:"User is blocked by admin"})
        }

        const passwordMatch = await bcrypt.compare(password,findUser.password)

        if(!passwordMatch){
            return res.render('login',{message:"Incorrect password"})
        }

        req.session.user = findUser; 
        res.locals.user = findUser;
        console.log("res.locals.name:" ,res.locals.name)
        console.log("Session after login:", req.session.user); 
        res.redirect("/")
        
    } catch (error) {

        console.error("login error",error);
        res.render("login",{message:"login failed.Please try again later"})
        
    }
}

const logout = async(req,res) => {
    try {

        req.session.destroy((err)=>{
            if(err){
                console.log("Session destruction error",err.message)
                return res.redirect("/pageNotFound")
            }
            return res.redirect("/login")
        })
        
    } catch (error) {

        console.log("Logout error",error);
        res.redirect('/pageNotFound')
        
    }
}



module.exports={
    loadHomePage,
    pageNotFound,
    loadSignup,
    signup,
    verifyOtp,
    resendOtp,
    loadLogin,
    login,
    logout
}