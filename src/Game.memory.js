let memory = undefined
const specialSave = {
    roomCache: function (cache) {
        let temp = {}
        for (let name in cache) {
            if (cache[name]) {
                try {
                    temp[name] = cache[name].serialize()
                } catch (e) {
                    console.log('serialize error' + e + name)
                }
            }
        }
        return temp
    }
}
const specialLoad = {
    roomCache: function (cache) {
        for (let name in cache) {
            try {
                cache[name] = PathFinder.CostMatrix.deserialize(cache[name])
            } catch (e) {
                console.log(' PathFinder.CostMatrix.deserialize error ' + e + 'name')
            }
        }
        return cache
    }
}
let status = 'check'
let segStart = 20
let frequency = 2
let startTime=0
let preSaveStr = undefined
let maxSaveFrequency=1000
RawMemory.setActiveSegments([])
module.exports.work = work

function work() {
    startTime++
    Game.memory = memory
    const gameMemory = Memory['Game.memory'] = Memory['Game.memory'] || {}
    const config = gameMemory.config = gameMemory.config || {}
    if (status === 'check') {
        console.log('startCheck')
        let doRead = false
        if (!memory) {
            doRead = true
        }
        if (doRead) {
            const len = config.len || 0
            const segNum = Math.floor(len / 99e3)
            let openArray = []
            for (let segid = segStart; segid <= segStart + segNum; ++segid) {
                openArray.push(segid)
            }
            console.log('doRead seg=' + JSON.stringify(openArray))
            RawMemory.setActiveSegments(openArray)
            status = 'read'
            Game.memory = memory = {}
            return false
        } else {
            RawMemory.setActiveSegments([])
        }
    } else if (status === 'read') {
        const len = config.len || 0
        const segNum = Math.floor(len / 99e3)
        let strs = undefined
        for (let segid = segStart; segid <= segStart + segNum; ++segid) {
            strs = (strs || "") + (RawMemory.segments[segid] || "")
        }

        let readObject = {}
        try {
            readObject = JSON.parse(strs) || {}
        } catch (e) {
            console.log(`Game.memory.read.json.parse error ${e} \n str=${strs}`)
        }
        for (let key in readObject) {
            try {
                if (specialLoad[key]) {
                    readObject[key] = specialLoad[key](readObject[key])
                }
            } catch (e) {
                console.log('Game.memory.read.specialLoad error' + e + " key= " + key)
            }
        }
        console.log('readObject=' + JSON.stringify(readObject))
        Game.memory = memory = readObject
        status = 'check'
        RawMemory.setActiveSegments([])
    } else if (status === 'save') {
        let saveStr = preSaveStr
        console.log('save' + saveStr)
        const len = saveStr.length
        config.len = len
        const segNum = Math.floor(len / 99e3)
        for (let segid = segStart; segid <= segStart + segNum; ++segid) {
            try {
                RawMemory.segments[segid] = saveStr.substr((segid - segStart) * 99e3, 99e3)
            } catch (e) {
                console.log('seg ' + segid + ' save error' + e)
            }
        }
        RawMemory.setActiveSegments([])
        status = 'check'
    }
    if (startTime>=3&&status === 'check' && startTime% frequency === 0) {
        frequency = Math.min(frequency * 4, maxSaveFrequency)
        let saveTemp = {}
        for (let key in memory) {
            if (specialSave[key]) {
                saveTemp[key] = specialSave[key](memory[key])
            } else {
                saveTemp[key] = memory[key]
            }
        }
        preSaveStr = JSON.stringify(saveTemp)
        const len = preSaveStr.length
        console.log('Game.memory.save len= ' + len)
        const segNum = Math.floor(len / 99e3)
        let openArray = []
        for (let segid = segStart; segid <= segStart + segNum; ++segid) {
            openArray.push(segid)
        }
        RawMemory.setActiveSegments(openArray)
        status = 'save'
    }
    return true
}