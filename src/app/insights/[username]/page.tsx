import CallerServer from "api/CallerServer";
import { IFCUser } from "models/FC";
import { Metadata, ResolvingMetadata } from "next";
import UserAnalytic from "screens/UserAnalytic";

export async function generateMetadata(
  {
    params,
  }: {
    params: { username: string };
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const userByUserNameRes = await CallerServer.get<IFCUser>(
    `users/user-by-username?${new URLSearchParams(params)}`
  );

  // optionally access and extend (rather than replace) parent metadata
  // const previousImages = (await parent).openGraph?.images || [];

  const title = `${userByUserNameRes?.data?.display_name} (@${userByUserNameRes?.data?.username}) | Buidler`;
  const description = userByUserNameRes?.data?.profile?.bio?.text;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: process.env.NEXT_PUBLIC_URL + `/insights/${params.username}`,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default UserAnalytic;
