export default (req, res) => {
  console.log(req.url, req.params, req.body)
  return res.json({
    success: true
  })
}
