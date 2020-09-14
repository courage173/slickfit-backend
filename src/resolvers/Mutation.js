const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutations = {
    async createItem(parent, args, ctx, info) {
        const item = await ctx.db.mutation.createItem({
            data: {
                ...args
            }
        }, info)
        return item
    },
    async updateItem(parent, args, ctx, info) {
        const updates = { ...args }
        delete updates.id
        return await ctx.db.mutation.updateItem({
            data: updates,
            where: {
                id: args.id
            }
        },
            info)
    },
    async deleteItem(parent, args, ctx, info) {
        const where = { id: args.id }
        //find the item
        const item = await ctx.db.query.item({ where }, `{id title}`)
        //TODO- check for user permision
        return ctx.db.mutation.deleteItem({ where }, info)
    },
    async signup(parent, args, ctx, info) {

        //lowercase email
        args.email = args.email.toLowerCase()
        //harsh the pasword
        const password = await bcrypt.hash(args.password, 10)
        //create users
        const user = await ctx.db.mutation.createUser(
            {
                data: {
                    ...args,
                    password,
                    permissions: { set: ['USER'] },
                },
            },
            info
        );

        //create token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
        //set cookies on the response
        ctx.response.cookie('token', token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365
        })
        return user
    }
};

module.exports = Mutations;
