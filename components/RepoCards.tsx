import { Repository } from "@/app/types/types"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

type RepositoryProps = {
    repository: Repository
}

export default function RepositoryCard({repository}: RepositoryProps){
    const router = useRouter()
    return (
        <div className="w-[25%]">
            <Card className="w-full max-w-sm">
                <CardHeader>

                    <CardTitle>{repository.name}</CardTitle>
                    <CardDescription>{repository.description}</CardDescription>
                    <CardAction>
                        <Button
                            onClick={() => {
                                router.push(`/dashboard/repos/${repository.owner.login}/${repository.name}`)
                            }}
                        variant={'destructive'}>Analyse</Button>
                    </CardAction>
                </CardHeader>
            </Card>
        </div>
    )
}