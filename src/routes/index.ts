import { Router } from "express";
import type { Request, Response } from "express";
import z from 'zod';
import { parseContactRequest } from "../controllers";

const router = Router();
const identifySchema = z.object({
    email : z.email().nullable(),
    phoneNumber : z.string().nullable()
})

router.post('/identify' , async (req : Request , res : Response) => {
    try{
        const parsedSchema = identifySchema.safeParse(req.body);
        if(!parsedSchema.success || (!parsedSchema.data.email && !parsedSchema.data.phoneNumber)){
            res.status(401).json({ error : "Invalid Schema!!" });
            return;
        }

        const contacts = await parseContactRequest({ email : parsedSchema.data.email , phoneNumber : parsedSchema.data.phoneNumber });
        if(contacts === null){
            res.status(500).json({ error : "Failed to fetch contacts!!" });
            return;
        }

        res.json({ contacts });
        return;
    }catch(err){
        console.log("An error occured in identify endpoint : " , err);
        res.status(500).json({ error : "Internal Server Error!!" });
        return;
    }
});

export default router;