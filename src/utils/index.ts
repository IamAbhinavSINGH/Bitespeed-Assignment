import db from "./db";
import { Contact } from "@prisma/client";

interface ContactInfo{
    email : string | undefined
    phoneNumber : string | undefined
    linkPrecedence : Contact['linkPrecedence'],
    linkID : number | null
}

export const getContacts = async (email : string | null , phoneNumber : string | null) : Promise<Contact[] | null> => {
    try{
        if(!email && !phoneNumber) return null;

        const contacts = await db.contact.findMany({
            where : {
                OR: [
                    { email: email },
                    { phoneNumber: phoneNumber }
                ]
            },
            orderBy : {
                createdAt : "asc"
            }
        });
        
        if(!contacts || contacts.length == 0) return null;
        else return contacts;
    }catch(err){
        console.log("An error occured while fetching contact : " , err);
        return null;
    }
}

export const updatePrecedence = async(id : number , linkPrecedence : Contact['linkPrecedence']) : Promise<Contact | null> => {
    try{
        console.log("updating contact with id : " , id , linkPrecedence);
        const contact = await db.contact.update({
            where : { id : id },
            data : { linkPrecedence : linkPrecedence }
        });

        return contact;
    }catch(err){
        console.log("An error occured while updating precedence of a contact : ", err);
        return null;
    }
}

export const doesEmailExist = async(email : string) : Promise<Contact[] | null> => {
    try{
        const contacts = await db.contact.findMany({ where : { email : email } , orderBy : { createdAt : "asc" } });
        return contacts;
    }catch(err){
        console.log("An error occured while feching contacts : " , err);
        return null;
    }
}

export const doesNumberExist = async(phoneNumber : string) : Promise<Contact[] | null> => {
    try{
        const contacts = await db.contact.findMany({ where : { phoneNumber : phoneNumber } , orderBy : { createdAt : "asc" } });
        return contacts;
    }catch(err){
        console.log("An error occured while feching contacts : " , err);
        return null;
    }
}

export const getPrimaryContactUsingEmail = async (email : string) : Promise<Contact | null> => {
    try{
        const contact = await db.contact.findFirst({
            where : {
                email : email,
                linkPrecedence : "Primary"
            }
        });

        return contact;
    }catch(err){
        console.log("An error occured while fetching primary contact using email : " , err);
        return null;
    }
}

export const getPrimaryContactUsingPhoneNumber = async (phoneNumber : string) : Promise<Contact | null> => {
    try{   
        const contact = await db.contact.findFirst({
            where : {
                phoneNumber : phoneNumber,
                linkPrecedence : "Primary"
            }
        });

        return contact;
    }catch(err){
        console.log("An error occured while fetching primary contact using phone number : " , err);
        return null;
    }
}

export const createContact = async (contactInfo : ContactInfo) : Promise<Contact | null> => {
    try{    
        if(!contactInfo.email && !contactInfo.phoneNumber) return null;
    
        const contact = await db.contact.create({
            data : {
                email : contactInfo.email,
                phoneNumber : contactInfo.phoneNumber,
                linkPrecedence : contactInfo.linkPrecedence,
                linkedID : contactInfo.linkID,
                createdAt : new Date(),
                updatedAt : new Date()
            }
        });
        
        return contact;
    }catch(err) {
        console.log("An error occured while creating a contact : " , err);
        return null;
    }
}

