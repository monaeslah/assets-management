'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
// We reuse this import in order to have access to the `body` property in requests
const express_1 = __importDefault(require('express'))
// ℹ️ Responsible for the messages you see in the terminal as requests are coming in
// https://www.npmjs.com/package/morgan
const morgan_1 = __importDefault(require('morgan'))
// ℹ️ Needed when we deal with cookies (we will when dealing with authentication)
// https://www.npmjs.com/package/cookie-parser
const cookie_parser_1 = __importDefault(require('cookie-parser'))
// ℹ️ Needed to accept from requests from 'the outside'. CORS stands for cross origin resource sharing
// unless the request if from the same domain, by default express wont accept POST requests
const cors_1 = __importDefault(require('cors'))
const FRONTEND_URL = process.env.ORIGIN || 'http://localhost:5173'
// Middleware configuration
exports.default = app => {
  // Because this is a server that will accept requests from outside and it will be hosted ona server with a `proxy`, express needs to know that it should trust that setting.
  // Services like heroku use something called a proxy and you need to add this to your server
  app.set('trust proxy', 1)
  // controls a very specific header to pass headers from the frontend
  app.use(
    (0, cors_1.default)({
      origin: [FRONTEND_URL],
      credentials: true,
      allowedHeaders: ['Authorization', 'Content-Type']
    })
  )
  // In development environment the app logs
  app.use((0, morgan_1.default)('dev'))
  // To have access to `body` property in the request
  app.use(express_1.default.json())
  app.use(express_1.default.urlencoded({ extended: false }))
  app.use((0, cookie_parser_1.default)())
}
