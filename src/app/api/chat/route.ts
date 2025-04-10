import OpenAI from "openai";
import {streamText} from 'ai';
import { DataAPIClient } from "@datastax/astra-db-ts";
import { openai } from '@ai-sdk/openai';

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
} = process.env
const open = new OpenAI({ apiKey: OPENAI_API_KEY })
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })

export async function POST(req:Request){
    try{
        const {messages}= await req.json()
        const latestmsg= messages[messages?.length-1]?.content
        let docContent=""
        const embedding=await open.embeddings.create({
            model:"text-embedding-3-small",
            input:latestmsg,
            encoding_format:"float"
        })

        try{
            const collection= await db.collection(ASTRA_DB_COLLECTION)
            const cursor=collection.find(null,{
                sort:{
                    $vector:embedding.data[0].embedding,
                },
                limit:10
            })
            const documents=await cursor.toArray()
            const docMap= documents?.map(doc=>doc.text)
            docContent=JSON.stringify(docMap)
        }
        catch(err){
            console.log("Error querying DB");
        }
        const template=`You are an AI assistant who knows everything about Database Management System.
            Use the below context to augment what you know about Database Management System subject.
            The context will provide you with one of book data of Database Management System.
            If the context doesn't include the information you need to answer based on your existing knowledge and don't mention the source of information or what the context does or doesn't include
            Format responses using markdown where applicable and don't return images
            --------------------
            START CONTEXT
            ${docContent}
            END CONTEXT
            --------------------
            QUESTION: ${latestmsg}
            --------------------
            `
        const model=openai('gpt-3.5-turbo')
        const response= await streamText({
            model:model,
            prompt:template
        })
        return response.toDataStreamResponse();
    }
    catch(err){
        throw err;
    }
}   