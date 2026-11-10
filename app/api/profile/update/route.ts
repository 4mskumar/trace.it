import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Update path if your authOptions are elsewhere

export async function POST(req: Request) {
  try {
    

    const { name, email } = await req.json();

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required and cannot be empty" },
        { status: 400 }
      );
    }

    // 2. Use prisma.user.update instead of findUnique
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { 
        name: name.trim() 
      },
    });

    return NextResponse.json(
      { 
        message: "Profile updated successfully", 
        user: { name: updatedUser.name } 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}