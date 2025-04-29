const nodemailer = require('nodemailer');

/**
 * Send an email for appointment booking or updates
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message (HTML)
 * @returns {Promise} - Result of the email sending operation
 */
const sendEmail = async (options) => {
  // For production, you would use an actual SMTP service
  // For development/testing, you can use a test account from Ethereal
  // or configure your own SMTP service
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  const info = await transporter.sendMail(message);
  
  console.log('Email sent: %s', info.messageId);
  return info;
};

/**
 * Send appointment confirmation request email
 * @param {Object} booking - Booking data
 * @param {Object} user - User data
 * @param {Object} dentist - Dentist data
 * @param {string} baseUrl - Base URL of the application
 * @returns {Promise} - Result of the email sending operation
 */
const sendAppointmentConfirmationEmail = async (booking, user, dentist, baseUrl) => {
  const confirmationUrl = `${baseUrl}/confirm/${booking._id}`;
  
  const appointmentDate = new Date(booking.bookingDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4AA3BA; margin-bottom: 5px;">DentalBook Appointment</h1>
        <p style="color: #4b5563; margin-top: 0;">Please confirm your dental appointment</p>
      </div>
      
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p>Hello ${user.name},</p>
        <p>You have an upcoming dental appointment with <strong>${dentist.name}</strong>.</p>
        <p>Please confirm your attendance by clicking the button below:</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #1f2937;">Appointment Details:</h3>
        <p><strong>Date & Time:</strong> ${appointmentDate}</p>
        <p><strong>Dentist:</strong> ${dentist.name}</p>
        <p><strong>Booking ID:</strong> ${booking._id}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${confirmationUrl}" style="background-color: #4AA3BA; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
          Confirm Appointment
        </a>
      </div>
      
      <div style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
        <p>If you did not schedule this appointment, please disregard this email.</p>
        <p>For any questions or to reschedule, please contact us at:<br>095-000-0000 or dentistBook@gmail.com</p>
      </div>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject: 'Please Confirm Your Dental Appointment',
    message
  });
};

module.exports = {
  sendEmail,
  sendAppointmentConfirmationEmail
};