import { Router } from "express";
import type { Request, Response } from "express";
import z from 'zod';

const router = Router();
const identifySchema = z.object({
    email : z.string().optional(),
    phoneNumber : z.string().optional()
})

router.get('/identify' , (req : Request , res : Response) => {
    try{
        const parsedSchema = identifySchema.safeParse(req.body);
        if(!parsedSchema.success || (!parsedSchema.data.email && !parsedSchema.data.phoneNumber)){
            res.status(401).json({ error : "Invalid Schema!!" });
            return;
        }

        

    }catch(err){
        console.log("An error occured in identify endpoint : " , err);
        res.status(500).json({ error : "Internal Server Error!!" });
        return;
    }
});

export default router;