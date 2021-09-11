import {
    IResolvers,
    UserInputError,
    AuthenticationError,
} from 'apollo-server-express'
import { fields, index } from '../utils'
  import { Request, Response, WalletDocument } from '../types'
  import { Product, User, Wallet } from '../models'
  import { argsToArgsConfig } from 'graphql/type/definition'
  
  const resolvers: IResolvers = {
    Query: {
      // To get all Users
      allTransactions: async (root, args, { req }: { req: Request }, info) => {
        try {
          return index({ model: Wallet, args, info })
        } catch (err) {
          throw new UserInputError(err)
        }
      },
  
      myTransactions: async (root, args, { req }: { req: Request }, info) => {
        const { userId } =  req.session
        try {
          args.user = userId
          return index({ model: Wallet, args, info })
        } catch (err) {
          throw new UserInputError(err)
        }
          
      },
  
      transaction: async (
        root,
        args,
        ctx,
        info
      ): Promise<WalletDocument | null> => {
        try {
          const result = await Wallet.findById(args.walletId)
          if (result == null) throw new Error('transaction id is not valid !')
          return result
        } catch (err) {
          throw new UserInputError(err)
        }
      },
    },
  
    Mutation: {
      //to save or update user
      addMoney: async (
        root,
        args,
        { req }: { req: Request },
        info
      ): Promise<WalletDocument | null> => {
        try {
          const {userId} = req.session
          // check user exist or not
          const user = await User.findById(userId)
          if (user == null) throw new Error('User not exist !')
          const wallet = new Wallet({
            user: user.id,
            amount: args.amount,
            direction: '+',
            remark: 'add money',
            balance: user.currentBalance + args.amount,
          })
          const newWallet = await wallet.save()
          await User.findByIdAndUpdate(user.id, {
            $addToSet: { walletId: newWallet.id },
          })
          await User.findByIdAndUpdate(user.id, {
            $set: { currentBalance: user.currentBalance + newWallet.amount },
          })
          return newWallet
        } catch (err) {
          throw new UserInputError(err)
        }
      },
    },
  }
  
  export default resolvers
  