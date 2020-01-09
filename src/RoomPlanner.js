require('RoomVisualOfficial')
let dict = {
    '0': '0',
    '1': STRUCTURE_STORAGE,
    '2': STRUCTURE_EXTENSION,
    '3': STRUCTURE_ROAD,
    '4': STRUCTURE_TOWER,
    '5': STRUCTURE_SPAWN,
    '6': STRUCTURE_LINK,
    '7': STRUCTURE_POWER_SPAWN,
    '8': STRUCTURE_NUKER,
    '9': STRUCTURE_TERMINAL,
    '10': STRUCTURE_FACTORY
}
let LeveLPlan = [
    [], [], [],
    [],
    [[0, 0, 2, 2, 2, 2, 2, 2, 0, 8, 3, 5],
        [0, 2, 2, 3, 3, 3, 3, 2, 2, 7, 3, 4],
        [0, 2, 3, 2, 2, 2, 2, 3, 2, 2, 3, 3],
        [0, 2, 2, 3, 2, 2, 2, 2, 3, 4, 3, 10],
        [0, 0, 2, 2, 3, 2, 2, 2, 2, 3, 3, 5],
        [0, 0, 0, 2, 2, 3, 3, 3, 3, 1, 3, 3],
        [0, 0, 2, 2, 3, 2, 2, 2, 2, 3, 6, 9],
        [0, 2, 2, 3, 2, 2, 2, 2, 3, 4, 3, 5],
        [0, 2, 3, 2, 2, 2, 2, 3, 2, 2, 3, 4],
        [0, 2, 2, 3, 3, 3, 3, 2, 2, 4, 3, 4],
        [0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 3, 0]


    ],
]
for (let k in LeveLPlan) {
    let plan = LeveLPlan[k]
    for (let i in plan) {
        for (let j in plan[i]) {
            plan[i][j] = dict["" + plan[i][j]]
        }
    }
}

module.exports.LeveLPlan = LeveLPlan

function drawPlan(plan) {
    let flag = Game.flags['here']
    if (!flag) {
        return
    }
    let room = flag.room
    if (room) {
        if ((room.memory.planLevel || 0) < room.controller.level) {
            doPlan(plan)
            room.memory.planLevel = room.controller.level
        }
    }
    let flaghide = Game.flags['hide']
    if (flaghide&&flaghide.color===COLOR_WHITE) {
        return
    }
    let posleftright = flag.pos
    let visu = new RoomVisual(flag.pos.roomName)
    // let str=''
    for (let i in plan) {
        for (let j in plan[i]) {
            // str+='\n'+`pos${parseInt(j) + posleftright.x} ${parseInt(i) + posleftright.y} draw ${plan[i][j]}`
            visu.structure(parseInt(j) + posleftright.x, parseInt(i) + posleftright.y, plan[i][j])
        }
    }
    // console.log(str)
    visu.connectRoads()

}

function doPlan(plan) {
    let flag = Game.flags['here']
    if (!flag) {
        return
    }
    let pos = flag.pos
    let room = flag.room
    if (!room) {
        return
    }
    if (room.controller.pos.findInRange(FIND_STRUCTURES, 1, {filter: o => o.structureType === STRUCTURE_CONTAINER}).length === 0 && room.controller.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {filter: o => o.structureType === STRUCTURE_CONTAINER}).length === 0) {
        try {
            let contpos = Game.tools.allnearavailable(room.controller.pos).sort((a, b) => {
                return (room.spawns[0] ? room.spawns[0].pos.getRangeTo(a) : 0) - (room.spawns[0] ? room.spawns[0].pos.getRangeTo(b) : 0)
            })[0]
            room.createConstructionSite(contpos, STRUCTURE_CONTAINER)
        } catch (e) {
            console.log('controller containetr error' + e)
        }
    }

    for (let i in plan) {
        for (let j in plan[i]) {

            if (plan[i][j] === STRUCTURE_SPAWN) {
                if (!(CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][room.controller.level] > room.spawns.length && room.controller.level > 1)) {
                    continue
                }
                console.log(plan[i][j])
                try {
                    let spawnName = room.name + "_spawn" + (room.spawns.length + 1)
                    let act = room.createConstructionSite(parseInt(j) + pos.x, parseInt(i) + pos.y, plan[i][j], spawnName)
                    console.log(`spawnname=${spawnName} act=${act}`)
                    // visu.structure(parseInt(j) + posleftright.x, parseInt(i) + posleftright.y, plan[i][j])

                } catch (e) {
                    console.log(e)
                }
            } else if (plan[i][j] === STRUCTURE_ROAD) {
                if (room.controller.level < 3) {
                    continue
                }
                try {
                    let terr = room.lookForAt(LOOK_TERRAIN, parseInt(j) + pos.x, parseInt(i) + pos.y)
                    // console.log(terr)
                    if (terr.every(o => o !== 'wall')) {
                        let act = room.createConstructionSite(parseInt(j) + pos.x, parseInt(i) + pos.y, plan[i][j])
                    }

                } catch (e) {

                }
            } else {
                if (room.controller.level < 3) {
                    continue
                }
                try {
                    let terr = room.lookForAt(LOOK_TERRAIN, parseInt(j) + pos.x, parseInt(i) + pos.y)
                    // console.log(terr)
                    if (terr.every(o => o !== 'wall')) {
                        let act = room.createConstructionSite(parseInt(j) + pos.x, parseInt(i) + pos.y, plan[i][j])
                    }

                } catch (e) {

                }
            }
            // str+='\n'+`pos${parseInt(j) + posleftright.x} ${parseInt(i) + posleftright.y} draw ${plan[i][j]}`
        }
    }
    autoRoad(room)



}
function autoRoad(room){
    if (room.controller.level >= 4 && room.towers.length > 0) {
        const sources = []
        let targets = Game.tools.findrooms(room, FIND_SOURCES)
        for (let source of targets) {
            let ans =PathFinder.search(Game.tools.nearavailable(room.spawns[0].pos), {
                pos: source.pos,
                range: 3
            }, {
                plainCost: 2,
                swampCost: 4,
                roomCallback: Game.tools.roomc_nocreep,
                maxRooms:5
            })
            let path=ans.path
            for(let pos of path){
                let act = Game.rooms[pos.roomName].createConstructionSite(pos, STRUCTURE_ROAD)
            }
        }
    }
}

module.exports.drawPlan = drawPlan
module.exports.autoRoad=autoRoad