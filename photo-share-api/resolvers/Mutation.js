const { authorizeWithGithub } = require('../lib')

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
  }
}
