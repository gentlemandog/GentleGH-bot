import Telegram from './telegram'
import authentication from './authentication'
import http from 'http'
import createHandler from 'github-webhook-handler'


let tg = new Telegram(authentication.telegram_token)

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
    tg.forwardFromGH('Ping from Repo: [' + repo.full_name + '](' + repo.html_url + ')', {
        parse_mode: 'markdown',
        disable_web_page_preview: true
    })
})

handler.on('push', (event) => {
    let ref = event.payload.ref
    ref = ref.slice(ref.lastIndexOf('/') + 1)
    let repo = event.payload.repository
    let pusher = event.payload.pusher
    let head_commit = event.payload.head_commit
    let output = 'Pushed by ' + pusher.name + '  \n'
    output += 'To: [' + repo.full_name + '](' + repo.html_url + ') at branch ' + ref + '  \n'
    output += 'Commit [' + head_commit.id.slice(0, 7) + '](' + head_commit.url + ')' + (event.payload.forced ? ' with __**FORCED**__' : '') + ': \n'
    output += '```  \n' + head_commit.message + '  \n```  \n'
    if (event.payload.forced && ref === 'master') {
        output = '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n' + output + '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
    }
    tg.forwardFromGH(output, {
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

handler.on('commit_comment', (event) => {
    let comment = event.payload.comment
    let repo = event.payload.repository
    let comment_by = comment.user
    let output = '[' + comment_by.login + '](' + comment_by.html_url + ')'
    output += ' commented [' + repo.full_name + '](' + repo.html_url + ')  \n'
    output += 'Commit [' + comment.commit_id.slice(0, 7) + '](' + comment.html_url + ')  \n'
    output += '```  \n' + comment.body + '  \n```  \n'

    tg.forwardFromGH(output, {
        parse_mode: 'markdown',
        disable_web_page_preview: true
    })
})
