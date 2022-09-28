const bookModel = require('../models/bookModel');
const userModel = require('../models/userModel');
const mongoose = require('mongoose');
const reviewmodel = require("../models/reviewModel")

/*
const isvalid = function(value){
    if(typeof value =="string")
}*/
//==========================================createBook=========================================//
const createBook = async function (req, res) {
    try {
        const idFromToken =decodedtoken.id
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = req.body;
        if(!userId) return res.status(400).send({ status: false, msg: "give user id" })
           

        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, msg: "For registering a book there must be some data" })
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: `please enter a valid userID` })
        }
        if(idFromToken !==userId){
            return res.status(403).send({ status: false, msg: "Unauthorized Access you are not authorised" });
        }
        if (!title || typeof title !== "string" ||title.trim().length==0) {
            return res.status(400).send({ status: false, msg: "Title is mandatory and it should be in form of String" })
        }

        if (!(/^[a-zA-Z0-9.'\-_\s]*$/).test(title)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid title" })
        }

        if (!excerpt || typeof excerpt !== "string") {
            return res.status(400).send({ status: false, msg: "Excerpt is mandatory and must be in String" })
        }
        // if (!(/^[a-zA-Z0-9\s]{3,}*$/).test(excerpt)) {
            // return res.status(400).send({ status: false, msg: "Please enter a valid excerpt" })
        // }

        if (!userId) {
            return res.status(400).send({ status: false, msg: "UserId is mandatory for registering a book" })
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "Please Enter Valid userId" })
        }

        if (!ISBN) {
            return res.status(400).send({ status: false, msg: "ISBN is mandatory for registering a book" })
        }

        if (!(/^[0-9]{3}([\-])[0-9]{10}$/).test(ISBN)) 
            return res.status(400).send("ISBN must be of 13 digits in [123-1234567890] format");
        if (!category) {
            return res.status(400).send({ status: false, msg: "Category is mandatory for registering a book" });
        }

        if (!subcategory) {
            return res.status(400).send({ status: false, msg: "Subcategory is mandatory for registering a book" });
        }

        if (!releasedAt) {
            return res.status(400).send({ status: false, msg: "Released At must be present and should be in yyyy-mm-dd" });
        }
        if(!(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/).test(releasedAt))
              return res.status(400).send("releasedAt date format should be YYYY-MM-DD");


        let existtitle = await bookModel.findOne({ title: title })
        if (existtitle) {
            return res.status(400).send({ status: false, msg: "There's a book already been registered with this Title" })
        }


        let existISBN = await bookModel.findOne({ ISBN: ISBN })
        if (existISBN) {
            return res.status(400).send({ status: false, msg: "This ISBN has already been registered" })
        }

        let createdBook = await bookModel.create(req.body);
        return res.status(201).send({ status: true, msg: "success", data: createdBook });


    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

//=================================getByquery============================================//

const getBookByquery = async (req, res) => {
    try {
        const filter = { isDeleted: false }

        const queryParams = req.query
        {
            const { userId, category, subcategory } = queryParams
            if (userId) {
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    return res.status(400).send({ status: false, msg: `please enter a valid userID` })
                }
                filter["userId"] = userId
            }

            if (category) {
                filter['category'] = category
            }

            if (subcategory) {
                filter['subcategory'] = subcategory
            }
        }

        const books = await bookModel.find(filter).select({ title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 }).collation({ locale: "en" }).sort({ title: 1 })

        if (Object.keys(books).length == 0)
            return res.status(404).send({ status: false, msg: "No Such book found" })

        res.status(200).send({ status: true, message: 'Books list', data: books })

    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, Error: err.message })
    }
}



//==========================================getByuserId==================================================//

const getbooksbyid = async (req, res) => {
    try {
        let bookid1 = req.params.bookId
        if (!bookid1)
            return res.status(400).send({ status: false, msg: "please give book id" })
        if (!mongoose.Types.ObjectId.isValid(bookid1))
            return res.status(400).send({ status: false, msg: "please enter valid bookid" })

        let book = await bookModel.findById(bookid1)

        if (!book || book.isDeleted == true)
            return res.status(404).send({ status: false, message: "No Book Found" })

        const { title, _id, excerpt, userId, category, reviews, releasedAt } = book
        let reviewsdata = await reviewmodel.find({ bookId: bookid1 })
        let result = { title, _id, excerpt, userId, category, reviews, releasedAt, reviewsdata }

        return res.status(200).send({ status: true, message: "Book list", data: result })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }

}

//=========================================UPDATEBook========================================================//

const updateBook = async (req, res) => {
    try {
        let bookId = req.params.bookId
        const { title, excerpt, releasedAt, ISBN } = req.body

        if (Object.keys(req.body).length == 0)
            return res.status(400).send({ status: false, msg: "Please Enter Book Details For Updating" })

        if (!bookId) {
            return res.status(400).send({ status: false, msg: "bookid must be present" })
        }

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, msg: `this  Book Id is not a valid Id` })
        }
        let findbookId = await bookModel.findById(bookId)

        
        if (!findbookId) {
            return res.status(404).send({ status: false, msg: "no book found with this bookId" })
        }
        if(title){
            if(title.trim().length==0) return res.status(400).send({ status: false, msg: "Please enter a valid title" })
            if (!(/^[a-zA-Z0-9.'\-_\s]*$/).test(title)) {
                return res.status(400).send({ status: false, msg: "Please enter a valid title" })
            }
        }
        if(ISBN){
            if(ISBN.trim().length==0) return res.status(400).send({ status: false, msg: "Please enter a valid ISBN" })
            if (!(/^[0-9]{3}([\-])[0-9]{10}$/).test(ISBN)) 
            return res.status(400).send("ISBN must be of 13 digits in [123-1234567890] format");
        }

        if(excerpt){
            if(excerpt.trim().length==0||typeof excerpt !=="string") return res.status(400).send({ status: false, msg: "Please enter a valid excerpt" })  
        }
        if(releasedAt){
            if(!(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/).test(releasedAt)||releasedAt.trim().length==0||typeof releasedAt=="Date")
              return res.status(400).send("releasedAt date format should be YYYY-MM-DD");
        }
        if (findbookId.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "Book is already deleted" })
        }

        let existtitle = await bookModel.findOne({ title: title })
        if (existtitle) {
            return res.status(400).send({ status: false, msg: "This title  already exists" })
        }
        
        let existISBN = await bookModel.findOne({ ISBN: ISBN })
        if (existISBN) {
            return res.status(400).send({ status: false, msg: " this ISBN already exists" })
        }
    
        
        let updatedBook = await bookModel.findOneAndUpdate({ _id: bookId }, {
            $set: {
                title: title,
                excerpt: excerpt,
                releasedAt: releasedAt,
                ISBN: ISBN
            },
        }, { new: true })


        return res.status(200).send({ status: true, message: "Book list", data: updatedBook })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
};


//========================================================deleteBook===================================//
const DeletedBook = async function (req, res) {
    try {

        let bookId = req.params.bookId
        if (!mongoose.Types.ObjectId.isValid(bookId))
            return res.status(400).send({ status: false, msg: "please enter valid bookid" })
        const savedata = await bookModel.findById(bookId)
        if (savedata.isDeleted == true) {
            return res.status(404).send({ status: false, message: "book is already deleted" })
        }

        const deleteBook = await bookModel.findByIdAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: Date.now() } });
        return res.status(200).send({ status: true, message: "book has been deleted successfully" })


    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });

    }
}


module.exports = { createBook, getbooksbyid, getBookByquery, updateBook, DeletedBook }


