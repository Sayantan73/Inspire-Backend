import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { userRouter } from "./routes/user.route.js";
import { pinRouter } from "./routes/pin.route.js";

const app = express();

app.use( cors({
    origin: 'https://inspireimg.vercel.app',
    credentials: true
}))

app.use(express.json( {limit: "16kb"} ));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser())

app.use("/api/user", userRouter);
app.use("/api/pin", pinRouter);

// Error handling middleware
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const errorMessage = error.message || 'Internal Server Error';
  const errorStack = error.stack || '';

// Log the error to a file or logging service
  console.error(`Error ${statusCode}: ${errorMessage}`);
  console.error(errorStack);

  res.status(statusCode).json({
    error: {
      message: errorMessage,
      statusCode: statusCode,
      stack: errorStack,
    },
  });
});

export {app}
