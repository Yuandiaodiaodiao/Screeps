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
    return reactions
}

let usefulBoostList = new Set([
    'XKHO2', 'XLHO2', 'XZH2O', 'XZHO2', 'XGHO2', 'XUH2O'
])
let usefult3 = new Set([
    'XKHO2', 'XLHO2', 'XZH2O', 'XZHO2', 'XGHO2', 'XUH2O', 'XLH2O'
])
let t3 = new Set(['XKHO2', 'XKH2O', 'XLHO2', 'XLH2O', 'XZH2O', 'XZHO2', 'XGHO2', 'XUH2O', 'XUHO2', 'XGH2O'])
module.exports.usefult3 = usefult3
const reaction = gen_reaction()
const produceLimit = {
    'XKHO2': 12e3,
    'XKH2O': 3e3,
    'XLHO2': 12e3,
    'XLH2O': 12e3,
    'XZH2O': 12e3,
    'XZHO2': 12e3,
    'XGHO2': 12e3,
    'XUH2O': 12e3,
    'XUHO2': 3e3,
    'XGH2O': 3e3,
    'G': 3e3,
}
module.exports.produceLimit=produceLimit
function solveCanProduce(room, type,top=false,debug=false) {
    let terminal = room.terminal
    if(debug){
        console.log('type='+type+terminal.store[type])
    }
    if ((terminal.store[type] || 0) >= 3000&&!top) {
        //可以反应
        return true
    } else {
        if ((type in reaction)) {
            //可以合成
            let ans=reaction[type].map(subType=>solveCanProduce(room, subType))
            if(ans.every(o=>o===true)){
                //做当前反应
                return type
            }else if(ans.some(o=>o===false)){
                //缺原料
                return false
            }else{
                //做下层反应
                return ans.find(o=>o!==true)
            }
        } else {
            //缺原料
            return false
        }
    }

}

module.exports.solveCanProduce = solveCanProduce
module.exports.reaction = reaction
module.exports.work = function (room) {

    const terminal = room.terminal
    if (!terminal || room.controller.level !== 8 || !room.memory.lab.ok) return
    if (!room.memory.reaction) {
        room.memory.reaction = {
            status: 'miss',
            type: ''
        }
    }
    if (room.memory.reaction.status === 'miss') {
        if (room.memory.reaction.preBoost && room.memory.reaction.preBoost.length > 0) {
            room.memory.reaction.status = 'boost'
            room.memory.reaction.boostList = [
                'XKHO2', 'XLHO2', 'XZH2O', 'XZHO2', 'XGHO2', 'XUH2O'
            ]
            return
        }

        let minVal = 99e8
        let minType = undefined
        for (let output in produceLimit) {
            let ans = solveCanProduce(room, output,true)
            if (ans === false) {
                continue
            }
            const outputnum = terminal.store[output] || 0
            if (outputnum < minVal && outputnum < produceLimit[output]) {
                minVal = outputnum
                minType = output
            }
        }
        if (minType && minVal < produceLimit[minType]) {
            let produce = solveCanProduce(room, minType,true)
            if (produce === true) {
                produce = minType
            }
            room.memory.reaction.status = 'fill'
            room.memory.reaction.type = produce
            console.log('room.name=' + `${room.name} mineType=${minType} min=${minVal}`)
        }

    } else if (room.memory.reaction.status == 'fill') {
        let lab1 = Game.getObjectById(room.memory.lab.input[0])
        let lab2 = Game.getObjectById(room.memory.lab.input[1])
        if ([lab1, lab2].every(obj => obj.mineralAmount == 3000 || (obj.mineralAmount > 0 && !terminal.store[obj.mineralType]))) {
            room.memory.reaction.status = 'react'
            room.memory.reaction.time = REACTION_TIME[room.memory.reaction.type]

        }
    } else if (room.memory.reaction.status === 'react') {
        let lab1 = Game.getObjectById(room.memory.lab.input[0])
        let lab2 = Game.getObjectById(room.memory.lab.input[1])
        if (lab1.mineralAmount <= 20 || lab2.mineralAmount <= 20) {
            room.memory.reaction.status = 'collect'
            room.memory.reaction.type = undefined
            room.memory.reaction.time = undefined
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
    } else if (room.memory.reaction.status == 'boost') {
        const boostList = room.memory.reaction.boostList
        let ok = false
        for (let index in boostList) {
            const type = boostList[index]
            const lab = room.labs[index]
            if (lab.mineralAmount < lab.mineralCapacity) {
                ok = true
                break
            }
        }
        for (let lab of room.labs) {
            if (lab.energy < lab.energyCapacity) {
                ok = true
                break
            }
        }
        if (ok == false) {
            room.memory.reaction.boostReady = true
        } else {
            room.memory.reaction.boostReady = false
        }
    } else {
        if (room.labs.every(obj => {
            return obj.mineralAmount == 0
        })
        ) {
            room.memory.reaction.status = 'miss'
        } else {
            room.memory.reaction.status = 'collect'
        }
    }

}
module.exports.doreaction = function (room) {
    if (room.memory.reaction && room.memory.reaction.status == 'react') {
        if (Game.time % (room.memory.reaction.time || 5) != 0) return
        const lab1 = Game.getObjectById(room.memory.lab.input[0])
        const lab2 = Game.getObjectById(room.memory.lab.input[1])
        for (let id of room.memory.lab.output) {
            const lab = Game.getObjectById(id)
            if (lab.cooldown != 0) break
            lab.runReaction(lab1, lab2)
        }
    }
}


// if(room.name==='E29N38'){
//     room.memory.reaction.status ='boost'
//     room.memory.reaction.boostList=['XKHO2','XLHO2','XGHO2','XZH2O','XZHO2']
//     return
// }