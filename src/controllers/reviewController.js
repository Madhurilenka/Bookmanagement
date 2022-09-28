const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')




let isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0&&value === null) return false
    // if(typeof value ==="number" && value.toString().trim.length===0) return false
    return true
}



//===============================createReview===========================================//

const reviewBoook = async function (req, res) {
    try {
        let paramId = req.params.bookId

        if (!mongoose.Types.ObjectId.isValid(paramId))
            return res.status(400).send({ status: false, msg: "Please enter valid path Id" });

        let findBook = await bookModel.findById(paramId).select({ __v: 0, deletedAt: 0, })

        if (!findBook || findBook.isDeleted == true)
            return res.status(404).send({ status: false, msg: "Book does not exist" })

        if (Object.keys(req.body).length == 0)
            return res.status(400).send({ status: false, msg: "Please fill Details" })

        let { bookId, reviewedBy, reviewedAt, rating, review, isDeleted } = req.body

        if (!bookId)
            return res.status(400).send({ status: false, msg: "Please enter book Id" })
        
        if (!mongoose.Types.ObjectId.isValid(bookId))
            return res.status(400).send({ status: false, msg: "Please enter valid book Id" })
        
        if (bookId !== paramId)
            return res.status(400).send({ status: false, msg: "Plese enter book Id same as Path Id" })

        if ((reviewedBy)) {
            if (!(/^[a-zA-Z]*[\s]*[a-zA-Z]*\s?$/).test(reviewedBy)) {
                return res.status(400).send({ status: false, msg: "Plese enter valid reviewer name" })
            }
        }

        if (typeof review !== "string") return res.status(400).send({ status: false, msg: "Plese enter valid reviewer name" })
        
        if (!isValid(rating))
            return res.status(400).send({ status: false, msg: "Plese enter Rating" })

        if (!(/^[1-5]$/.test(rating)))
            return res.status(400).send({ status: false, msg: "Plese enter rating from 1 to 5 in integer form only" })

        if (!reviewedAt)
            return res.status(400).send({ status: false, msg: "Please enter reviewedAt" })

        let reviewCreated = await reviewModel.create(req.body)

        findBook.reviews = findBook.reviews + 1
        await findBook.save()
        let printReview = await reviewModel.findOne({ _id: reviewCreated }).select({ __v: 0, createdAt: 0, updatedAt: 0, isDeleted: 0 })
        findBook = findBook.toObject()

        findBook.reviewsData = printReview
        res.status(201).send({ status: true, message: "success", data: findBook })
    } catch (err) { res.status(500).send({ status: false, msg: err.message }) }
}

//===========================================updateReview=================================//

const UpdateReview = async (req, res) => {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (!reviewId) {
            return res.status(400).send({ status: false, msg: "reviewId must be present" })
        }
        if (!bookId) {
            return res.status(400).send({ status: false, msg: "bookId must be present" })
        }

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, msg: `this  Book Id is not a valid Id` })
        }
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).send({ status: false, msg: `this review Id is not a valid Id` })
        }
        let reviewID = await reviewModel.findById(reviewId)

        if (!reviewID) return res.status(404).send({ status: false, msg: "this  reviewId is invalid" })
            const { review, rating, reviewedBy } = req.body

        if(reviewID.bookId.toString() !==bookId){return res.status(404).send({ status: false, msg: "this  reviewId is not matched with bookid" })}
        if (Object.keys(req.body).length == 0)
            return res.status(400).send({ status: false, msg: "Please Enter some data to upadte a review" })

        if (review) {
            if (typeof review !== "string") { return res.status(400).send({ status: false, msg: "you can give only string" }) }
        }

        if ((rating)) {
            if (!(/^[1-5]$/.test(rating)))
                return res.status(400).send({ status: false, msg: "Plese enter rating from 1 to 5 in integer form only" })
        }

        if ((reviewedBy)) {
            if (!(/^[a-zA-Z0-9]*[\s]*[a-zA-Z0-9]*\s?$/).test(reviewedBy)) {
                return res.status(400).send({ status: false, msg: "Plese enter valid reviewer name" })
            }
        }

        let findbookId = await bookModel.findById(bookId)

        if (!findbookId || findbookId.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "Book is already deleted" })
        }

        const { title, _id, excerpt, userId, category, reviews, releasedAt } = findbookId
        
        let updatereview = await reviewModel.findOneAndUpdate({ _id: reviewId }, {
            $set: {
                review: review,
                rating: rating,
                reviewedBy: reviewedBy,
            },

        }, { new: true })


        let result = { title, _id, excerpt, userId, category, reviews, releasedAt, updatereview }



        return res.status(200).send({ status: true, message: " review updated", data: result })

    }

    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

//=========================================================deleteReview=======================================//
const DeleteReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (!bookId) {
            return res.status(400).send({ status: false, msg: "bookId is required to delete a Review " })
        }

        if (!reviewId) {
            return res.status(400).send({ status: false, msg: "reviewId is required to delete a Review" })
        }

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, msg: `this  BookId is not a valid Id` })
        }

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).send({ status: false, msg: `this  reviewId is not a valid Id` })
        }

        let book = await bookModel.findById(bookId)
        if (!book||book.isDeleted==true) {
            return res.status(404).send({ status: false, message: "book is not present" })
        }

        let review = await reviewModel.findById(reviewId)
        if(review.bookId.toString() !==bookId){return res.status(404).send({ status: false, msg: "this  reviewId is not matched with bookid" })}

        if (!review) return res.status(404).send("No review found with this reviewID")

        if (review.isDeleted == true) return res.status(400).send("This review has already been deleted.")

        let data = await reviewModel.findByIdAndUpdate({ _id: reviewId }, { $set: { isDeleted: true }})
        book.reviews = book.reviews - 1
        let save = await book.save()
        return res.status(200).send({ status: true, message: "This review has been deleted successfully." })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }

}

module.exports = { reviewBoook, UpdateReview, DeleteReview }
