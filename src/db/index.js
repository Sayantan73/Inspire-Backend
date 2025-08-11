import mongoose from "mongoose";

const connectDb = async ()=> {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`);
        console.log(`\n MongoDB connected || DB host: ${connectionInstance.connection.host} \n`);
    } catch (error) {
        console.error("DB connection error", error);
        process.exit(1);
    }
}

export {connectDb};