const MongoClient = require('mongodb').MongoClient
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
  if (!req.body.img) return

  connectToDatabase(MONGODB_URI)
    .then(async db => {
      const sheeps = db.collection('sheeps')

      // create a document to be inserted
      const doc = {
        createdAt: new Date(),
        img: req.body.img
      }
      const result = await sheeps.insertOne(doc)
      console.log(
        `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`
      )

      return res.json({ success: true })
    })
}
