const MongoClient = require('mongodb').MongoClient
const uri = 'mongodb+srv://cdsj90:cdsj90@cluster0.agwmi.mongodb.net/cdsj90?retryWrites=true&w=majority'
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

export default async (req, res) => {
  if (!req.body.img) return

  try {
    await client.connect()
    const db = client.db()
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
  } finally {
    await client.close()
  }

  return res.json({ success: true })
}
