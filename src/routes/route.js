const express = require('express');
const router = express.Router();
const user=require('../controllers/userController')
const book=require('../controllers/bookController')
const review =require('../controllers/reviewController')
const auth = require("../Middleware/auth")
const aws= require("aws-sdk")

//.................test................................. */

router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})
//.............Api............................

router.post("/register",user.createUser)
router.post("/login",user.login)

//..................BookApi......................
router.post("/books",auth.authentication, book.createBook)

router.get("/books",auth.authentication,book.getBookByquery)

router.get("/books/:bookId",auth.authentication,book.getbooksbyid)

router.put("/books/:bookId",auth.authentication,auth.authorisation,book.updateBook)

router.delete("/books/:bookId",auth.authentication,auth.authorisation,book.DeletedBook)
//..................ReviewApi..........................
router.post("/books/:bookId/review",review.reviewBoook)

router.put("/books/:bookId/review/:reviewId",review.UpdateReview)

router.delete("/books/:bookId/review/:reviewId",review.DeleteReview)


aws.config.update({
  accessKeyId: "AKIAY3L35MCRZNIRGT6N",
  secretAccessKey: "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",
  region: "ap-south-1"
})

let uploadFile= async ( file) =>{
 return new Promise( function(resolve, reject) {
  // this function will upload file to aws and return the link
  let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

  var uploadParams= {
      ACL: "public-read",
      Bucket: "classroom-training-bucket",  //HERE
      Key: "09/" + file.originalname, //HERE 
      Body: file.buffer
  }


  s3.upload( uploadParams, function (err, data ){
      if(err) {
          return reject({"error": err})
      }
      console.log(data)
      console.log("file uploaded succesfully")
      return resolve(data.Location)
  })

  // let data= await s3.upload( uploadParams)
  // if( data) return data.Location
  // else return "there is an error"

 })
}

router.post("/write-file-aws", async function(req, res){

  try{
      let files= req.files
      if(files && files.length>0){
          //upload to s3 and get the uploaded link
          // res.send the link back to frontend/postman
          let uploadedFileURL= await uploadFile( files[0] )
          res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
      }
      else{
          res.status(400).send({ msg: "No file found" })
      }
      
  }
  catch(err){
      res.status(500).send({msg: err})
  }
  
})
  
router.all("/*", function (req, res) {
    res.status(400).send({ status: false, message: "Invalid path params" });
  });



module.exports = router;


