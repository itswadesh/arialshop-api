import { gql } from 'apollo-server-express'

export default gql`
  directive @super on FIELD_DEFINITION
  directive @admin on FIELD_DEFINITION
  directive @manager on FIELD_DEFINITION
  directive @vendor on FIELD_DEFINITION
  directive @support on FIELD_DEFINITION
  directive @auth on FIELD_DEFINITION
  directive @guest on FIELD_DEFINITION
  directive @demo on FIELD_DEFINITION
  directive @store on FIELD_DEFINITION
  #brand microDirectives
  directive @brandDelete on FIELD_DEFINITION
  directive @brandQuery on FIELD_DEFINITION
  directive @brandSave on FIELD_DEFINITION
  #category microDirectives
  directive @categoryDelete on FIELD_DEFINITION
  directive @categoryQuery on FIELD_DEFINITION
  directive @categorySave on FIELD_DEFINITION

  type Query {
    _: String
  }

  type Mutation {
    _: String
  }

  type Subscription {
    _: String
  }
`
