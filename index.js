const app = require('./app')
const http = require('http')
const {info , error} = require('./utils/logger')
const config = require('./utils/config')

const server = http.createServer(app)

app.listen(config.PORT, () => {
  info(`Server running on port ${config.PORT}`)
})