import fs from 'fs'
import http from 'http'
import https from 'https'
import createHandler from 'github-webhook-handler'

class GHWebhook {
    constructor (conf, tg) {
        this.conf = conf
        this.tg = tg

        this.handler = createHandler({
            path: this.conf.path,
            secret: this.conf.secret
        })

        this.handler.on('ping', (event) => this.ping(event))
        this.handler.on('push', (event) => this.push(event))
        this.handler.on('commit_comment', (event) => this.ping(event))
        this.handler.on('issues', (event) => this.issues(event))
    }

    init() {
        if (this.conf.https) {
            let option = {
                key: fs.readFileSync(this.conf.https.key_path),
                cert: fs.readFileSync(this.conf.https.pem_path),
            }
            this.server = https.createServer(option, (req, res) => {
                gh_webhook.handler(req, res, (err) => {
                    res.StatusCode = 404
                    res.end('No such location')
                })
            })
        } else {
            this.server = http.createServer((req, res) => {
                gh_webhook.handler(req, res, (err) => {
                    res.StatusCode = 404
                    res.end('No such location')
                })
            })
        }
        this.server.listen(this.conf.port)
        
    }

    ping (event) {
        let repo = event.payload.repository
        this.tg.forwardFromGH('Ping from Repo: [' + repo.full_name + '](' + repo.html_url + ')')
    }

    push (event) {
        /*
            Message body into Telegram chat room:
                [<if forced and ref master>'!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!]
                @ <REPO_NAME> branch <REF_NAME>
                Pusher <PUSHER_NAME> pusher <COMMIT> [<if forced>with FORCE]
                ```
                <COMMIT_MESSAGE>
                ```
                [<if forced and ref master>'!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!]
        */
        let ref = event.payload.ref
        ref = ref.slice(ref.lastIndexOf('/') + 1)
        let repo = event.payload.repository
        let pusher = event.payload.pusher
        let head_commit = event.payload.head_commit
        let output = `@ [${repo.full_name}](${repo.html_url}) branch [${ref}](https://github.com/${repo.full_name}/tree/${ref})\n`
        output += `Pusher [${pusher.name}](https://github.com/${pusher.name}) pushed [${head_commit.id.slice(0, 7)}](${head_commit.url})${event.payload.forced ? ' with FORCE!' : ''}\n`
        output += '```  \n' + head_commit.message + '  \n```  \n'
        if (event.payload.forced && ref === 'master') {
            output = '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n' + output + '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
        }
        this.tg.forwardFromGH(output)
    }

    commit_comment (event) {
        /*
            Message body into Telegram chat room:
            @ <REPO_NAME> commit <COMMIT>
            User <USER_NAME> commented with:
            ```
            <COMMIT_COMMENT_MESSAGE>
            ```
        */
        let comment = event.payload.comment
        let repo = event.payload.repository
        let comment_by = comment.user
        let output = `@ [${repo.full_name}](${repo.html_url}) commit [${comment.commit_id.slice(0, 7)}](${comment.html_url})\n`
        output += `User [${comment_by.loggin}](${comment_by.html_url}) commented with: \n`
        output += '```  \n' + comment.body + '  \n```  \n'
    
        this.tg.forwardFromGH(output)
    }

    issues (event) {
        /*
            Message body into Telegram chat room:
            @ <REPO_NAME> issue
            #<ISSUE_NUMBER> <ISSUE_TITLE>:
            ```
            <ISSUE_MESSAGE>
            ```
        */
        let action = event.payload.action
        if (action !== 'opened') {
            return
        }

        let repo = event.payload.repository
        let issue = event.payload.issue
        let output = `@ [${repo.full_name}](${repo.html_url}) issue\n`
        output += `[#${issue.number} ${issue.title}](${issue.html_url}) :`
        output += '```  \n' +  + '  \n```  \n'
        this.tg.forwardFromGH(output)
    }
}

export default GHWebhook