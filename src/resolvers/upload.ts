import { IResolvers } from 'apollo-server-express'
const {
  GraphQLUpload, // The GraphQL "Upload" Scalar
} = require('graphql-upload')
const resolvers: IResolvers = {
  Upload: GraphQLUpload,
}

export default resolvers
