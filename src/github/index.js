import GHWebhook from './webhook'

class GitHub {
    constructor (conf, tg) {
        this.tg = tg
        this.conf = conf
        this.setup = this.conf.github
        
        this.webhook = new GHWebhook(this.conf, this.tg)
    }

    init () {
        this.webhook.init()
    }
}

export default GitHub