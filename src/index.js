import { connectDb } from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
})

connectDb()
.then(() => {
    app.on("error", (err) => {
        console.log(err);
        throw err;
    })
    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    })
}).catch( (err) => {
    console.error("MongoDB connection Failed: ", err);
    throw err
})