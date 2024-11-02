const express=require("express");
const { route } = require("../app");
const router=express.Router();
const userController=require("../controllers/user/userController")


router.get("/pageNotFound",userController.pageNotFound)
router.get("/",userController.loadHomePage);







module.exports=router;