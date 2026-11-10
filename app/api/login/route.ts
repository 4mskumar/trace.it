import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request){
    try {
        const {email, password} = await req.json()
        if (!email || !password) {
          throw new Error("Please enter an email and password");
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email } 
        });
 
        if (!user || !user.password) {
          throw new Error("No user found with this email");
        }

        // Check password match
        const isPasswordValid = await bcrypt.compare(
          password,
          user.password
        );            
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }
        return NextResponse.json({
            message: "User created and logged in successfully",
            user
        });
      
    } catch (error) {
        console.log(error);
        
    }

}