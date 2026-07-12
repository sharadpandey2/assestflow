import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    // Create a test account for Ethereal Email
    const testAccount = await nodemailer.createTestAccount();

    // Create a reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"AssetFlow System" <no-reply@assetflow.com>', // sender address
      to: email, // list of receivers
      subject: 'Password Reset Verification Code - AssetFlow', // Subject line
      text: `Your password reset code is: ${code}`, // plain text body
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center;">AssetFlow Verification</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">We received a request to reset your password. Please use the verification code below to proceed:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #666;">If you didn't request a password reset, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} AssetFlow. All rights reserved.</p>
        </div>
      `, // html body
    });

    // Log the Ethereal preview URL so the developer can see it in the terminal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('----------------------------------------------------');
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', previewUrl);
    console.log('----------------------------------------------------');

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully via Ethereal',
      previewUrl // Returning it to frontend for easy testing access during development
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
