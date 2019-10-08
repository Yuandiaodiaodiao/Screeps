let memory = undefined
const specialSave = {}
const specialLoad = {}
let status = 'check'

function work() {

    if (!memory) {
        status = 'check'
    } else {
        Game.memory = memory
    }
    const gameMemory = Memory['Game.memory'] = Memory['Game.memory'] || {}
    const data = gameMemory.data = gameMemory.data || {}
    const config = gameMemory.config = gameMemory.config || {}

    if (status == 'check') {
        for (let key in data) {

        }
    }


}