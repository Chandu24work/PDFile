"use client";

import { ChevronDown, ChevronUp, Ghost, Loader, Loader2Icon, RotateCw, Search } from "lucide-react";
import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import SimpleBar from "simplebar-react";
import PdfFullscreen from "./PdfFullscreen";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfRendererProps {
  url: string;
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast();

  // To detect the size of the window and resize the pdf
  // {ref} is to link the pdf doc and {width} is the width to adjust
  const { width, ref } = useResizeDetector();

  // to get the number of pages in the pdf document and update it
  const [numPages, setnumPages] = useState<number>();

  // to get the current page for changing the page when clicked on arrow buttons
  const [currPage, setcurrPage] = useState<number>(1);

  // TO handle the zoom effect
  const [scale, setscale] = useState<number>(1);

  // To handle rotation of pdf
  const [rotation, setrotation] = useState<number>(0)

  // Using Renderedscale to check is loading and fixing the fliker while changing the zoom 
  const [renderedScale, setrenderedScale] = useState<number | null>(null)
  const isLoading = renderedScale !== scale

  // To validate the input in the input box of PDF options
  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });
  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });
  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setcurrPage(Number(page));
    setValue("page", String(page));
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      {/* PDF OPTIONS */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          {/* Down button */}
          <Button
            disabled={currPage <= 1}
            onClick={() => {
              setcurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1))
              setValue("page", String(currPage - 1));
            }}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>

          {/* Text Box - number */}
          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              className={`w-12 h-8 ${errors.page ? "focus-visible:ring-red-500" : ""
                }`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />

            <p className=" text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "?"}</span>
            </p>
          </div>

          {/* Up button */}
          <Button
            disabled={numPages === undefined || currPage === numPages}
            onClick={() => {
              setcurrPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1
              )
              setValue("page", String(currPage + 1));
            }}
            variant="ghost"
            aria-label="next page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom dropdown */}
        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className=" gap-1.5" aria-label="zoom" variant="ghost">
                <Search className="h-4 w-4" />
                {scale * 100}% <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setscale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setscale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setscale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setscale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Rotation */}
          <Button onClick={() => setrotation((prev) => prev + 90)}
            variant="ghost"
            aria-label="roatate 90 degrees">
            <RotateCw className="h-4 w-4" />
          </Button>

          <PdfFullscreen fileUrl={url} />
        </div>
      </div>

      {/* PDF render */}
      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
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
              file={url}
              className="max-h-full ">
              {/* To stop the fliker in while rendering the resized window */}
              {isLoading && renderedScale ? <Page
                width={width ? width : 1}
                pageNumber={currPage}
                scale={scale}
                key={"@" + renderedScale}
                rotate={rotation}
              /> : null}

              <Page
                className={cn(isLoading ? "hidden" : "")}
                width={width ? width : 1}
                pageNumber={currPage}
                scale={scale}
                key={"@" + scale}
                rotate={rotation}
                loading={
                  <div className="flex justify-center">
                    <Loader2Icon className="my-24 h-6 w-6 animate-spin"/>
                  </div>
                }
                onRenderSuccess={() => setrenderedScale(scale)}
              /> 
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
