import { User } from "../entity/User"
import { Arg, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql"
import { compare, hash } from 'bcryptjs'
import { sign } from "jsonwebtoken"

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
        @Arg('password') password: string
    ): Promise<LoginResponse> {
        const user = await User.findOne({ where: { email } })

        if (!user) {
            throw new Error('could not find this user')
        }

        const validPassword = await compare(password, user.password)

        if (!validPassword) {
            throw new Error('invalid credentials')
        }

        return {
            accessToken: sign({ userId: user.id }, 'asdfasdfsdjfh', { expiresIn: '3m' })
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