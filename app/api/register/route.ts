
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return NextResponse.json(
        { error: "Enter a valid email and a password of 8–72 bytes." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account already exists with this email." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        password: hashedPassword,
        emailVerified: null,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: tokenHash,
        expires: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    if (
      !appUrl.startsWith("http://localhost:") &&
      !appUrl.startsWith("http://127.0.0.1:")
    ) {
      throw new Error("APP_URL must point to localhost in development.");
    }

    const verifyUrl = new URL("/verify-email", appUrl);
    verifyUrl.searchParams.set("token", token);
    verifyUrl.searchParams.set("email", email);

    await sendVerificationEmail(email, verifyUrl.toString());

    return NextResponse.json(
      {
        message:
          "Registration successful. Open the Ethereal email preview in your server terminal to verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "Unable to register or send the verification email." },
      { status: 500 }
    );
  }
}
