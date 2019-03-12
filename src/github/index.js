import GHWebhook from './webhook'

class GitHub {
    constructor (conf, tg) {
        this.tg = tg
        this.conf = conf
        
        this.webhook = new GHWebhook(this.conf.webhook, this.tg)
    }

    init () {
        this.webhook.init()
    }
}

export default GitHub