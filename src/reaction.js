function gen_reaction() {
    let reactions = {}
    for (let a in REACTIONS) {
        const blist = REACTIONS[a]
        for (let b in blist) {
            const ans = blist[b]
            if (!reactions[ans]) {
                reactions[ans] = [a, b]
            }
        }
    }
    console.log(JSON.stringify(reactions))
    return reactions
}

const reaction = gen_reaction()
module.exports.reaction = reaction
module.exports.work = function (room) {
    const terminal = room.terminal
    if (!terminal || room.controller.level != 8 || !room.memory.lab.ok) return
    if (!room.memory.reaction) {
        room.memory.reaction = {
            status: 'miss',
            type: ''
        }
    }
    if (room.memory.reaction.status == 'miss') {
        for (let output in reaction) {
            const outputnum = terminal.store[output] ? terminal.store[output] : 0
            if (outputnum < 3000) {
                if (reaction[output].every(obj => {
                    return (terminal.store[obj] ? terminal.store[obj] : 0) >= 3000
                })) {
                    room.memory.reaction.status = 'fill'
                    room.memory.reaction.type = output
                    break
                }
            }
        }
    } else if (room.memory.reaction.status == 'fill') {
        let lab1 = Game.getObjectById(room.memory.lab.input[0])
        let lab2 = Game.getObjectById(room.memory.lab.input[1])
        if ([lab1, lab2].every(obj => obj.mineralAmount == 3000 || (obj.mineralAmount > 0 && !terminal.store[obj.mineralType]))) {
            room.memory.reaction.status = 'react'
            room.memory.reaction.time = REACTION_TIME[room.memory.reaction.type]

        }
    } else if (room.memory.reaction.status == 'react') {
        let lab1 = Game.getObjectById(room.memory.lab.input[0])
        let lab2 = Game.getObjectById(room.memory.lab.input[1])
        if (lab1.mineralAmount == 0 && lab2.mineralAmount == 0) {
            room.memory.reaction.status = 'collect'
        }
    } else if (room.memory.reaction.status == 'collect') {
        if (room.memory.lab.output.every(obj => {
            let lab = Game.getObjectById(obj)
            return lab.mineralAmount == 0
        }) && room.memory.lab.input.every(obj => {
            let lab = Game.getObjectById(obj)
            return lab.mineralAmount == 0
        })
        ) {
            room.memory.reaction.status = 'miss'
        }
    }

}
module.exports.doreaction = function (room) {
    if (Game.time % (room.memory.reaction.time || 5) != 0) return
    if (room.memory.reaction && room.memory.reaction.status == 'react') {
        const lab1 = Game.getObjectById(room.memory.lab.input[0])
        const lab2 = Game.getObjectById(room.memory.lab.input[1])
        for (let id of room.memory.lab.output) {
            const lab = Game.getObjectById(id)
            if (lab.cooldown != 0) break
            lab.runReaction(lab1, lab2)
        }
    }
}