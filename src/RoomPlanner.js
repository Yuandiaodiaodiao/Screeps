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
let importance={
    '1': STRUCTURE_TOWER,
    '2': STRUCTURE_SPAWN,
    '3': STRUCTURE_STORAGE,
    '4': STRUCTURE_ROAD,
    '5': 'all'
}
let LeveLPlan = [
    [], [], [],
    [],
    [[0, 2, 2, 2, 2, 2, 2, 0, 8, 3, 5],
        [2, 2, 3, 3, 3, 3, 2, 2, 7, 3, 4],
        [2, 3, 2, 2, 2, 2, 3, 2, 2, 3, 3],
        [2, 2, 3, 2, 2, 2, 2, 3, 4, 3, 10],
        [0, 2, 2, 3, 2, 2, 2, 2, 3, 3, 5],
        [0, 0, 2, 2, 3, 3, 3, 3, 1, 3, 3],
        [0, 2, 2, 3, 2, 2, 2, 2, 3, 6, 9],
        [2, 2, 3, 2, 2, 2, 2, 3, 4, 3, 5],
        [2, 3, 2, 2, 2, 2, 3, 2, 2, 3, 4],
        [2, 2, 3, 3, 3, 3, 2, 2, 4, 3, 4],
        [0, 2, 2, 2, 2, 2, 2, 0, 0, 3, 0]


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
    let rotate = Game.flags['rotate']
    if (rotate) {
        let pos1 = flag.pos
        let pos2 = rotate.pos
        let degree = 0
        if (pos2.y < pos1.y) {
            degree = 90
        } else if (pos2.x < pos1.x) {
            degree = 180
        } else if (pos2.y > pos1.y) {
            degree = 270
        }

        while (degree > 0) {
            let newPlan = (() => {
                let arr = Array(plan.length)
                arr.fill(0)
                for (let index in arr) {
                    arr[index] = Array(plan.length)
                }
                return arr
            })()
            let len = plan.length
            for (let i = 0; i < len; i++) {
                for (let j = 0; j < len; j++) {
                    newPlan[len - j - 1][i] = plan[i][j]
                }
            }
            plan = newPlan
            degree -= 90
        }
    }
    let room = flag.room
    if (room) {
        if ((room.memory.planLevel || 0) < room.controller.level) {
            doPlan(plan)
            room.memory.planLevel = room.controller.level
        }
    }
    let flaghide = Game.flags['hide']
    if (flaghide && flaghide.color === COLOR_WHITE) {
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
    if (room.towers.length > 0 && room.spawns.length > 0 && room.controller.pos.findInRange(FIND_STRUCTURES, 1, {filter: o => o.structureType === STRUCTURE_CONTAINER}).length === 0 && room.controller.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {filter: o => o.structureType === STRUCTURE_CONTAINER}).length === 0) {
        try {

            let posarray = []
            let pos = room.controller.pos
            for (let a = -2; a <= 2; ++a) {
                for (let b = -2; b <= 2; ++b) {
                    let newpos = new RoomPosition(pos.x + a, pos.y + b, pos.roomName)
                    if (Game.tools.walkable(newpos)) {
                        posarray.push(newpos)
                    }
                }
            }
            let contpos = _.min(posarray, o => room.spawns[0] ? room.spawns[0].pos.getRangeTo(o) : 0)
            if (contpos) {
                room.createConstructionSite(contpos, STRUCTURE_CONTAINER)
            }
        } catch (e) {
            console.log('controller containetr error' + e)
        }
    }
for(let key in importance){
    let type=importance[key]
    for (let i in plan) {
        for (let j in plan[i]) {
            if(!(type==='all'||type===plan[i][j]))continue
            console.log(plan[i][j])
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
}

    autoRoad(room)


}

function autoRoad(room) {
    if (room.controller.level >= 4 && room.towers.length > 0) {
        const sources = []
        let targets = Game.tools.findrooms(room, FIND_SOURCES)
        if (room.controller.level >= 6) {
            let minerals = room.find(FIND_MINERALS)
            targets = targets.concat(minerals)
        }
        for (let source of targets) {
            let ans = PathFinder.search(Game.tools.nearavailable(room.spawns[0].pos), {
                pos: source.pos,
                range: 1
            }, {
                plainCost: 2,
                swampCost: 4,
                roomCallback: Game.tools.roomc_nocreep,
                maxRooms: 5
            })
            let path = ans.path
            let num = ans.path.length
            for (let pos of path) {
                if (num-- <= 3) {
                    break
                }
                let act = Game.rooms[pos.roomName].createConstructionSite(pos, STRUCTURE_ROAD)
            }
        }
        let structures = room.find(FIND_STRUCTURES)
        structures.forEach(o => {
            if (o.structureType === STRUCTURE_ROAD) {
                if (!Game.tools.walkable(o.pos)) {
                    o.destroy()
                }
            }
        })
    }
}

module.exports.drawPlan = drawPlan
module.exports.autoRoad = autoRoad