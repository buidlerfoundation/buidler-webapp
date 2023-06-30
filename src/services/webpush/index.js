export const testNotification = async () => {
  const registration = await navigator.serviceWorker.register("/sw.js");

  const result = await window.Notification.requestPermission();

  // If the user rejects the permission result will be "denied"
  if (result === "granted") {
    // You must use the service worker notification to show the notification
    // Using new Notification("Hello World", { body: "My first notification on iOS"}) does not work on iOS
    // despite working on other platforms
    await registration.showNotification("Hello World", {
      body: "My first notification on iOS",
    });
  }
};
