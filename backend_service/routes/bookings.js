const express = require('express');
const {
  getBookings,
  getBooking,
  addBooking,
  updateBooking,
  deleteBooking,
  getPatientHistory,
  confirmBooking // Add for confirmation page
} = require('../controllers/bookings');

const router = express.Router({mergeParams:true});

const {protect, authorize} = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin', 'user', 'dentist'), getBookings)
  .post(protect, authorize('admin', 'user', 'dentist'), addBooking);

router.route('/:id')
  .get(getBooking) // Make this publicly accessible for confirmation page
  .put(protect, authorize('admin', 'user', 'dentist'), updateBooking)
  .delete(protect, authorize('admin'), deleteBooking);

// Add the new route for confirmation
router.route('/:id/confirm')
  .put(confirmBooking); // Public route, no protection needed as it's accessed via email

router.route('/patientHistory/:userId')
  .get(protect, authorize('admin','dentist'), getPatientHistory);

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: The dental appointment booking management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - bookingDate
 *         - user
 *         - dentist
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated unique identifier for the booking
 *           example: 67fde5505a0148bd60617094
 *         bookingDate:
 *           type: string
 *           format: date-time
 *           description: The date and time of the booking
 *         user:
 *           type: string
 *           format: uuid
 *           description: The ID of the user making the booking
 *         dentist:
 *           type: string
 *           format: uuid
 *           description: The ID of the dentist for the booking
 *         status:
 *           type: string
 *           enum: [upcoming, completed, cancelled, confirmed, blocked]
 *           description: The status of the booking
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the booking was created
 *         treatmentDetail:
 *           type: string
 *           description: Details about the treatment
 *       example:
 *         id: 67fde7ded883ed6a5f67590d
 *         bookingDate: 2025-09-01T17:00:00.000+00:00
 *         user: 67fde38d5a0148bd60617086
 *         dentist: 67fde38d5a0148bd60617087
 *         status: completed
 *         createdAt: 2025-04-15T05:00:14.407+00:00
 *         treatmentDetail: "Regular dental checkup and cleaning"
 *   responses:
 *     BookingResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the operation was successful
 *         data:
 *           $ref: '#/components/schemas/Booking'
 *     BookingsListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the operation was successful
 *         count:
 *           type: integer
 *           description: Number of bookings returned
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Booking'
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Enter your JWT token in the format `Bearer {token}`
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     description: |
 *       Retrieve all bookings based on user role:
 *       - Admin can see all bookings
 *       - Dentist can see only their bookings
 *       - User can see only their own bookings
 *       Can be filtered by status (upcoming, completed, cancelled, confirmed, blocked)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, completed, cancelled, confirmed, blocked]
 *         description: Filter bookings by status
 *     responses:
 *       200:
 *         description: A list of bookings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BookingsListResponse'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /bookings/patientHistory/{userId}:
 *   get:
 *     summary: Get booking history by patient ID
 *     description: Retrieve booking history for a specific patient (accessible by admin, dentist or the patient themselves)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the patient/user
 *     responses:
 *       200:
 *         description: Patient booking history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BookingsListResponse'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - Not authorized to access this patient history
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get single booking
 *     description: Retrieve a specific booking by its ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking
 *     responses:
 *       200:
 *         description: A single booking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BookingResponse'
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update booking
 *     description: Update a specific booking (accessible by booking owner, assigned dentist, or admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [upcoming, completed, cancelled, confirmed, blocked]
 *               treatmentDetail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated booking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BookingResponse'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete booking
 *     description: Delete a specific booking (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking
 *     responses:
 *       200:
 *         description: Empty object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /dentists/{dentistId}/bookings:
 *   post:
 *     summary: Add a new booking
 *     description: Create a new booking for a specific dentist
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dentistId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the dentist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingDate
 *             properties:
 *               bookingDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the appointment
 *     responses:
 *       200:
 *         description: Created booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "67fde7ded883ed6a5f67590d"
 *                     bookingDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-01T17:00:00.000Z"
 *                     user:
 *                       type: string
 *                       example: "67fde38d5a0148bd60617086"
 *                     dentist:
 *                       type: string
 *                       example: "67fde38d5a0148bd60617087"
 *                     status:
 *                       type: string
 *                       enum: [upcoming, completed, cancelled, confirmed, blocked]
 *                       example: "upcoming"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-15T05:00:14.407Z"
 *       400:
 *         description: Bad request - User already has an upcoming booking
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Dentist not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /bookings/{id}/confirm:
 *   put:
 *     summary: Confirm a booking
 *     description: Confirm a specific booking (public route accessible via email link)
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking
 *     responses:
 *       200:
 *         description: Confirmed booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "67fde7ded883ed6a5f67590d"
 *                     bookingDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-01T17:00:00.000Z"
 *                     user:
 *                       type: string
 *                       example: "67fde38d5a0148bd60617086"
 *                     dentist:
 *                       type: string
 *                       example: "67fde38d5a0148bd60617087"
 *                     status:
 *                       type: string
 *                       enum: [upcoming, completed, cancelled, confirmed, blocked]
 *                       example: "confirmed"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-15T05:00:14.407Z"
 *                 message:
 *                   type: string
 *                   example: Appointment confirmed successfully
 *       400:
 *         description: Bad request - Booking is not in upcoming status
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /dentists/{dentistId}/bookings:
 *   get:
 *     summary: Get all bookings for a specific dentist
 *     description: Retrieve all bookings for a specific dentist (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dentistId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the dentist
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, completed, cancelled, confirmed, blocked]
 *         description: Filter bookings by status
 *     responses:
 *       200:
 *         description: A list of bookings for the specified dentist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BookingsListResponse'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */

module.exports = router;