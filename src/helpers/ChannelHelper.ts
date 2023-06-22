import { decrypt } from "eciesjs";
import CryptoJS from "crypto-js";
import { MessageData } from "models/Message";

export const normalizePublicMessageItem = (item: MessageData, key: string) => {
  const content = item.content
    ? CryptoJS.AES.decrypt(item.content, key).toString(CryptoJS.enc.Utf8)
    : "";
  if (item?.conversation_data) {
    item.conversation_data = normalizePublicMessageItem(
      item.conversation_data,
      key
    );
  }
  return {
    ...item,
    content,
  };
};

export const normalizePublicMessageData = (
  messages?: MessageData[],
  privateKey?: string,
  encryptMessageKey?: string
) => {
  if (!privateKey) return [];
  const decryptMessageKey = decrypt(
    privateKey,
    Buffer.from(encryptMessageKey || "", "hex")
  );
  const res =
    messages?.map?.((el) =>
      normalizePublicMessageItem(el, decryptMessageKey.toString())
    ) || [];
  return res.filter(
    (el) => !!el.content || el?.attachments?.length > 0
  );
};

export const validateUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    id
  );
