const mongoose=require('mongoose')
const {Schema} = mongoose;


const categorySchema = new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true,
    },
    isListed:{
        type:String,
        default:true,
    },
    categoryOffer:{
        type:Number,
        default:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})


const Category = mongoose.model("Category",categorySchema);

module.exports = Category;