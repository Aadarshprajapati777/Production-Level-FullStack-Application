import express from 'express';  
import cookieParser from "cookie-parser";
import cors from "cors";



const app= express();
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json({limit:"50kb"}));
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(cookieParser());



//importing routes
import userRouter from "./routes/user.route.js";



//routes decalration, version 1
app.use("/api/v1/user", userRouter);


export default app;