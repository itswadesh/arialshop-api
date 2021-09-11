import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    medias: [Media!]
    media(id: ID!): Media
    transcodeVideo(uri: String): String
    getVideoLink(uri: String): String
  }

  extend type Mutation {
    singleUpload(
      file: Upload!
      folder: String
      productId: ID
    ): UploadedFileResponse
    fileUpload(
      files: [Upload!]
      folder: String
      productId: ID
    ): [UploadedFileResponse]
    uploadVideo(files: [Upload!], folder: String): [Video] @auth
    deleteFile(url: String): File @auth
    createMedia(
      originalFilename: String
      src: String
      path: String
      size: String
      type: String
      name: String
      use: String
      active: Boolean
    ): Media @auth
    createBlobContainer(folder: String!): UploadedFileResponse
  }

  type File {
    url: String
    filename: String
    mimetype: String
    encoding: String
  }

  type Media {
    id: ID!
    originalFilename: String
    src: String
    path: String
    size: String
    type: String
    name: String
    uid: User
    use: String
    active: Boolean
    createdAt: String!
    updatedAt: String!
  }
  type UploadedFileResponse {
    filename: String!
    mimetype: String!
    encoding: String!
    url: String!
  }
`
