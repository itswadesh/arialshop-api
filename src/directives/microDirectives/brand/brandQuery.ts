import { SchemaDirectiveVisitor, UserInputError } from 'apollo-server-express'
import { GraphQLField, defaultFieldResolver } from 'graphql'
import { ensureSignedIn } from '../../../auth'
import { User } from '../../../models'

class brandQueryDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = async function (...args) {
      const [, , context] = args

      ensureSignedIn(context.req)
      const user = await User.findById(context.req.session.userId)
        .populate('roles')
        .select('roles')
      if (!user) throw new UserInputError('User not found')
      let authorized = false
      for (let role of user.roles) {
        if (role.name == 'super') {
          authorized = true
          break
        }
        for (let m of role.roles) {
          if (String(m) == 'brandQuery') {
            authorized = true
            break
          }
        }
      }
      if (!authorized)
        throw new UserInputError(
          'Sorry!!!. You are not authorized to access brand'
        )
      return resolve.apply(this, args)
    }
  }
}

export default brandQueryDirective
