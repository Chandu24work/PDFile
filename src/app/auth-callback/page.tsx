"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { trpc } from "../_trpc/client"
import { Loader2 } from "lucide-react"

const Page = () =>{
    const router = useRouter()

    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')


    trpc.authCallback.useQuery(undefined, {
        onSuccess: ({success}) => {
            if(success){
                // user is synced to db (so navigate them to where they came from)
                router.push(origin ? `/${origin}` : '/dashboard');
            }
        },
        // if error occurs
        onError: (err) => {
            console.error("Authentication error:", err);
            if (err.data?.code === "UNAUTHORIZED") {
              router.push("/sign-in");
            }
          },
        retry: true, // if there is error the we'll send the req again 
        retryDelay: 500, // Every 500 ms (half second) we are checking user is sync with the database
    })
    return(
        <div className="w-full mt-24 flex justify-center">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
                <h3 className="font-semibold text-xl">
                    Setting Up your account...
                </h3>
                <p>
                    You will be reirected automatically.
                </p>
            </div>
        </div>
    )
}

export default Page