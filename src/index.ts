import express from "express"
import 'reflect-metadata'
import { graphqlHTTP } from 'express-graphql'
import { buildSchema } from "type-graphql"
import { UserResolver } from "./resolver/UserResolver"
import { createConnection } from "typeorm"

async function connect() {
    const app = express()
    //Database connection
    try {
        await createConnection()
    } catch (error) {
        throw new Error('Could not connect to database')
    }
    app.use('/health_check', (_, res) => res.sendStatus(200))
    app.use('/graphql', graphqlHTTP(async (req, res) => ({
        schema: await buildSchema({
            resolvers: [UserResolver]
        }),
        context: {
            req,
            res,
        }
      })))
    app.listen(3000)
    console.log(`🚀 Server ready at http://localhost:3000`)
    return { app }
}

connect()