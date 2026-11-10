import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { createGitHubClient } from "@/lib/github";

export async function GET(){
    try {
        const session = await getServerSession(authOptions)

        if(!session){
            return NextResponse.json({
                error: 'Unauthorized'
            }, {status: 401})
        }
        
        const accessToken = (session as any).accessToken
        
        if(!accessToken){
            return NextResponse.json({
                error: 'No accessToken'
            }, {status: 401})
        }

        const github = createGitHubClient(accessToken)
        const {data} = await github.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 100
        })

        return NextResponse.json(data)
    } catch (error) {
        console.log(error);        
    }
}