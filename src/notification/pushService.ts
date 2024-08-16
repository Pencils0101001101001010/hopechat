import { env } from "@/env";
import { getReadyServiceWorker } from "@/utils/serviceWorker";


export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
    const sw = await getReadyServiceWorker();
    return sw.pushManager.getSubscription();
}


export async function registerPushNotifications() {
 if(!("PushManager" in window)) {
    throw Error("push notifications are not supported by this browser")
 }
   const existingSubscription = await getCurrentPushSubscription();

   if (existingSubscription) {
    throw Error("Existing push Subscription found")
   }

   const sw = await getReadyServiceWorker();

   const subscription =  await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,

   })

   await sendPushSubscriptionToServer(subscription);

}

export async function unregisterPushNotification() {
    const existingSubscription = await getCurrentPushSubscription();

    if(!existingSubscription) {
        throw Error("No existing push Subscription found")
    }

    await deletePushSubscriptionFromServer(existingSubscription);

    await existingSubscription.unsubscribe();
}

export async function sendPushSubscriptionToServer(subscription: PushSubscription) {
    const response = await fetch("/api/register-push", {
        method: "POST",
        body: JSON.stringify(subscription)
    })

    if(!response.ok) {
        throw Error("Failed to register push subscription")
    }
}


export async function deletePushSubscriptionFromServer(subscription: PushSubscription) {
    const response = await fetch("/api/register-push", {
        method: "DELETE",
        body: JSON.stringify(subscription)
    })

    if(!response.ok) {
        throw Error("Failed to register DELETE subscription")
    }
}