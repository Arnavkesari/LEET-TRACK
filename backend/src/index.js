import 'dotenv/config';

import connectDB from "./db/index.js";
import { app } from './app.js';

const port = process.env.PORT || 8000;

// Database connection and server startup
connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`Server is running at port : ${port}`);
    });
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
});
