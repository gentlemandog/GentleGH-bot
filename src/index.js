import Conf from './conf'
import Telegram from './telegram'
import GitHub from './github'

let confPath = './bot.conf'
for (let each of process.argv) {
    if (each.includes('--bot-conf=')) {
        confPath = each.slice(each.indexOf('=') + 1)
    }
}

let conf = new Conf(confPath)
let tg = new Telegram(conf)
let gh = new GitHub(conf, tg)
gh.init()