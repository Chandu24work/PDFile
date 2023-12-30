import React, { useState } from 'react'
import { Dialog, DialogContent } from './ui/dialog'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { Button } from './ui/button'
import { Expand, Loader } from 'lucide-react'
import SimpleBar from 'simplebar-react'
import { Document, Page } from 'react-pdf'
import { useToast } from './ui/use-toast'
import { useResizeDetector } from 'react-resize-detector'

interface PdfFullscreenProps{
    fileUrl: string
}

function PdfFullscreen({ fileUrl }: PdfFullscreenProps) {
    const [isOpen, setisOpen] = useState(false)

    // to get the number of pages in the pdf document and update it
    const [numPages, setnumPages] = useState<number>();

    // To detect the size of the window and resize the pdf
    // {ref} is to link the pdf doc and {width} is the width to adjust
    const { width, ref } = useResizeDetector();

    const {toast} = useToast()
    return (
        <Dialog open={isOpen} onOpenChange={(v) => {
            if(!v){
                setisOpen(v)
            }
        }}>
            <DialogTrigger onClick={() => setisOpen(true)} asChild>
                <Button 
                variant='ghost' 
                className='gap-1.5' 
                aria-label='Full screen'>
                  <Expand className='h-4 w-4'/>
                </Button>
            </DialogTrigger>
            <DialogContent className='max-w-7xl w-full'>
                <SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)] mt-6'>

          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Error at loading PDF",
                  description: "Please try again later",
                  variant: "destructive",
                });
              }}
              onLoadSuccess={({ numPages }) => setnumPages(numPages)}
              file={fileUrl}
              className="max-h-full ">
              {new Array(numPages).fill(0).map((_, i) =>(
                <Page
                key={i}
                width={width ? width : 1}
                pageNumber={i+1}
              />
              ))}
            </Document>
          </div>
        
                </SimpleBar>
            </DialogContent>

        </Dialog>
    )
}

export default PdfFullscreen