import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";


const f = createUploadthing();


export const ourFileRouter = {

    pdfUploader: f({ pdf: { maxFileSize: "1GB" } })
        .middleware(async ({ req }) => {
            const fetchData = async () => {
                const { getUser } = getKindeServerSession();
                const user = await getUser(); // Wait for the Promise to resolve
                return user;
            };

            const renderUser = async () => {
                const user = await fetchData();
                if (!user || !user.id) throw new Error("Unauthorized")
                return user
            }
            const user = await renderUser();
            return { userId: user.id }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const createdFile = await db.file.create({
                data: {
                    key: file.key,
                    name: file.name,
                    userId: metadata.userId,
                    url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
                    uploadStatus: "PROCESSING"
                }
            })
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;