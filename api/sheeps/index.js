const MongoClient = require('mongodb').MongoClient
const uri = 'mongodb+srv://cdsj90:cdsj90@cluster0.agwmi.mongodb.net/cdsj90?retryWrites=true&w=majority'
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

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

  try {
    await client.connect()
    const db = client.db()
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
  } catch (error) {
    console.log(error)
  } finally {
    await client.close()
  }
}
