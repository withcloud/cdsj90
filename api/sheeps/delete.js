const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const MONGODB_URI = 'mongodb+srv://cdsj90:cdsj90@cluster0.agwmi.mongodb.net/cdsj90?retryWrites=true&w=majority'

let cachedDb = null

function connectToDatabase (uri) {
  console.log('=> connect to database')
  if (cachedDb) {
    console.log('=> using cached database instance')
    return Promise.resolve(cachedDb)
  }
  return MongoClient.connect(uri)
    .then(client => {
      cachedDb = client.db()
      return cachedDb
    })
}

export default async (req, res) => {
  if (!req.body.id) return

  connectToDatabase(MONGODB_URI)
    .then(async db => {
      const sheeps = db.collection('sheeps')

      await sheeps.updateOne({
        _id: new ObjectID(req.body.id)
      }, {
        $set: {
          deletedAt: new Date()
        }
      })
      console.log('deleted!!!', req.body.id)

      return res.json({ success: true })
    })
}
