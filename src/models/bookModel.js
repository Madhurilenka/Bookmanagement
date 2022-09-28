const mongoose  = require('mongoose')
const moment= require("moment")

const BookSchema = new mongoose.Schema({ 
  
    title: {type:String, required:true, unique: true,trim:true},
    excerpt: {type:String, required:true}, 
    userId: {type:mongoose.Schema.Types.ObjectId, required:true, ref:"User",trim:true},
    ISBN: {type:String, required:true, unique: true,trim:true},
    category: {type:String, required:true,trim:true},
    subcategory:{type:String,required:true,trim:true},
    reviews: {type:Number, default: 0},
    deletedAt: {type:Date}, 
    isDeleted: {type:Boolean, default: false},
    releasedAt: {type:Date, required:true},
    
  }, { timestamps: true })

module.exports = mongoose.model("Book", BookSchema)

