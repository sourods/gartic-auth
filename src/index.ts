import express from "express"
import 'reflect-metadata'
import { graphqlHTTP } from 'express-graphql'
import { buildSchema } from "type-graphql"
import { UserResolver } from "./resolver/UserResolver"
import { createConnection } from "typeorm"

async function connect() {
    const app = express()
    await createConnection()
    app.use('/health_check', (_, res) => res.sendStatus(200))
    app.use('/graphql', graphqlHTTP({
        schema: await buildSchema({
            resolvers: [UserResolver]
        }),
      }))
    app.listen(3000)
    console.log(`🚀 Server ready at http://localhost:3000`)
    return { app }
}

connect()