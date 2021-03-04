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
  const before = req.query.cursor || req.query.before
  const after = req.query.after
  const limit = req.query.limit ? parseInt(req.query.limit) : 10

  const filter = {
    $lt: before ? new Date(before) : new Date()
  }
  if (after) {
    filter.$gt = new Date(after)
  }

  connectToDatabase(MONGODB_URI)
    .then(async db => {
      const sheeps = db.collection('sheeps')

      const cursor = sheeps
        .find({
          createdAt: filter,
          deletedAt: { $exists: false }
        }, {
          sort: { createdAt: -1 }
        })
        .limit(limit || 10)

      const result = await cursor.toArray()

      return res.json({
        success: true,
        data: {
          sheeps: result || []
        }
      })
    })
}
