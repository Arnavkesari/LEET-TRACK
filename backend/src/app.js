import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import 
import userRouter from "./routes/user.routes.js"
import authRouter from "./routes/auth.routes.js"
import friendsRouter from "./routes/friends.routes.js"
import scraperRouter from "./routes/scraper.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import { errorHandler } from "./utils/errorHandler.js";

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/friends", friendsRouter)
app.use("/api/v1/scraper", scraperRouter)
app.use("/api/v1/dashboard", dashboardRouter)

// Centralized Error Handling
app.use(errorHandler);

export { app }