import { createApp } from "./app.mjs";
import { makeStorage } from "./services/ipfsService.js";

const PORT = process.env.PORT || 3000;
const storage = makeStorage(); // decide mock o Storacha reale
const app = createApp({ storage });
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
