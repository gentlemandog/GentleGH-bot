import fs from 'fs'
import http from 'http'
import https from 'https'
import createHandler from 'github-webhook-handler'

class GHWebhook {
    constructor (conf, tg) {
        this.conf = conf
        this.setup = this.conf.github.webhook
        this.tg = tg

        this.handler = createHandler({
            path: this.setup.path,
            secret: this.setup.secret
        })

        this.handler.on('ping', (event) => this.ping(event))
        this.handler.on('create', (event) => this.create(event))
        this.handler.on('delete', (event) => this.delete(event))
        this.handler.on('push', (event) => this.push(event))
        this.handler.on('commit_comment', (event) => this.commit_comment(event))
        this.handler.on('issues', (event) => this.issues(event))
    }

    init() {
        if (this.setup.https) {
            let option = {
                key: fs.readFileSync(this.setup.https.key_path),
                cert: fs.readFileSync(this.setup.https.pem_path),
            }
            this.server = https.createServer(option, (req, res) => {
                this.handler(req, res, (err) => {
                    res.StatusCode = 404
                    res.end('No such location')
                })
            })
        } else {
            this.server = http.createServer((req, res) => {
                this.handler(req, res, (err) => {
                    res.StatusCode = 404
                    res.end('No such location')
                })
            })
        }
        this.server.listen(this.setup.port)
        
    }

    ping (event) {
        let repo = event.payload.repository
        this.tg.forwardFromGH('Ping from Repo: [' + repo.full_name + '](' + repo.html_url + ')')
    }

    create (event) {
        /*
            Message body into Telegram chat room:
            @ <REPO_NAME> (tag|branch) <TAG_NAME|BRANCH_NAME>
            Created by <CREATOR_NAME>
         */
        let ref = event.payload.ref.replace(/_/g, '\\_')
        let ref_type = event.payload.ref_type
        let repo = event.payload.repository
        let sender = event.payload.sender
        let output = `@ [${repo.full_name}](${repo.html_url}) ${ref_type} ${ref}\n`
        output += `Created by [${sender.login}](${sender.html_url})`
        this.tg.forwardFromGH(output)
    }

    delete (event) {
        /*
            Message body into Telegram chat room:
            @ <REPO_NAME> (tag|branch) <TAG_NAME|BRANCH_NAME>
            Deleted by <CREATOR_NAME>
         */
        let ref = event.payload.ref.replace(/_/g, '\\_')
        let ref_type = event.payload.ref_type
        let repo = event.payload.repository
        let sender = event.payload.sender
        let output = `@ [${repo.full_name}](${repo.html_url}) ${ref_type} ${ref}\n`
        output += `Deleted by [${sender.login}](${sender.html_url})`
        this.tg.forwardFromGH(output)
    }

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
    push (event) {
        if (!event.payload.deleted) {
            let ref_type = event.payload.ref.includes('ref/tags/') ? 'tag' : 'branch'
            let ref = event.payload.ref
            ref = ref.slice(ref.lastIndexOf('/') + 1)
            let repo = event.payload.repository
            let sender = event.payload.sender
            let head_commit = event.payload.head_commit
            let output = `@ [${repo.full_name}](${repo.html_url}) ${ref_type} [${ref}](https://github.com/${repo.full_name}/${ref_type === 'tag' ? 'releases/tag' : 'tree'}/${ref})\n`
            output += `Pusher [${sender.login}](${sender.html_url}) pushed [${head_commit.id.slice(0, 7)}](${head_commit.url})${event.payload.forced ? ' with FORCE!' : ''}\n`
            output += '```  \n' + head_commit.message + '  \n```  \n'
            if (event.payload.forced && ref === 'master') {
                output = '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n' + output + '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
            }
            this.tg.forwardFromGH(output)
        }
    }

    /*
        Message body into Telegram chat room:
        @ <REPO_NAME> commit <COMMIT>
        User <USER_NAME> commented with:
        ```
        <COMMIT_COMMENT_MESSAGE>
        ```
    */
    commit_comment (event) {
        let comment = event.payload.comment
        let repo = event.payload.repository
        let comment_by = event.payload.sender
        let output = `@ [${repo.full_name}](${repo.html_url}) commit [${comment.commit_id.slice(0, 7)}](${comment.html_url})\n`
        output += `User [${comment_by.login}](${comment_by.html_url}) commented with: \n`
        output += '```  \n' + comment.body + '  \n```  \n'
    
        this.tg.forwardFromGH(output)
    }

    /*
        Message body into Telegram chat room:
        @ <REPO_NAME> issue
        #<ISSUE_NUMBER> <ISSUE_TITLE>:
        ```
        <ISSUE_MESSAGE>
        ```
    */
    issues (event) {
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