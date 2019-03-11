
class Message {
    constructor (msg) {
        this.message_id = msg.message_id
        this.from = msg.from
        this.chat = msg.chat
        this.date = msg.date
        this.text = msg.text
        this.entities = msg.entities
    }

    isBotCommand () {
        return this.entities !== undefined && this.entities[0].type === 'bot_command'
    }
}

export default Message
