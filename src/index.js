import Telegram from './telegram'
import authentication from './authentication'

let tg = new Telegram(authentication.telegram_token)

var createHandler = require('github-webhook-handler')
var http = require('http')

var handler = createHandler({
    path: '/webhook',
    secret: '123456'
})

http.createServer((req, res) => {
    handler(req, res, (err) => {
        res.StatusCode = 404
        res.end('No such location')
    })
}).listen(7777)

handler.on('ping', (event) => {
    let repo = event.payload.repository
    tg.forwardFromGH('Ping from Repo: [' + repo.name + '](' + repo.html_url + ')', {
        parse_mode: 'markdown',
        disable_web_page_preview: true
    })
})

handler.on('issues', (event) => {
    console.log('Received an issue event for %s action=%s: #%d %s',
      event.payload.repository.name,
      event.payload.action,
      event.payload.issue.number,
      event.payload.issue.title)
})
