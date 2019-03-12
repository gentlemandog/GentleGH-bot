import TelegramBot from 'node-telegram-bot-api'
import Message from './message'

class Telegram {
    constructor (conf) {
        this.conf = conf
        this.tg_chat_room = []

        this.bot = new TelegramBot(this.conf.token, {polling: true})
        this.bot.on('message', (msg) => this.onMessage(msg))
        this.bot.on("polling_error", (msg) => console.error(msg));
    }

    forwardFromGH (text, options) {
        this.tg_chat_room.forEach((each) => {
            this.bot.sendMessage(each, text, options === undefined ? options : {
                parse_mode: 'markdown',
                disable_web_page_preview: true
            })
        })
    }

    onMessage (msg) {
        const message = new Message(msg)
        if (message.isBotCommand()) {
            this.onCommand(message)
        } else {
            // this.bot.sendMessage(message.chat.id, 'asdasdasdasdsa')
        }
    }

    onCommand (msg) {
        let entities = msg.entities[0]
        if (entities.offset === 0) {
            let cmd_name = msg.text.slice(entities.offset + 1, entities.length)
            if (cmd_name === 'ping') {
                this.bot.sendMessage(msg.chat.id, 'Pong!')
            } else if (cmd_name === 'bind') {
                this.tg_chat_room.push(msg.chat.id)
                this.bot.sendMessage(msg.chat.id, 'Binded!')
                console.log('Chat id: '+ msg.chat.id + ' binded.')
            }
        }
    }
}

export default Telegram
