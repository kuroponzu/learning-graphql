module.exports = {
  // argsにはnameとdescriptionが含まれている。
  async postPhoto(parent, args){
    var newPhoto = {
      ...args.input,
      created: new Date()
    }
    photos.push(newPhoto)
    return newPhoto
  }
}
