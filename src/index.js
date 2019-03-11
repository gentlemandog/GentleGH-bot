import Telegram from './telegram'
import authentication from './authentication'

let tg = new Telegram(authentication.telegram_token)

var createHandler = require('github-webhook-handler')
var http = require('http')

var handler = createHandler({
    path: '/webhook',
    secret: '1234'
})

http.createServer((req, res) => {
    handler(req, res, (err) => {
        res.StatusCode = 404
        res.end('No such location')
    })
}).listen(7777)

handler.on('issues', function (event) {
    console.log('Received an issue event for %s action=%s: #%d %s',
      event.payload.repository.name,
      event.payload.action,
      event.payload.issue.number,
      event.payload.issue.title)
})
