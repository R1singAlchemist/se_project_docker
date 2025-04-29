const Dentist = require('../models/Dentist');
const Booking = require('../models/Booking');

//@desc Get all dentists
//@route GET /api/v1/dentists
//@access Public
exports.getDentists = async (req, res, next) => {
    let query;

    //Copy req.query
    const reqQuery = { ...req.query };

    //Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Dentist.find(JSON.parse(queryStr)).populate('bookings');

    //Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
        const total = await Dentist.countDocuments();
        query = query.skip(startIndex).limit(limit);

        //Execute query
        const dentists = await query;

        //Pagination result
        const pagination = {};

        if(endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }

        if(startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        res.status(200).json({ sucess: true, count: dentists.length, pagination, data: dentists });
    } catch (err) {
        res.status(400).json({ sucess: false });
    }

};

//@desc Get single dentist
//@route GET /api/v1/dentist/:id
//@access Public
exports.getDentist = async (req, res, next) => {
    try {
        const dentist = await Dentist.findById(req.params.id);

        if (!dentist) {
            return res.status(400).json({ sucess: false });
        }

        res.status(200).json({ sucess: true, data: dentist });
    } catch (err) {
        res.status(400).json({ sucess: false });
    }

};

//@desc Create a dentist
//@route POST /api/v1/dentists
//@access Private
exports.createDentist = async (req, res, next) => {
    const dentist = await Dentist.create(req.body);
    res.status(201).json({ sucess: true, data: dentist });
};

// @desc    Get reviews for a single dentist
// @route   GET /api/v1/dentists/reviews/:id
// @access  Public
exports.getDentistReviews = async (req, res, next) => {
    try {
        const dentist = await Dentist.findById(req.params.id)
                                     .select('rating') 
                                     .populate({
                                         path: 'rating.user', 
                                         select: 'name'
                                     });

        if (!dentist) {
            return res.status(404).json({ success: false, message: `No dentist found with the id of ${req.params.dentistId}` });
        }

        res.status(200).json({
            success: true,
            count: dentist.rating.length, 
            data: dentist.rating          
        });

    } catch (err) {
        console.error(err); 
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

//@desc Update single dentist
//@route PUT /api/v1/dentists/:id
//@access Private
exports.updateDentist = async (req, res, next) => {
    try {
        // Extra check for dentist role to ensure they can only update their own profile
        if (req.user.role === 'dentist' && req.params.id !== req.user.dentist_id.toString()) {
            return res.status(403).json({
                success: false, 
                message: `Dentist user ${req.user.id} is not authorized to update another dentist's profile`
            });
        }

        const dentist = await Dentist.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!dentist) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: dentist });
    } catch (err) {
        res.status(400).json({ success: false });
    }
};

//@desc Update/Create single dentist's review
//@route PUT /api/v1/dentists/reviews/:id
//@access Private
exports.updateDentistReview = async (req, res, next) => {
    try {

        const reviewToPush = {
            rating : {
            user : req.user.id,
            rating : req.body.rating,
            review : req.body.review
            }
        }

        const reviewToPull = {
            rating : {
                user : req.user.id,
            }
        }


        //Remove any existing reviews by this user
        await Dentist.findByIdAndUpdate(req.params.id , {$pull : reviewToPull});

        //Add a review for this user
        const dentist = await Dentist.findByIdAndUpdate(req.params.id, { $push : reviewToPush }, {
            new: true,
            runValidators: true
        });

        //Effectively makes this both an update and create function
        if (!dentist) {
            return res.status(400).json({ sucess: false });
        }

        res.status(200).json({ sucess: true, data: dentist });
    } catch (err) {
        res.status(400).json({ sucess: false });
    }

};

//@desc Remove single dentist's review(s)
//@route PUT /api/v1/dentists/reviews/:id
//@access Private
exports.removeDentistReview = async (req, res, next) => {
    try {

        const reviewToPull = {
            rating : {
                user : req.user.id,
            }
        }

        //PULL(remove) this dentist's review(s) matching user's id
        const dentist = await Dentist.findByIdAndUpdate(req.params.id, { $pull : reviewToPull }, {
            new: true,
            runValidators: true
        });

        if (!dentist) {
            return res.status(400).json({ sucess: false });
        }

        res.status(200).json({ sucess: true, data: dentist });
    } catch (err) {
        res.status(400).json({ sucess: false });
    }

};

//@desc Get all booked dates of this dentist
//@route GET /api/v1/dentists/availibility/:id
//@access Private
exports.getDentistBookedDates = async (req, res, next) => {
    try {
        const bookedDates = await Booking.find({
            dentist: req.params.id,
            status: { $in: ["upcoming", "confirmed", "blocked"] }
        }).select('bookingDate');

        res.status(200).json({
            success: true,
            data: bookedDates
        });

    } catch (err) {
        res.status(400).json({ success: false });
    }
};

//@desc Delete single dentist
//@route DELETE /api/v1/dentists/:id
//@access Private
exports.deleteDentist = async (req, res, next) => {
    try {
        const dentist = await Dentist.findById(req.params.id);

        if (!dentist) {
            return res.status(400).json({ sucess: false });
        }

        await Booking.deleteMany({dentist:req.params.id});
        await Dentist.deleteOne({_id:req.params.id});

        res.status(200).json({ sucess: true, data: {} });
    } catch (err) {
        res.status(400).json({ sucess: false });
    }

};

//@desc Add an area of expertise to a dentist
//@route PUT /api/v1/dentists/:id/expertise
//@access Private
exports.addExpertise = async (req, res) => {
    try {
        const { expertise } = req.body;

        if (!expertise) {
            return res.status(400).json({ success: false, message: "No expertise provided" });
        }

        const dentist = await Dentist.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { area_expertise: expertise } }, // Avoid duplicates
            { new: true, runValidators: true }
        );

        if (!dentist) {
            return res.status(404).json({ success: false, message: "Dentist not found" });
        }

        if (req.user.role !== 'admin') {
            if ( req.user.role === 'dentist' && dentist.id.toString() === req.user.dentist_id.toString()) {
            return res.status(200).json({ success: true, data: dentist });
          }else{
            return res.status(401).json({success:false, message:`User ${req.user.id} is not authorized to update this Expertise`});
          }
        }else{
            return res.status(200).json({ success: true, data: dentist });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

//@desc Remove an area of expertise from a dentist
//@route DELETE /api/v1/dentists/:id/expertise
//@access Private
exports.removeExpertise = async (req, res) => {
    try {
        const { expertise } = req.body;

        if (!expertise) {
            return res.status(400).json({ success: false, message: "No expertise provided" });
        }

        const dentist = await Dentist.findByIdAndUpdate(
            req.params.id,
            { $pull: { area_expertise: expertise } },
            { new: true, runValidators: true }
        );

        if (!dentist) {
            return res.status(404).json({ success: false, message: "Dentist not found" });
        }

        if (req.user.role !== 'admin') {
            if ( req.user.role === 'dentist' && dentist.id.toString() === req.user.dentist_id.toString()) {
            return res.status(200).json({ success: true, data: dentist });
          }else{
            return res.status(401).json({success:false, message:`User ${req.user.id} is not authorized to update this Expertise`});
          }
        }else{
            return res.status(200).json({ success: true, data: dentist });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};