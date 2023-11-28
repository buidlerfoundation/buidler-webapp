import CallerServer from "api/CallerServer";
import { normalizeContentCast } from "helpers/CastHelper";
import { ICast } from "models/FC";
import { Metadata } from "next";
import HomeFeedDetail from "screens/HomeFeedDetail";

export async function generateMetadata({
  params,
}: {
  params: { username: string; hash: string };
}): Promise<Metadata> {
  const castRes = await CallerServer.get<ICast>(
    `casts/${params.hash.replace("0x", "")}?page=1&limit=1`
  );
  const author = castRes?.data?.author;
  const contentCast = castRes?.data
    ? normalizeContentCast(castRes?.data, { withoutHtml: true })
    : "";

  const title = `${author?.display_name} (@${author?.username}) | Buidler`;
  const description = contentCast;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default HomeFeedDetail;
