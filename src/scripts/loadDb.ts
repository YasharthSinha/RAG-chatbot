import { DataAPIClient } from "@datastax/astra-db-ts";
// import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import OpenAI from "openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";
import pdf from 'pdf-parse';
import fs from "fs";
import path from "path";


type SimilarityMetric = "dot_product" | "cosine" | "euclidean"
const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
} = process.env

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
// const eduData = [
//     'https://www.tutorialspoint.com/operating_system/index.htm',
//     'https://www.tpointtech.com/operating-system',
//     'https://www.interviewbit.com/operating-system-interview-questions/',
//     'https://www.lambdatest.com/learning-hub/operating-system-interview-questions'
// ]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })


const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})


const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
        vector: {
            dimension: 1536,
            metric: similarityMetric
        }
    })
    console.log(res)
}

// const loadSampleData = async()=>{
//     const collection = await db.collection(ASTRA_DB_COLLECTION)
//     for await (const url of eduData){
//         const content=await scrapePage(url)
//         const chunks= await splitter.splitText(content)
//         for await(const chunk of chunks){
//             const embedding= await openai.embeddings.create({
//                 model:"text-embedding-3-small",
//                 input:chunk,
//                 encoding_format:"float"
//             })
//             const vector= embedding.data[0].embedding

//             // const vector= await getEmbedding(chunk)
//             const res= await collection.insertOne({
//                 $vector:vector,
//                 text:chunk
//             })
//             console.log(res)
//         }
//     }
// }


// const scrapePage = async(url:string)=>{
//     const loader=new PuppeteerWebBaseLoader(url,{
//         launchOptions:{
//             headless:true
//         },
//         gotoOptions:{
//             waitUntil:"domcontentloaded"
//         },
//         evaluate:async(page,browser)=>{
//             const result= await page.evaluate(()=>document.body.innerHTML)
//             await browser.close()
//             return result
//         }
//     })
//     const scrapedContent= await loader.scrape()
//     const cleanedContect= scrapedContent?.replace(/<[^>]*>?/gm,'')
//     return cleanedContect
// }

// createCollection().then(()=>loadSampleData())

const loadPDFData = async (pdfPaths: string[]) => {
    const collection = await db.collection(ASTRA_DB_COLLECTION);
    for (const x of pdfPaths) {
        const content = await ExtractText(x);
        const chunks = await splitter.splitText(content);
        for (const chunk of chunks) {
            const embedding = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: chunk,
                encoding_format: 'float'
            })
            const vector = embedding.data[0].embedding;
            const res = await collection.insertOne({
                $vector: vector,
                text: chunk
            })
            console.log(res)
        }
        console.log(chunks);
    }
}

const ExtractText= async(pdfFilePath:string):Promise<string>=>{
    const pdfbuffer=fs.readFileSync(pdfFilePath);
    const data= await pdf(pdfbuffer);
    return data.text;
}

const processmultiple= async()=>{
    const mainpath= path.join(__dirname,"..","app","assests")
    const pdfPaths=[
        path.join(mainpath,'dbms_book.pdf'),
    ]
    await loadPDFData(pdfPaths);
}
createCollection().then(()=>processmultiple());