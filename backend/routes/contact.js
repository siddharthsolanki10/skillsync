const express = require('express')
const { body, validationResult } = require('express-validator')
const nodemailer = require('nodemailer')

const router = express.Router()

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// @desc    Send contact form message
// @route   POST /api/contact
// @access  Public
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('message')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, subject, message } = req.body

    // Create email transporter
    const transporter = createTransporter()

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to admin email
      replyTo: email,
      subject: `SkillSync Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">New Contact Form Submission</h2>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 14px;">
            This message was sent from the SkillSync contact form.
          </p>
        </div>
      `
    }

    // Send email
    await transporter.sendMail(mailOptions)

    // Send auto-reply to user
    const autoReplyOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting SkillSync',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">Thank you for reaching out!</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and will get back to you as soon as possible. Our team typically responds within 24 hours.</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1E293B;">What happens next?</h3>
            <ul style="color: #666;">
              <li>Our team will review your message</li>
              <li>We'll respond within 24 hours for general inquiries</li>
              <li>For technical support, we aim to respond within 12 hours</li>
              <li>Urgent issues are typically addressed within 4 hours</li>
            </ul>
          </div>
          <p>In the meantime, feel free to explore our platform and start your learning journey!</p>
          <p>Best regards,<br>The SkillSync Team</p>
        </div>
      `
    }

    await transporter.sendMail(autoReplyOptions)

    res.json({
      success: true,
      message: 'Message sent successfully! We\'ll get back to you soon.'
    })
  } catch (error) {
    console.error('Contact form error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    })
  }
})

// @desc    Send newsletter subscription
// @route   POST /api/contact/newsletter
// @access  Public
router.post('/newsletter', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email } = req.body

    // In a real application, you would save this to a database
    // For now, we'll just send a confirmation email

    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to SkillSync Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">Welcome to SkillSync!</h2>
          <p>Thank you for subscribing to our newsletter. You'll now receive:</p>
          <ul style="color: #666;">
            <li>Weekly career tips and insights</li>
            <li>New learning path announcements</li>
            <li>Industry trends and updates</li>
            <li>Exclusive offers and resources</li>
          </ul>
          <p>We're excited to be part of your learning journey!</p>
          <p>Best regards,<br>The SkillSync Team</p>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)

    res.json({
      success: true,
      message: 'Successfully subscribed to newsletter!'
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter. Please try again later.'
    })
  }
})

// @desc    Send feedback
// @route   POST /api/contact/feedback
// @access  Public
router.post('/feedback', [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Feedback must be at least 10 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, rating, feedback, category } = req.body

    const transporter = createTransporter()

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `SkillSync Feedback: ${rating}/5 stars`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">New Feedback Submission</h2>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Rating:</strong> ${rating}/5 stars</p>
            ${category ? `<p><strong>Category:</strong> ${category}</p>` : ''}
            <p><strong>Feedback:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
              ${feedback.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)

    res.json({
      success: true,
      message: 'Thank you for your feedback!'
    })
  } catch (error) {
    console.error('Feedback submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again later.'
    })
  }
})

module.exports = router
