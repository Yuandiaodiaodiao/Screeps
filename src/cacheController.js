var config = [
    require('observer').observerCacheSet,
    require('tools').roomCacheSet,
    require('tools').roomCachettlSet,
    require('tools').roomCacheUseSet
]
var seg = [
    [8],
    [10, 11, 12, 13, 14],
    [9],
    [7]
]
var serialize = new Set(['1'])
module.exports.serialize = serialize
var mission = new Set()
var open = new Set()
var status = 'check'
module.exports.Cache = Cache
var frequency = 2

function Cache() {
    if (!mission) mission = new Set()
    if (status == 'read') {
        for (let x of mission) {
            let strs = undefined
            // console.log(`start read${x}`)
            for (let segid of seg[x]) {
                try {
                    if (strs) {
                        strs += RawMemory.segments[segid] || ""
                    } else {
                        strs = RawMemory.segments[segid] || ""
                    }
                } catch (e) {
                    console.log(`read seg error id=${segid} ${e}`)
                }
            }
            // console.log(`len=${strs.length} readstr=${strs} `)
            let reads = {}
            try {
                reads = JSON.parse(strs || '{}') || {}
            } catch (e) {
                console.log(`json.parse error ${e} \n str=${strs}`)
            }

            if (serialize.has(x)) {
                for (let name in reads) {
                    try {
                        reads[name] = PathFinder.CostMatrix.deserialize(reads[name])
                    } catch (e) {
                        console.log(' PathFinder.CostMatrix.deserialize erro ' + e)
                    }
                }
            }
            config[x](reads)
        }
        mission.clear()
        open.clear()
        status = 'check'
    } else if (status == 'check') {
        mission.clear()
        open.clear()
        for (let x in config) {
            if (!config[x]()) {
                mission.add(x)
                // console.log(`check x=${x}`)
                for (let id of seg[x]) {
                    open.add(id)
                }
                config[x]({})
            }
        }
        if (mission.size > 0) {
            status = 'read'
        }
    } else if (status == 'save') {
        let savestr=""
        for (let x of mission) {
            let saves = (config[x]() || {})
            if (serialize.has(x)) {
                let temp = {}
                for (let name in saves) {
                    if (saves[name]) {
                        try {
                            temp[name] = saves[name].serialize()
                        } catch (e) {
                            console.log('serialize error' + e)
                        }
                    }
                }
                saves = temp
            }
            const str = JSON.stringify(saves)
            for (let index in seg[x]) {
                try {
                    RawMemory.segments[seg[x][index]] = str.substr(index * 95000, 95000)
                   savestr+=`segid=${seg[x][index]} savedlen=${RawMemory.segments[seg[x][index]].length} `
                } catch (e) {
                    console.log('seg save error' + e)
                }
            }
            // console.log(`save id=${x} length=${str.length}`)
        }
        mission.clear()
        open.clear()
        status = 'check'
        console.log(savestr)
    }
    //
    /*
    {
    let temp={}; let cache=require('tools').roomCache;console.log(_.size(cache)+'cache len=');
    let hascache=0;let nocache=0;  let cache=require('tools').roomCache;console.log(_.size(cache)+'cache len='); let temp={};for(let x in cache){if(cache[x]){hascache++;console.log('has'+x)}else{nocache++;}}console.log('has'+hascache+' no'+nocache);
    }
    * */
    //let temp={}; let cache=require('tools').roomCache;console.log(_.size(cache)+'cache len=');for(let x in cache){console.log(x); if(cache[x])temp[x]=cache[x].serialize(); console.log('l'+JSON.stringify(temp[x]).legnth)}; console.log('ans='+JSON.stringify(temp).length);
    // let temp={}; let cache=require('tools').roomCache; for(let x in cache){if(cache[x])temp[x]=cache[x].serialize();}; console.log('ans='+JSON.stringify(temp).length);
    if (status == 'check' && Game.time % frequency == 0) {
        frequency = Math.min(frequency * 4, 1000)
        mission.clear()
        open.clear()
        for (let x in config) {
            if (config[x]()) {
                mission.add(x)
                for (let id of seg[x]) {
                    open.add(id)
                }
            }
        }
        if (mission.size > 0) {
            status = 'save'
        }
    }
    const active = Array.from(open)
    RawMemory.setActiveSegments(active)
}


var sizeof = function (str, charset) {
    var total = 0,
        charCode,
        i,
        len;
    charset = charset ? charset.toLowerCase() : '';
    if (charset === 'utf-16' || charset === 'utf16') {
        for (i = 0, len = str.length; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode <= 0xffff) {
                total += 2;
            } else {
                total += 4;
            }
        }
    } else {
        for (i = 0, len = str.length; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode <= 0x007f) {
                total += 1;
            } else if (charCode <= 0x07ff) {
                total += 2;
            } else if (charCode <= 0xffff) {
                total += 3;
            } else {
                total += 4;
            }
        }
    }
    return total;
}