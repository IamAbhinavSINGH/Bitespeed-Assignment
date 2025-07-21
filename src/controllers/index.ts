import { createContact, doesEmailExist, doesNumberExist, getContacts, getPrimaryContactUsingEmail, getPrimaryContactUsingPhoneNumber, updatePrecedence } from "../utils";

interface ContactRequest{
    email : string | null,
    phoneNumber : string | null
}

interface ContactResponse{
    primaryContactId : number,
    emails : string[],
    phoneNumbers : string[],
    secondaryContactIds : number[]
}

export const parseContactRequest =  async (contactRequest : ContactRequest) : Promise<ContactResponse | null> => {
    if(contactRequest.email && contactRequest.phoneNumber){
        return parseContactRequestWithEmailAndPhoneNumber(contactRequest);
    }
    else if(contactRequest.email){
        return parseContactRequestWithEmail(contactRequest.email);
    }
    else if(contactRequest.phoneNumber){
        return parseContactRequestWithPhoneNumber(contactRequest.phoneNumber);
    }

    return null;
}

const parseContactRequestWithPhoneNumber = async(phoneNumber : string) : Promise<ContactResponse | null> => {
    try{
        var contacts = await doesNumberExist(phoneNumber);
        if(contacts === null || contacts.length === 0){
            const contact = await createContact({
                email : undefined,
                phoneNumber : phoneNumber,
                linkID : null,
                linkPrecedence : "Primary"
            });

            if(contact == null) return null;
            else return {
                primaryContactId : contact.id,
                emails : [],
                phoneNumbers : [contact.phoneNumber!],
                secondaryContactIds : []
            }            
        }

        return getAllContacts({ email : contacts[0].email , phoneNumber : phoneNumber });
    }catch(err){
        console.log("An error occured while parsing contacts with email : " , err);
        return null;
    }
}

const parseContactRequestWithEmail = async(email : string) : Promise<ContactResponse | null> => {
    try{
        var contacts = await doesEmailExist(email);
        if(contacts === null || contacts.length === 0){
            const contact = await createContact({
                email : email,
                phoneNumber : undefined,
                linkID : null,
                linkPrecedence : "Primary"
            });

            if(contact == null) return null;
            else return {
                primaryContactId : contact.id,
                emails : [contact.email!],
                phoneNumbers : [],
                secondaryContactIds : []
            }            
        }

        return getAllContacts({ email : email , phoneNumber : contacts[0].phoneNumber });
    }catch(err){
        console.log("An error occured while parsing contacts with email : " , err);
        return null;
    }
}

const parseContactRequestWithEmailAndPhoneNumber = async (contactRequest : ContactRequest) : Promise<ContactResponse | null> => {
    try{
        const emailContacts = await doesEmailExist(contactRequest.email!);
        const numberContacts = await doesNumberExist(contactRequest.phoneNumber!);
        const emailExist = emailContacts === null ? false : emailContacts.length > 0;
        const phoneNumberExist = numberContacts === null ? false : numberContacts.length > 0;

        if(emailExist && phoneNumberExist){
            if(emailContacts![0].id !== numberContacts![0].id){
                await updatePrecedence(
                    emailContacts![0].createdAt < numberContacts![0].createdAt ? numberContacts![0].id : emailContacts![0].id , 
                    "Secondary"
                );
            }

            return getAllContacts(contactRequest);
        }
        else if(emailExist && !phoneNumberExist){
            const primaryContact = await getPrimaryContactUsingEmail(contactRequest.email!);
            if(primaryContact == null){
                console.log("no primary contact found with the given email : " , contactRequest.email);
                return null;
            } 

            await createContact({
                email : contactRequest.email!,
                phoneNumber : contactRequest.phoneNumber!,
                linkID : primaryContact.id,
                linkPrecedence : "Secondary"
            });

            return getAllContacts(contactRequest);
        }
        else if(phoneNumberExist && !emailExist){
            const primaryContact = await getPrimaryContactUsingPhoneNumber(contactRequest.phoneNumber!);
            if(primaryContact == null){
                console.log("no primary contact found with the given number : " , contactRequest.phoneNumber);
                return null;
            } 

            await createContact({
                email : contactRequest.email!,
                phoneNumber : contactRequest.phoneNumber!,
                linkID : primaryContact.id,
                linkPrecedence : "Secondary"
            })

            return getAllContacts(contactRequest);
        }

        const newContact = await createContact({
            email : contactRequest.email!,
            phoneNumber : contactRequest.phoneNumber!,
            linkID : null,
            linkPrecedence : "Primary"
        });
        if(newContact == null) {
            console.log("Failed to create a new contact!!");
            return null;
        }

        return {
            primaryContactId : newContact.id,
            emails : [newContact.email!],
            phoneNumbers : [newContact.phoneNumber!],
            secondaryContactIds : []
        }
    }catch(err){
        console.log("An error occured while parsing contacts : " , err);
        return null;
    }
};

const getAllContacts = async (contactReq : ContactRequest) : Promise<ContactResponse | null> => {
    try{
        const contacts = await getContacts(contactReq.email , contactReq.phoneNumber);
        if(contacts == null || contacts.length == 0) {
            console.log("No contacts found with the given req : " , contactReq.email , contactReq.phoneNumber); 
            return null;
        }

        return {
            primaryContactId : contacts[0].id,
            emails : Array.from(new Set(contacts.map((_contact) => _contact.email).filter((_email): _email is string => _email !== null))),
            phoneNumbers : Array.from(new Set(contacts.map((_contact) => _contact.phoneNumber).filter((_number): _number is string => _number !== null))),
            secondaryContactIds : contacts.slice(1).map((_contact) => _contact.id)
        }
    }catch(err){
        return null;
    }
}