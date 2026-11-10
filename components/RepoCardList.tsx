'use client'

import { Repository } from "@/app/types/types"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import RepositoryCard from "./RepoCards"

const RepoCardList = () => {

    const [repositories, setRepositories] = useState<Repository[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        async function getRepositories(){
            try {
                setLoading(true)
                const response = await fetch('/api/repositories')
                
                if(!response.ok){
                    setError("Something went wrong. Cannot fetch repositories.")
                    throw new Error("Failed to fetch.")
                }
                
                const data = await response.json()
                
                setRepositories(data)
            } catch (error) {
                console.log(error);
                setError('Failed to fetch data.')
            }finally{
                setLoading(false)

            }
        }

        getRepositories()
    }, [])

      if (loading) {
    return <p>Loading repositories...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (repositories.length === 0) {
    return <p>No repositories found.</p>;
  }

  return (
    <div className="w-full min-screen grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div className="">
            {repositories.map((val, ind) => (
                <RepositoryCard repository={val} key={val.id}/>
            ))}
        </div>
    </div>
  )
}

export default RepoCardList