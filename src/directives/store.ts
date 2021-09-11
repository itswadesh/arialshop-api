import { SchemaDirectiveVisitor, UserInputError } from 'apollo-server-express'
import { GraphQLField, defaultFieldResolver } from 'graphql'
import { ensureSignedIn } from '../auth'
import { User, Setting, Store } from '../models'
class StoreDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = async function (...args) {
      const [, , context] = args

      const settings = await Setting.findOne().select('isMultiStore')
      const store = await Store.findOne({
        user: context.req.session.userId,
      }).select('name')
      if (!store && settings.isMultiStore)
        throw new Error('You have not own a store')
      return resolve.apply(this, args)
    }
  }
}

export default StoreDirective
