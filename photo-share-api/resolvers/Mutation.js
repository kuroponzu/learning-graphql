const { authorizeWithGithub } = require('../lib')
const fetch = require('node-fetch')

module.exports = {
  // argsにはnameとdescriptionが含まれている。
  async postPhoto(parent, args, { db, currentUser }){

    if(!currentUser){
      throw new Error('only an authorized user can post a photo')
    }

    var newPhoto = {
      ...args.input,
      userID: currentUser.githubLogin,
      created: new Date()
    }
    await db.collection('photos').insertOne(newPhoto,function(err,docsInserted){
    })
    return newPhoto
  },

  async githubAuth(parent, { code }, { db }) {
    let {
      message,
      access_token,
      avatar_url,
      login,
      name
    } = await authorizeWithGithub({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    })

    if (message){
      throw new Error(message)
    }

    let latestUserInfo = {
      name,
      githubLogin: login,
      githubToken: access_token,
      avatar: avatar_url
    }

    const{ ops:[user] } = await db
      .collection('users')
      .replaceOne({ githubLogin: login}, latestUserInfo, { upsert: true })
    
    return { user, token: access_token }
  },

  addFakeUsers: async(root, {count}, {db}) => {
    var randomUserApi = `https://randomuser.me/api/?results=${count}`

    var { results } = await fetch(randomUserApi).then(res => res.json())

    var users = results.map(r => ({
      githubLogin: r.login.username,
      name: `${r.name.first} ${r.name.last}`,
      avator: r.picture.thumbnail,
      githubToken: r.login.sha1
    }))
    console.log(users)
    await db.collection('users').insertMany(users)

    return users
  },

  async fakeUserAuth(parent, { githubLogin }, { db }){
    var user = await db.collection(`users`).findOne({ githubLogin })
    if(!user){
      throw new Error(`Cannot find user with githubLogin ${githubLogin}`)
    }
    return {
      token: user.githubToken,
      user
    }
  }
}
