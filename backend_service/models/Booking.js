const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    bookingDate: {
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    dentist: {
        type: mongoose.Schema.ObjectId,
        ref: 'Dentist',
        required: true
    },
    //Add a field status to track the status of the booking
    status: {
        type: String,
        enum: ['upcoming', 'completed', 'cancelled','confirmed', 'blocked'],
        default: 'upcoming'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    treatmentDetail: {
        type: String
    }
});

module.exports = mongoose.model('Booking', BookingSchema);