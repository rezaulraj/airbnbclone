import cors from "cors";

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
};

export default cors(corsOptions);
