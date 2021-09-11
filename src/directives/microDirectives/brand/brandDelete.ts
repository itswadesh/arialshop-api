import { SchemaDirectiveVisitor } from 'apollo-server-express'
import { GraphQLField } from 'graphql'
import { md } from '../md'

class brandDeleteDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    md('brandDelete', field)
  }
}

export default brandDeleteDirective
