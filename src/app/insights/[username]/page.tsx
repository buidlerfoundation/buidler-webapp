import CallerServer from "api/CallerServer";
import { IFCUser } from "models/FC";
import { Metadata, ResolvingMetadata } from "next";
import UserAnalytic from "screens/UserAnalytic";

export async function generateMetadata(
  { username }: { username: string },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const userByUserNameRes = await CallerServer.get<IFCUser>(
    `users/user-by-username?${new URLSearchParams({ username })}`
  );

  // optionally access and extend (rather than replace) parent metadata
  // const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${userByUserNameRes?.data?.display_name} (@${userByUserNameRes?.data?.username}) | Buidler`,
  };
}

export default UserAnalytic;
