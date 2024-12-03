import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'

export const connectToDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Mongodb is connected")
    }catch(e){
        console.log(e)
        process.exit(1)
    }
}
