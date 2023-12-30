import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const fetchData = async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser(); // Wait for the Promise to resolve
    return user;
  };

  const renderUser = async () => {
    const user = await fetchData();

    if(!user || !user.id) redirect('/auth-callback?origin=dashboard')

    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      }
    })

    if(!dbUser) redirect('/auth-callback?origin=dashboard')

    return <Dashboard />;
  };

  return renderUser();
};

export default Page;
