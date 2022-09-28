const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken');


//==============================createUser=====================================//
/*let isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0&&value === null) return false
    if(typeof value ==="number" && value.toString().trim.length===0) return false
    return true
}*/


const createUser = async (req, res) => {
    try {
        let { title, name, phone, email, password } = req.body

        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, msg: "for registration user data is required" })
        }

        if (!(title)) {
            return res.status(400).send({ status: false, msg: "title is required for registration" })
        }
       /* if (!(/^w+{3}$/).test(title)) {
            return res.status(400).send({ status: false, msg: "Please Enter valid title Number" })
        }*/


        if (!["Mr", "Mrs", "Miss"].includes(title)) {
            return res.status(400).send({ status: false, msg: "Title must be ['Mr','Mrs','Miss']" })
        }

        if (!name) {
            return res.status(400).send({ status: false, msg: "Enter your  Name" });
        }
          
         if (!(/^[a-zA-Z]{2,}(?: [a-zA-Z]+){0,2}$/).test(name)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid Name" })
        }

        if (!phone) {
            return res.status(400).send({ status: false, msg: "Enter your phone Number. Its mandatory" })
        }
        if (!(/^[\s]*[6-9]\d{9}[\s]*$/).test(phone)) {
            return res.status(400).send({ status: false, msg: "Please Enter valid phone Number" })
        }


        let existphone = await userModel.findOne({ phone: phone })
        if (existphone) { return res.status(400).send({ status: false, msg: "User with this phone number is already registered." }) }


        if (!email) {
            return res.status(400).send({ status: false, msg: "Enter your email .Its mandatory for registration!!!" })
        }
            if (!(/^[a-z0-9_]{1,}@[a-z]{3,10}[.]{1}[a-z]{3}$/).test(email)) {
            return res.status(400).send({ status: false, msg: "Please Enter valid Email" })
        }
        
        let existEmail = await userModel.findOne({ email: email })
        if (existEmail) {

            return res.status(400).send({ status: false, msg: "User with this email is already registered" })
        }
        if (!password) {
            return res.status(400).send({ status: false, msg: "Please enter Password for registartion" })
        }

        if (!(/^[\s]*[0-9a-zA-Z@#$%^&*]{8,15}[\s]*$/).test(password)) {                                            

            return res.status(400).send({ status: false, msg: "please Enter valid Password and it's length should be 8-15" })
        }

        let savedData = await userModel.create(req.body);
        return res.status(201).send({ status: true, message: 'Success', data: savedData });


    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

//==========================================UserLOgin========================//

const login = async (req, res) => {
    try {

        let requestQuery = req.query
        let requestBody = req.body

        if (Object.keys(requestQuery).length > 0) {
            res.status(400).send({ status: false, msg: "invalid entry!! No Data required in Query Param" })
        }

        if (Object.keys(requestBody).length == 0) {
            res.status(400).send({ status: false, msg: "Please enter Email and Password to login" })
        }

        if (Object.keys(requestBody).length > 2) {
            res.status(400).send({ status: false, msg: "invalid request.Only email & password is required for logging In" })
        }

        const { email, password } = req.body
        if (!email) {
            return res.status(400).send({ status: false, msg: "Email is mandatory for logging In" })
        }

        if (!password) {
            return res.status(400).send({ status: false, msg: "Please enter password. It is Mandatory" })
        }
        let data = await userModel.findOne({ email: email, password: password })

        if (!data) {
            return res.status(400).send({ status: false, msg: "Email or Password is incorrect.Please recheck it" })
        }

        let token = await jwt.sign({ id: data._id.toString() }, "functionupiswaywaycoolproject3group9", { expiresIn: '24hr' })
        res.header({ "x-api-key": token })
        res.status(200).send({ status: true, message: "Login Successful", data: token })
    }
    catch (err) {
        res.status(500).send({ error: err.message });
    }


}
module.exports.login = login
module.exports.createUser = createUser











