import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from 'zod'

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const fetchData = async () => {
      const { getUser } = getKindeServerSession();
      const user = await getUser(); // Wait for the Promise to resolve
      return user;
    };

    const renderUser = async () => {
      const user = await fetchData();

      if (!user || !user.id) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Check if the user exists in the database
      const dbUser = await db.user.findFirst({
        where: {
          id: user.id,
        },
      });

      if (!dbUser) {
        // Handle the case where user.email is null or undefined
        const email = user.email || " "; // Provide a default value or handle it accordingly

        // create the user in the db
        await db.user.create({
          data: {
            id: user.id,
            email: email,
          },
        });
      }

      return { success: true };
    };

    return renderUser(); // Return the result of renderUser
  }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId, user } = ctx

    return await db.file.findMany({
      where: {
        userId
      }
    })
  }),
  getFile: privateProcedure.input(z.object({key: z.string()})).mutation(async ({ctx, input})=>{
    const {userId} = ctx
    const file = await db.file.findFirst({
      where:{
        key: input.key,
        userId
      }
    })

    if(!file) throw new TRPCError({code: 'NOT_FOUND'})

    return file
  }),
  deleteFile: privateProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      // check/find the file 
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId
        }
      })

      // if file is not available
      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      // Acutall deletion of file
      await db.file.delete({
        where: {
          id: input.id,
        }
      })

      return file
  }),
  getFileUploadStatus: privateProcedure.input(z.object({fileId: z.string()})).query (async({input, ctx}) => {
    const file = await db.file.findFirst({
      where: {
        id: input.fileId,
        userId: ctx.userId
      }
    })
    // As const is to tell typescript that "PENDING" is not any random string and is from schema.prisma's enum states
    if(!file) return {status: "PENDING" as const}
    return { status: file.uploadStatus }
  })

});


// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
