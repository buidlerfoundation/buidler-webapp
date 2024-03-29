import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  deleteToken,
  Messaging,
} from "firebase/messaging";
import toast from "react-hot-toast";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const firebaseApp = initializeApp(firebaseConfig);

const getDestinationRoute = (json: any) => {
  const { message_data, notification_data } = json;
  if (message_data?.entity_type === "channel") {
    return `/channels/${notification_data.community_id}/${message_data.entity_id}/message/${message_data.message_id}`;
  }
  if (message_data?.entity_type === "post") {
    return `/channels/${notification_data.community_id}/${notification_data.channel_id}/post/${message_data.entity_id}`;
  }
};

let messaging: Messaging | null = null;
isSupported().then((res) => {
  if (res) {
    messaging = getMessaging(firebaseApp);
    onMessage(messaging, (payload) => {
      const { data } = payload;
      let body = "";
      let title = "";
      let props: any = {};
      const json = data?.data ? JSON.parse(data?.data) : null;
      if (json) {
        const destination = getDestinationRoute(json);
        title = json.notification_data?.title;
        body = json.notification_data?.body;
        props = {
          subtitle: json.notification_data?.subtitle,
          onNotificationClick: (navigate: any) => {
            if (destination) {
              navigate(destination, { replace: true });
            }
          },
        };
      }
      toast.custom(body || "", {
        className: title || "",
        ariaProps: props,
      });
    });
  }
});

export const getDeviceToken = async () => {
  if (!messaging) return null;
  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return null;
    }
  }
  return getToken(messaging)
    .then((currentToken) => {
      return currentToken;
    })
    .catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
      // catch error while creating client token
      return null;
    });
};

export const removeDeviceToken = async () => {
  if (!messaging) return;
  try {
    await deleteToken(messaging);
  } catch (error) {
    console.log("An error occurred while delete token. ", error);
  }
};
