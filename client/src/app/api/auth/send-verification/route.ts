import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { verificationCodes } from '@/lib/verification-storage';

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createEmailTemplate = (otp: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #1f2937; text-align: center; margin-bottom: 20px;">Email Verification</h1>
        <p style="color: #374151; font-size: 16px;">Your verification code is:</p>
        <div style="background: #f97316; color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 20px 0; border-radius: 8px;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
      </div>
    </div>
  `;
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'Valid email is required', success: false },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + (10 * 60 * 1000);

    // Store in shared Map
    verificationCodes.set(email, { code: otp, expiresAt });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification Code',
      html: createEmailTemplate(otp),
    });

    console.log(`✅ OTP sent to ${email}: ${otp}`);

    return NextResponse.json({
      message: 'Code sent successfully',
      success: true
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { message: 'Failed to send code', success: false },
      { status: 500 }
    );
  }
}
