const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private (Admin only)
exports.getUsers = async (req,res,next) => {
    try {
        const users = await User.find();
        res.status(200).json({success:true, count:users.length, data:users});
    } catch(err) {
        res.status(400).json({success:false});
    }
};

// @desc    Get single user
// @route   GET /api/v1/user/:id
// @access  Private (Admin only)
exports.getUser = async (req,res,next) => {
    try {
        const user = await User.findById(req.params.id);

        if(!user) {
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true, data:user});
    } catch(err) {
        res.status(400).json({success:false});
    }
};

//@desc Update single role user
//@route PUT /api/v1/user/:id
//@access Private (Admin only)
exports.updateUserRole = async (req,res,next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!user) {
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true, data:user});
    } catch(err) {
        res.status(400).json({success:false});
    }
};