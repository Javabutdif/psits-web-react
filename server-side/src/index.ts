import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import cron from "node-cron";

// Routes Import
import { checkPromos } from "./custom_function/check_promo";
import adminRoutes from "./routes/admin.route";
import authV2Routes from "./routes/authV2.route";
import cartRoutes from "./routes/cart.route";
import documentationRoutes from "./routes/documentation.route";
import eventRoutes from "./routes/events.route";
import eventsV2Routes from "./routes/eventsV2.route";
import indexRoutes from "./routes/index.route";
import logRoutes from "./routes/logs.route";
import merchRoutes from "./routes/merchandise.route";
import orderRoutes from "./routes/orders.route";
import privateRoutes from "./routes/private.route";
import promoRoutes from "./routes/promo.route";
import studentRoutes from "./routes/students.route";
import studentV2Routes from "./routes/studentsV2.route";
import indexV2Routes from "./routes/index.v2.route";
import { errorHandler } from "./util/errors.util";

dotenv.config();

const app: Express = express();

const allowedOrigins = [
  process.env.CORS,
  process.env.CORS2,
  process.env.CORS3,
].filter((origin): origin is string => Boolean(origin));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.set("trust proxy", 1);
app.use(bodyParser.json());

// Routes
app.use("/api", indexV2Routes);
app.use("/api", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/merch", merchRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/promo", promoRoutes);
app.use("/api", privateRoutes);
app.use("/api/docs", documentationRoutes);
app.use("/api/v2/auth", authV2Routes);
app.use("/api/v2/events", eventsV2Routes);
app.use("/api/v2/students", studentV2Routes);

app.use(errorHandler);

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Missing required env: MONGODB_URI");
    }

    const port = Number(process.env.PORT) || 5000;

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME ?? "psits-test",
    });

    console.log(
      `MongoDB PSITS Connected [${process.env.DB_NAME ?? "psits-test"}]`
    );
    console.log(
      `Allowed CORS origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(", ") : "none configured"}`
    );

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server started, listening at port ${port}`);
    });

    cron.schedule("0 0 * * *", async () => {
      console.log("Running daily promo check...");
      await checkPromos();
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
}

startServer();
