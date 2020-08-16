const { ApolloServer } = require(`apollo-server`)

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
  },
  {
    "id": "2",
    "name": "Enjoy",
    "category": "SELFIE",
    "githubUser": "sSchmidt",
  },
  {
    "id": "3",
    "name": "Gunbarrel",
    "description": "25 laps",
    "category": "LANDSCAPE",
    "githubUser": "sSchmidt",
  },
]

var tags =[
  {"photoID": "1", "userID": "gPlake"},
  {"photoID": "2", "userID": "sSchmidt"},
  {"photoID": "2", "userID": "mHattrup"},
  {"photoID": "2", "userID": "gPlake"},
]

var _id = 0

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
        ...args.input
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
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen().then(({url}) => console.log(`GraphQL Service running on ${url}`))
