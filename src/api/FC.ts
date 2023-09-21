import { IFCUser, ISignedKeyRequest } from "models/FC";
import Caller from "./Caller";

export const requestSignedKey = () => Caller.post<ISignedKeyRequest>("xcaster/signers");

export const pollingSignedKey = async (token: string) => {
  while (true) {
    await new Promise((r) => setTimeout(r, 4000));
    const res = await Caller.get<ISignedKeyRequest>(`xcaster/signers?token=${token}`);
    if (res.data?.state === "completed") {
      return res;
    }
  }
};

export const getCurrentFCUser = () => Caller.get<IFCUser>("xcaster/users/me");

export const cast = (data: any) => Caller.post<string>("xcaster/casts", data);
