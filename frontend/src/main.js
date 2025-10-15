import { createApp } from "vue";
import "./global.css";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
app.use(router); // <-- install the router
app.mount("#app");
