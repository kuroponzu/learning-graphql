const { ApolloServer } = require(`apollo-server`)
const { GraphQLScalarType } = require("graphql")

const typeDefs = `

  type User{
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }

  enum PhotoCategory{
    SELFIL
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers: [User!]!
    created: DateTime!
  }

  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`

var users = [
  { "githubLogin": "mHattrup", "name": "Mike Hattrup"},
  { "githubLogin": "gPlake", "name": "Glen Plake"},
  { "githubLogin": "sSchmidt", "name": "Scot Schemidt"},
]

var photos = [
  {
    "id": "1",
    "name": "Dropping",
    "description": "The Heart",
    "category": "ACTION",
    "githubUser": "gPlake",
    "created": "3-28-1997"
  },
  {
    "id": "2",
    "name": "Enjoy",
    "category": "SELFIE",
    "githubUser": "sSchmidt",
    "created": "3-28-1998"
  },
  {
    "id": "3",
    "name": "Gunbarrel",
    "description": "25 laps",
    "category": "LANDSCAPE",
    "githubUser": "sSchmidt",
    "created": "3-28-1999"
  },
]

var tags =[
  {"photoID": "1", "userID": "gPlake"},
  {"photoID": "2", "userID": "sSchmidt"},
  {"photoID": "2", "userID": "mHattrup"},
  {"photoID": "2", "userID": "gPlake"},
]

var _id = 0

const { GraphQLScalarType } = require(`graphql`)

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },
  Mutation:{
    // argsにはnameとdescriptionが含まれている。
    postPhoto(parent, args){
      var newPhoto = {
        id: _id++,
        ...args.input,
        created: new Date()
      }
      photos.push(newPhoto)
      return newPhoto
    }
  },
  Photo:{
    url: parent => `http://yoursite.som/img/${ parent.id }.jpg`,
    postedBy: parent => {
      return users.find(u => u.githubLogin === parent.githubUser)
    },
    taggedUsers: parent => tags
    .filter(tag => tag.photoID === parent.id)
    .map(tag => tag.userID)
    .map(userID => users.find(u => u.githubLogin === userID))
  },
  User: {
    postedPhotos: parent => {
      return photos.filter(p => p.githubUser === parent.githubLogin)
    },
    inPhotos: parent => tags
      .filter(tag => tag.userID === parent.id)
      .map(tag => tag.photoID)
      .map(photoID => photos.find(p => p.id === photoID))
  },
  DaetTime: new GraphQLScalarType({
    name: `DateTime`,
    description: `A valid date time value`,
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  })
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen().then(({url}) => console.log(`GraphQL Service running on ${url}`))
