import ChatWrapper from '@/components/chat/ChatWrapper'
import PdfRenderer from '@/components/PdfRenderer'
import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { notFound, redirect } from 'next/navigation'
import React from 'react'

interface PageProps {
    params: {
        fileid: string  // This should match with the parent folder
    }
}

// The params (the file id of every file that you can see in the search bar) is 
// passed everywhere by next js just destructure in the function

const page = async ({ params }: PageProps) => {
    //retrierive the file id 
    const {fileid} = params

    const fetchData = async () => {
        const { getUser } = getKindeServerSession();
        const user = await getUser(); // Wait for the Promise to resolve
        return user;
    };
    
    const renderUser = async () => {
        const user = await fetchData();  
        if(!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileid}`)
        return user
    }
    // make db call
    const user = await renderUser();
    const file = await db.file.findFirst({
        where:{
            id: fileid,
            userId: user.id //3:31:05
        }
    })

    if(!file) notFound()

  return (
    
    // Here render the pdf and the chat components

    <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* Left side PDF code */}
        <div className='flex-1 xl:flex'>
            <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
               <PdfRenderer url={file.url} /> 
            </div>
        </div>

        {/* Right side chat */}
        <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
            <ChatWrapper fileId={file.id}/>
        </div>
      </div>
    </div>
  )
}

export default page
