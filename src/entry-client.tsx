// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import { registerSW } from "virtual:pwa-register";

if (typeof window !== "undefined") {
  registerSW({ immediate: true });
}

mount(() => <StartClient />, document.getElementById("app")!);
