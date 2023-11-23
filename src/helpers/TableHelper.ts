import { IFCUser } from "models/FC";

export const interactionHeads = [
  {
    id: "index",
    numeric: false,
    sortable: false,
    disablePadding: false,
    label: "",
  },
  {
    id: "user",
    numeric: false,
    sortable: false,
    disablePadding: true,
    label: "User",
  },
  {
    id: "likes",
    numeric: false,
    sortable: true,
    disablePadding: false,
    label: "Likes",
  },
  {
    id: "replies",
    numeric: false,
    sortable: true,
    disablePadding: true,
    label: "Replies",
  },
  {
    id: "recasts",
    numeric: false,
    sortable: true,
    disablePadding: false,
    label: "Recasts",
  },
  {
    id: "total",
    numeric: true,
    sortable: true,
    disablePadding: true,
    label: "Total",
  },
];

export const sortDataInteraction = (
  data: IFCUser[],
  order: "asc" | "desc",
  orderBy: string
) => {
  return [...data].sort((e1, e2) => {
    const likes1 = e1.reaction_data?.likes || 0;
    const replies1 = e1.reaction_data?.replied_casts || 0;
    const recasts1 = e1.reaction_data?.recasts || 0;
    const total1 = likes1 + replies1 + recasts1;
    const likes2 = e2.reaction_data?.likes || 0;
    const replies2 = e2.reaction_data?.replied_casts || 0;
    const recasts2 = e2.reaction_data?.recasts || 0;
    const total2 = likes2 + replies2 + recasts2;
    const times = order === "asc" ? 1 : -1;
    switch (orderBy) {
      case "total":
        return times * (total1 - total2);
      case "likes":
        return times * (likes1 - likes2);
      case "replies":
        return times * (replies1 - replies2);
      case "recasts":
        return times * (recasts1 - recasts2);
      default:
        return 0;
    }
  });
};
