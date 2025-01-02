const Brand = require('../../models/brandSchema');
const Product = require('../../models/productSchema');


const getBrandPage = async(req,res) =>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page-1)*limit;
        const brandData = await Brand.find({}).sort({createdAt:-1}).skip(skip).limit(limit);
        const totalBrands = await Brand.countDocuments();
        const totalPages = Math.ceil(totalBrands/limit);
        const reverseBrand = brandData.reverse()
        res.render('brands',{
            data:reverseBrand,
            currentPage:page,
            totalPages:totalPages,
            totalBrands:totalBrands,
        })
        
    } catch (error) {

        res.redirect('/pageerror')
        
    }
}



const addBrand = async(req,res) =>{
    try {
        
        console.log(req.body)
        const brand = req.body.name;
        const findBrand = await Brand.findOne({brand})
        if(!findBrand){
            const image = req.file.filename;
            const newBrand = new Brand({
                brandName:brand,
                brandImage:image,
                
            })
            console.log("brand:", brand);
            console.log("image:", image);
            await newBrand.save();
            console.log("Brand saved")
            
            res.redirect('/admin/brands')
        }
        
    } catch (error) {
        console.log(error)
        res.redirect('/pageerror')
        
    }
}



module.exports = {
    getBrandPage,
    addBrand,
    
}