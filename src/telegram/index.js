import TelegramBot from 'node-telegram-bot-api'
import Message from './message'

class Telegram {
    constructor (conf) {
        this.conf = conf
        this.setup = this.conf.telegram
        this.chat_room = this.setup.chat_room

        this.bot = new TelegramBot(this.setup.token, {polling: true})
        this.bot.on('message', (msg) => this.onMessage(msg))
        this.bot.on('polling_error', (msg) => console.error(msg));

        this.chat_room.forEach((each) => {
            this.bot.sendMessage(each, 'Whoooooooooooola!\nDog is inited!~\n', )
        })
    }

    forwardFromGH (text, options) {
        this.chat_room.forEach((each) => {
            this.bot.sendMessage(each, text, options !== undefined ? options : {
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
            let cmd_name = msg.text.slice(entities.offset + 1, entities.length).toLowerCase()
            if (cmd_name === 'ping') {
                this.onPing(msg)
            } else if (cmd_name === 'bind' || cmd_name === 'b') {
                this.onBind(msg)
            } else if (cmd_name === 'unbind' || cmd_name == 'ub') {
                this.onUnBind(msg)
            }
        }
    }

    onPing (msg) {
        this.bot.sendMessage(msg.chat.id, 'Pong!')
    }

    onBind (msg) {
        if (this.chat_room.indexOf(msg.chat.id) === -1) {
            this.chat_room.push(msg.chat.id)
            this.bot.sendMessage(msg.chat.id, 'Binded!')
            console.log(`Chat id: ${msg.chat.id} binded.`)
            this.conf.write()
        }
    }

    onUnBind (msg) {
        this.chat_room.splice(this.chat_room.indexOf(msg.chat.id), 1)
        this.bot.sendMessage(msg.chat.id, 'Unbinded!')
        console.log(`Chat id: ${msg.chat.id} unbined.`)
        this.conf.write()
    }
}

export default Telegram
