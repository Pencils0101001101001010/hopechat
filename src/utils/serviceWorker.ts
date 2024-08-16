export async function registerServiceWorker() {
    if(!("serviceWorker" in navigator)) {
        throw new Error("Service worker not supported on this browser");
    }
    await navigator.serviceWorker.register("/serviceWorker.js");
}

export async function getReadyServiceWorker(){
    if(!("serviceWorker" in navigator)) {
        throw new Error("Service worker not supported on this browser");
    }
    return navigator.serviceWorker.ready;  
}