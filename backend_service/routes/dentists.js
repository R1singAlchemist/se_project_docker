const express = require('express');
const {
    getDentists,
    getDentist,
    createDentist,
    updateDentist,
    deleteDentist,
    updateDentistReview,
    removeDentistReview,
    getDentistReviews,
    getDentistBookedDates,
    addExpertise,
    removeExpertise
} = require('../controllers/dentists');

const bookingRouter = require('./bookings');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use('/:dentistId/bookings/', bookingRouter);

router.route('/')
    .get(getDentists)
    .post(protect, authorize('admin'), createDentist);

    router.route('/:id')
    .get(getDentist)
    .put(protect, authorize('admin', 'dentist'), updateDentist)
    .delete(protect, authorize('admin'), deleteDentist);

// New expertise modification routes
router.route('/:id/expertise')
    .put(protect, authorize('admin','dentist'), addExpertise)
    .delete(protect, authorize('admin','dentist'), removeExpertise);

router.route('/reviews/:id')
    .get(getDentistReviews)
    .put(protect, authorize('admin', 'user'), updateDentistReview)
    .delete(protect, authorize('admin', 'user'), removeDentistReview);

router.route('/availibility/:id')
    .get(getDentistBookedDates);
/**
 * @swagger
 * components:
 *   schemas:
 *     Dentist:
 *       type: object
 *       required:
 *         - year_experience
 *         - area_experience
 *         - name
 *         - StartingPrice
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           desciption: The auto-generated id of the hospital
 *           example: d290f1ee-6c54-4b01-90e6-d701748f0851
 *         name:
 *           type: string
 *           desciption: Dentist name
 *         year_experience:
 *           type: integer
 *           desciption: Dentist Year experience
 *           minimum: 0 
 *         area_expertise:
 *           type: array
 *           items:
 *             type: string
 *             enum:
 *               - Orthodontics
 *               - Endodontics
 *               - Prosthodontics
 *               - Pediatric Dentistry
 *               - Oral Surgery
 *               - Periodontics
 *               - Cosmetic Dentistry
 *               - General Dentistry
 *               - Implant Dentistry
 *           description: expert
 *           example: ["General Dentistry", "Cosmetic Dentistry"]
 *         picture:
 *           type: string
 *           description: url picture
 *           example: "https://drive.google.com/uc?id=17c5YiQLtTjIU2LKuv39VE-kt40ADahSd"
 *         StartingPrice:
 *           type: number
 *           description: strating price
 *           minimum: 0
 *           example: 1000
 *         rating:
 *           type: array
 *           items: 
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 fromat: objectId
 *                 description: ID user who rating
 *                 example: "6479c2b3d85857001234abcd"
 *               rating:
 *                 type: integer
 *                 description: score
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               review:
 *                 type: string
 *                 description: review
 *                 example: "he is a good Dentist"
 *               createAt:
 *                 type: string
 *                 format: date-time
 *                 description: day of review
 *                 readOnly: true
 *             required:
 *               - user
 *               - reating
 *           description: All review to this Dentist
 *         availability:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Available times
 *                 example: "2025-04-26"
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     start:
 *                       type: string
 *                       description: start time
 *                       example: "09:00"
 *                     end:
 *                       type: string
 *                       description: finish time
 *                       example: "10:00"
 *                   required:
 *                     - start
 *                     - end
 *                 required:
 *                   - date
 *                   - slots
 *             description: avaiable schedule
 *             example: {
 *                         "_id": "68046ea78f9fb81cee08b0dd",
 *                         "date": "2025-04-26"
 *                      }
 *           bookings:
 *             type: array
 *             items:
 *               type: string
 *               format: objectId
 *             description: รายการ Booking ที่เกี่ยวข้อง (Virtual Field)
 *             readOnly: true
 */


/**
 * @swagger
 * tags:
 *   name: Dentists
 *   description: API for managing dentist information and related operations
 * 
 * /dentists:
 *   get:
 *     summary: Get all dentists
 *     tags: [Dentists]
 *     responses:
 *       200:
 *         description: List of all dentists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 1
 *                 data:
 *                   type: array    
 *                   items:
 *                     $ref: '#/components/schemas/Dentist'
 *       400:
 *         description: Unsuccess
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *   post:
 *     summary: Create a new dentist
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year_experience
 *               - area_experience
 *               - name
 *               - StartingPrice
 *             properties:
 *               name:
 *                 type: string
 *                 desciption: Dentist name
 *               year_experience:
 *                 type: integer
 *                 desciption: Dentist Year experience
 *                 minimum: 0 
 *               area_expertise:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum:
 *                     - Orthodontics
 *                     - Endodontics
 *                     - Prosthodontics
 *                     - Pediatric Dentistry
 *                     - Oral Surgery
 *                     - Periodontics
 *                     - Cosmetic Dentistry
 *                     - General Dentistry
 *                     - Implant Dentistry
 *                 description: expert
 *                 example: ["General Dentistry", "Cosmetic Dentistry"]
 *               picture:
 *                 type: string
 *                 description: url picture
 *                 example: "https://drive.google.com/uc?id=17c5YiQLtTjIU2LKuv39VE-kt40ADahSd"
 *               StartingPrice:
 *                 type: number
 *                 description: strating price
 *                 minimum: 0
 *                 example: 1000
 *     responses:
 *       201:
 *         description: Successfully created dentist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dentist'
 *       401:
 *         description: Not authorize to access this route
 *       403:
 *         description: User role is not authorized to access this route
 * 
 * /dentists/{id}:
 *   get:
 *     summary: Get a specific dentist by ID
 *     tags: [Dentists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Dentist ID
 *     responses:
 *       200:
 *         description: Dentist information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dentist'
 *       400:
 *         description: Unsuccess
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *   put:
 *     summary: Update a dentist's information
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Dentist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: john
 *     responses:
 *       200:
 *         description: Successfully updated dentist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dentist'
 *       400:
 *         description: Unsuccess
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: Not authorize to access this route
 *       403:
 *         description: Dentist user is not update another dentist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Dentist user is not authorized to update another dentist's profile
 *   delete:
 *     summary: Delete a dentist
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Dentist ID
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
 *                   example: true
 *                 data:
 *                   type: object  
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Dentist not found
 *
 * /dentists/{id}/expertise:
 *   put:
 *     summary: Add expertise to a dentist
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Dentist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expertise:
 *                 type: string
 *                 description: Expertise to add
 *                 example: "Implant Dentistry"
 *     responses:
 *       200:
 *         description: Expertise successfully added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Dentist'
 *       400:
 *         description: No expertise provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No expertise provided
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: This user is not authorized to update this Expertise
 *       404:
 *         description: Dentist not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Dentist not found
 *       500:
 *         description: Unsuccess
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *   delete:
 *     summary: Remove expertise from a dentist
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Dentist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expertise:
 *                 type: string
 *                 description: Expertise to remove
 *                 example: "Implant Dentistry"
 *     responses:
 *       200:
 *         description: Expertise successfully added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucess:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Dentist'
 *       400:
 *         description: No expertise provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No expertise provided
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: This user is not authorized to update this Expertise
 *       404:
 *         description: Dentist not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Dentist not found
 *       500:
 *         description: Unsuccess
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *
 * /dentists/reviews/{id}:
 *   get:
 *     summary: Get all reviews for a dentist
 *     tags: [Dentists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Dentist ID
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 1
 *                 data:
 *                   $ref: '#/components/schemas/Dentist/properties/rating'
 *       404:
 *         description: Dentist not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No dentist found with the id of 67fde0a05a0148bd6061706c
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Server Error
 *   put:
 *     summary: Update a review for a dentist
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Dentist ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               review:
 *                 type: string
 *                 example: "Great experience with this dentist"
 *     responses:
 *       200:
 *         description: Dentist review information update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Dentist'
 *       400:
 *         description: Unsuccess
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or user access required
 *   delete:
 *     summary: Delete a review
 *     tags: [Dentists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Dentist review was delete
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Dentist'
 *       400:
 *         description: Unsuccess
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or user access required
 *
 * /dentists/availibility/{id}:
 *   get:
 *     summary: Get booked dates for a dentist
 *     tags: [Dentists]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Dentist ID
 *     responses:
 *       200:
 *         description: List of booked dates
 *         content:
 *           application/json:
 *             schema:
 *               data: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     format: objectId
 *                     example: "68046ea78f9fb81cee08b0dd"
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: Available times
 *                     example: "2025-04-26"
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

module.exports = router;
