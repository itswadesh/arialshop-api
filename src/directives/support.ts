import { SchemaDirectiveVisitor, UserInputError } from 'apollo-server-express'
import { GraphQLField, defaultFieldResolver } from 'graphql'
import { ensureSignedIn } from '../auth'
import { User } from '../models'

class SupportDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = async function (...args) {
      const [, , context] = args

      ensureSignedIn(context.req)
      const user = await User.findById(context.req.session.userId)
      if (!user) throw new UserInputError('User not found')
      if (
        user.role !== 'support' &&
        user.role !== 'vendor' &&
        user.role !== 'manager' &&
        user.role !== 'admin' &&
        user.role !== 'super'
      )
        throw new UserInputError(
          'Sorry!!!. Only vendor/manager/admin can access this'
        )
      return resolve.apply(this, args)
    }
  }
}

export default SupportDirective
