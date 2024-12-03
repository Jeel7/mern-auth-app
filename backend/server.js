import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import path from 'path'
import cookieParser from 'cookie-parser'
import {connectToDB} from './database/db.js'
import authRoutes from './routes/auth-route.js'

const app = express()

app.use(cors({origin: "http://localhost:5173", credentials: true}))

app.use(express.json())
app.use(cookieParser()) //it parsers next incoming cookies

const __dirname = path.resolve()

//main route
app.use("/api/auth", authRoutes)

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "/frontend/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
    })
}

app.listen(process.env.PORT, () => {  
    connectToDB()                    
    console.log("Server is running")
})

