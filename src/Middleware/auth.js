const jwt = require("jsonwebtoken");
const bookModel = require("../models/bookModel");
const mongoose = require('mongoose')


const authentication = function (req, res, next) {
   try {
      let token = req.headers["x-api-key"]
      if (!token) {
         return res.status(403).send({ status: false, msg: "token must be present" })
      }
      jwt.verify(token, "functionupiswaywaycoolproject3group9", function (error, decoded) {
         if (error) return res.status(400).send("this token is invslid")
         else {
            decodedtoken = decoded
            next()
         }
      })

   } catch (error) {
      return res.status(500).send({ status: false, msg: error.mssage })
   }

}





const authorisation = async (req,res,next)=>{
   try {
const idFromToken =decodedtoken.id
let bookId = req.params.bookId
if(bookId){
   if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).send({ status: false, msg: "Please Enter Valid book Id " })
  }
let bookdata = await bookModel.findById(bookId)
if(!bookdata)return res.status(404).send({status:false,msg:"no book  found"})
let updateuser = bookdata.userId.toString()
if(idFromToken !==updateuser){
   return res.status(403).send({ status: false, msg: "Unauthorized Access!!!...you are not authorised" });
        }else{
            next()
        }
}
      } catch (err) {
         return res.status(500).send({ status: false, error: err.message });
     }
}



module.exports.authentication = authentication

module.exports.authorisation = authorisation


