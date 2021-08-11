import { Response, Request } from 'express'
import { User } from "../entity/User"
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql"
import { compare, hash } from 'bcryptjs'
import { sign } from "jsonwebtoken"

interface Context {
    req: Request,
    res: Response
}

const createAccessToken = (userId: number) => sign({ userId }, 'asdfasdfsdjfh', { expiresIn: '3m' })
const createRefreshToken = (userId: number) => sign({ userId }, 'okkookoijinooihdsfa', { expiresIn: '7d' })

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string
}

@Resolver()
export class UserResolver {
    @Query(() => [User])
    users() {
        return User.find()
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() { res }: Context
    ): Promise<LoginResponse> {
        const user = await User.findOne({ where: { email } })

        if (!user) {
            throw new Error('could not find this user')
        }

        const validPassword = await compare(password, user.password)

        if (!validPassword) {
            throw new Error('invalid credentials')
        }

        //login success

        res.cookie('jid', createRefreshToken(user.id), {
            httpOnly: true,
        })

        return {
            accessToken: createAccessToken(user.id)
        }
    }

    @Mutation(() => Boolean)
    async register(
        @Arg('email') email: string,
        @Arg('password') password: string
    ) {
        try {
            const hashedPassword = await hash(password, 10)
            await User.insert({
                email,
                password: hashedPassword
            })
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }
}