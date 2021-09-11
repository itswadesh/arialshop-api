import { SchemaDirectiveVisitor, UserInputError } from 'apollo-server-express'
import { GraphQLField, defaultFieldResolver } from 'graphql'
import { ensureSignedIn } from '../auth'
import { User } from '../models'

class AdminDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = async function (...args) {
      const [, , context] = args

      ensureSignedIn(context.req)
      const user = await User.findById(context.req.session.userId)
      if (!user) throw new UserInputError('User not found')
      // console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzz', user.email)
      if (user.role !== 'admin' && user.role !== 'super')
        throw new UserInputError('Sorry!!!. Only admin can access this')
      return resolve.apply(this, args)
    }
  }
}

export default AdminDirective
