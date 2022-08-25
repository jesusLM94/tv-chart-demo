const express = require('express')
const path = require("path")
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express()
const port = 8080


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"))
})

// Static sources
app.use('/charting_library_clonned_data', express.static(path.join(__dirname, '/charting_library_clonned_data')))
app.use('/src', express.static(path.join(__dirname, '/src')))

// Proxy to Bittrex API
app.use('/v3', createProxyMiddleware({ target: 'https://api.bittrex.com/', changeOrigin: true }));

app.set('port', port);
app.listen(app.get('port'), () => {
  console.log(`Trading View Charting Library listening on port ${port}`)
})
