import fs from 'fs'

class Conf {
    constructor (path) {
        this.path = path
        this.read()
        this.telegram = this.raw_json.telegram
        this.github = this.raw_json.github
    }

    read () {
        this.raw_json = JSON.parse(fs.readFileSync(this.path))
    }

    write () {
        fs.writeFileSync(this.path, JSON.stringify({
            telegram: this.telegram,
            github: this.github
        }, null, 4))
    }
}

export default Conf
