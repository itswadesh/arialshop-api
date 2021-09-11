import { SchemaDirectiveVisitor, UserInputError } from 'apollo-server-express'
import { GraphQLField, defaultFieldResolver } from 'graphql'
import { ensureSignedIn } from '../auth'
import { User, Setting } from '../models'
class VendorDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = async function (...args) {
      const [, , context] = args

      const settings = await Setting.findOne().select('demo')
      ensureSignedIn(context.req)
      const user = await User.findById(context.req.session.userId)
      if (!user) throw new UserInputError('User not found')
      if (settings && settings.demo)
        throw new UserInputError('This action is restriced in demo mode')
      return resolve.apply(this, args)
    }
  }
}

export default VendorDirective
