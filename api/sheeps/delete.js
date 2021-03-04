const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const uri = 'mongodb+srv://cdsj90:cdsj90@cluster0.agwmi.mongodb.net/cdsj90?retryWrites=true&w=majority'
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

export default async (req, res) => {
  if (!req.body.id) return

  try {
    await client.connect()
    const db = client.db()
    const sheeps = db.collection('sheeps')

    await sheeps.updateOne({
      _id: new ObjectID(req.body.id)
    }, {
      $set: {
        deletedAt: new Date()
      }
    })
    console.log('deleted!!!', req.body.id)
  } finally {
    await client.close()
  }

  return res.json({ success: true })
}
