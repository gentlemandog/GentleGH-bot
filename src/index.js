import fs from 'fs'
import Telegram from './telegram'
import GitHub from './github'


let confPath = './bot.conf'
for (let each of process.argv) {
    if (each.includes('--bot-conf=')) {
        confPath = each.slice(each.indexOf('=') + 1)
    }
}

let conf = JSON.parse(fs.readFileSync(confPath))
let tg = new Telegram(conf.telegram)
let gh = new GitHub(conf.github)
gh.init()