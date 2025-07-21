import dotenv from 'dotenv'
dotenv.config();

import express , { Request , Response } from 'express'
import cors from 'cors';
import router from './routes/index';

const app = express();
app.use(express.json());

app.use(
    cors({
        origin : "*",
        allowedHeaders : "*"
    })
);

app.use('/api/v1' , router);

app.get('/' , (req : Request , res : Response) => {
    res.status(200).json({
        message : "The server is running fine!!"
    });
    return;
});


const PORT = process.env.BACKEND_PORT || '3000';
app.listen(PORT , () => {
    console.log("Server started listening on PORT : " , PORT);
});