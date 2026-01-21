import resend
import os
from dotenv import load_dotenv
import logging

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

resend.api_key = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "onboarding@resend.dev")
FROM_NAME = "Quickfolio"
FROM_ADDRESS = f"{FROM_NAME} <{FROM_EMAIL}>"

logger.info(f"Email service initialized with FROM_EMAIL: {FROM_EMAIL}")
logger.info(f"Resend API key present: {bool(resend.api_key)}")

def send_welcome_email(to_email: str, name: str, username: str):
    """Send welcome email after signup"""
    logger.info(f"Attempting to send welcome email to {to_email}")
    try:
        params = {
            "from": FROM_ADDRESS,
            "to": [to_email],
            "subject": f"Welcome to Quickfolio, {name}! 🎉",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #3b82f6;">Welcome to Quickfolio!</h1>
                <p>Hi {name},</p>
                <p>Your AI-powered portfolio is ready! 🚀</p>
                <p>Your portfolio is live at: <a href="http://localhost:3000/{username}" style="color: #3b82f6;">quickfolio.dev/{username}</a></p>
                <h3>What's Next?</h3>
                <ul>
                    <li>Upload your resume to auto-populate your portfolio</li>
                    <li>Customize your theme and background</li>
                    <li>Add projects and skills</li>
                    <li>Share your portfolio link with recruiters</li>
                </ul>
                <p>Need help? Just reply to this email.</p>
                <p>Best regards,<br>The Quickfolio Team</p>
            </div>
            """
        }
        logger.info(f"Email params: {params}")
        result = resend.Emails.send(params)
        logger.info(f"Welcome email sent successfully to {to_email}. Result: {result}")
        return True
    except Exception as e:
        logger.error(f"Error sending welcome email to {to_email}: {str(e)}")
        logger.exception(e)
        return False

def send_resume_processed_email(to_email: str, name: str, username: str):
    """Send email when resume processing is complete"""
    logger.info(f"Attempting to send resume processed email to {to_email}")
    try:
        params = {
            "from": FROM_ADDRESS,
            "to": [to_email],
            "subject": "Your Resume Has Been Processed! ✅",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #3b82f6;">Resume Processing Complete!</h1>
                <p>Hi {name},</p>
                <p>Great news! Your resume has been successfully processed by our AI. 🤖</p>
                <p>Your portfolio has been automatically updated with:</p>
                <ul>
                    <li>✅ Work experience</li>
                    <li>✅ Skills and technologies</li>
                    <li>✅ Projects</li>
                    <li>✅ Education</li>
                </ul>
                <p><a href="http://localhost:3000/{username}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Your Portfolio</a></p>
                <p>You can edit any information in your dashboard.</p>
                <p>Best regards,<br>The Quickfolio Team</p>
            </div>
            """
        }
        result = resend.Emails.send(params)
        logger.info(f"Resume processed email sent successfully to {to_email}. Result: {result}")
        return True
    except Exception as e:
        logger.error(f"Error sending resume processed email to {to_email}: {str(e)}")
        logger.exception(e)
        return False

def send_password_reset_email(to_email: str, name: str, reset_token: str):
    """Send password reset email"""
    logger.info(f"Attempting to send password reset email to {to_email}")
    try:
        reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
        params = {
            "from": FROM_ADDRESS,
            "to": [to_email],
            "subject": "Reset Your Quickfolio Password 🔐",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #3b82f6;">Password Reset Request</h1>
                <p>Hi {name},</p>
                <p>We received a request to reset your password for your Quickfolio account.</p>
                <p><a href="{reset_link}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p>Best regards,<br>The Quickfolio Team</p>
            </div>
            """
        }
        result = resend.Emails.send(params)
        logger.info(f"Password reset email sent successfully to {to_email}. Result: {result}")
        return True
    except Exception as e:
        logger.error(f"Error sending password reset email to {to_email}: {str(e)}")
        logger.exception(e)
        return False
