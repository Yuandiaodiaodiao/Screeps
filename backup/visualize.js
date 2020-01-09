const TEXT_COLOR = '#c9c9c9';
const TEXT_SIZE = .8;
const CHAR_WIDTH = TEXT_SIZE * 0.4;
const CHAR_HEIGHT = TEXT_SIZE * 0.9;

/**
 * The Visualizer contains many static methods for drawing room visuals and displaying information through a GUI
 */
@profile
export class Visualizer {

    static get enabled() {
        return Memory.settings.enableVisuals;
    }

    static textStyle(size = 1, style = {}) {
        return _.defaults(style, {
            color: TEXT_COLOR,
            align: 'left',
            font: `${size * TEXT_SIZE} Trebuchet MS`,
            opacity: 0.8,
        });
    }

    static circle(pos, color = 'red', opts = {}) {
        _.defaults(opts, {
            fill: color,
            radius: 0.35,
            opacity: 0.5,
        });
        return new RoomVisual(pos.roomName).circle(pos.x, pos.y, opts);
    }

    static marker(pos, opts = {}) {
        return new RoomVisual(pos.roomName).animatedPosition(pos.x, pos.y, opts);
    }

    static drawStructureMap(structureMap) {
        if (!this.enabled) return;
        const vis = {};
        for (const structureType in structureMap) {
            for (const pos of structureMap[structureType]) {
                if (!vis[pos.roomName]) {
                    vis[pos.roomName] = new RoomVisual(pos.roomName);
                }
                vis[pos.roomName].structure(pos.x, pos.y, structureType);
            }
        }
        for (const roomName in vis) {
            vis[roomName].connectRoads();
        }
    }

    static drawLayout(layout, anchor, opts = {}) {
        _.defaults(opts, {opacity: 0.5});
        if (!this.enabled) return;
        const vis = new RoomVisual(anchor.roomName);
        if (layout[8]) {
            for (const structureType in layout[8].buildings) {
                for (const pos of layout[8].buildings[structureType].pos) {
                    const dx = pos.x - layout.data.anchor.x;
                    const dy = pos.y - layout.data.anchor.y;
                    vis.structure(anchor.x + dx, anchor.y + dy, structureType, opts);
                }
            }
        }
        vis.connectRoads(opts);

    }

    static drawRoads(positoins) {
        const pointsByRoom = _.groupBy(positoins, pos => pos.roomName);
        for (const roomName in pointsByRoom) {
            const vis = new RoomVisual(roomName);
            for (const pos of pointsByRoom[roomName]) {
                vis.structure(pos.x, pos.y, STRUCTURE_ROAD);
            }
            vis.connectRoads();
        }
    }

    static drawPath(path, style) {
        const pointsByRoom = _.groupBy(path, pos => pos.roomName);
        for (const roomName in pointsByRoom) {
            new RoomVisual(roomName).poly(pointsByRoom[roomName], style);
        }
    }

    static displayCostMatrix(costMatrix, roomName, dots = true, color = '#ff0000') {

        const vis = new RoomVisual(roomName);
        let x, y;

        if (dots) {
            let cost;
            let max = 1;
            for (y = 0; y < 50; ++y) {
                for (x = 0; x < 50; ++x) {
                    max = Math.max(max, costMatrix.get(x, y));
                }
            }

            for (y = 0; y < 50; ++y) {
                for (x = 0; x < 50; ++x) {
                    cost = costMatrix.get(x, y);
                    if (cost > 0) {
                        vis.circle(x, y, {radius: costMatrix.get(x, y) / max / 2, fill: color});
                    }
                }
            }
        } else {
            for (y = 0; y < 50; ++y) {
                for (x = 0; x < 50; ++x) {
                    vis.text(costMatrix.get(x, y).toString(), x, y, {color: color});
                }
            }
        }

    }

    static showInfo(info, calledFrom, opts = {}) {
        if (calledFrom.room) {
            return calledFrom.room.visual.infoBox(info, calledFrom.pos.x, calledFrom.pos.y, opts);
        } else {
            return new RoomVisual(calledFrom.pos.roomName).infoBox(info, calledFrom.pos.x, calledFrom.pos.y, opts);
        }
    }

    static section(title, pos, width,
                   height) {
        const vis = new RoomVisual(pos.roomName);
        vis.rect(pos.x, pos.y - CHAR_HEIGHT, width, 1.1 * CHAR_HEIGHT, {opacity: 0.15});
        vis.box(pos.x, pos.y - CHAR_HEIGHT, width, height + (1.1 + .25) * CHAR_HEIGHT, {color: TEXT_COLOR});
        vis.text(title, pos.x + .25, pos.y - .05, this.textStyle());
        return {x: pos.x + 0.25, y: pos.y + 1.1 * CHAR_HEIGHT};
    }

    static infoBox(header, content, pos, width) {
        // const vis = new RoomVisual(pos.roomName);
        // vis.rect(pos.x, pos.y - charHeight, width, 1.1 * charHeight, {opacity: 0.15});
        // vis.box(pos.x, pos.y - charHeight, width, ((content.length || 1) + 1.1 + .25) * charHeight,
        // 		{color: textColor});
        // vis.text(header, pos.x + .25, pos.y - .05, this.textStyle());
        const height = CHAR_HEIGHT * (content.length || 1);
        const {x, y} = this.section(header, pos, width, height);
        if (content.length > 0) {
            if (_.isArray(content[0])) {
                this.table(content, {
                    x: x,
                    y: y,
                    roomName: pos.roomName
                });
            } else {
                this.multitext(content, {
                    x: x,
                    y: y,
                    roomName: pos.roomName
                });
            }
        }
        // return pos.y - charHeight + ((content.length || 1) + 1.1 + .25) * charHeight + 0.1;
        const spaceBuffer = 0.5;
        return y + height + spaceBuffer;
    }

    static text(text, pos, size = 1, style = {}) {
        new RoomVisual(pos.roomName).text(text, pos.x, pos.y, this.textStyle(size, style));
    }

    static barGraph(progress, pos, width = 7, scale = 1) {
        const vis = new RoomVisual(pos.roomName);
        let percent;
        let mode;
        if (typeof progress === 'number') {
            percent = progress;
            mode = 'percent';
        } else {
            percent = progress[0] / progress[1];
            mode = 'fraction';
        }
// Draw frame
        vis.box(pos.x, pos.y - CHAR_HEIGHT * scale, width, 1.1 * scale * CHAR_HEIGHT, {color: TEXT_COLOR});
        vis.rect(pos.x, pos.y - CHAR_HEIGHT * scale, percent * width, 1.1 * scale * CHAR_HEIGHT, {
            fill: TEXT_COLOR,
            opacity: 0.4,
            strokeWidth: 0
        });
// Draw text
        if (mode == 'percent') {
            vis.text(`${Math.round(100 * percent)}%`, pos.x + width / 2, pos.y - .1 * CHAR_HEIGHT,
                this.textStyle(1, {align: 'center'}));
        } else {
            const [num, den] = progress;
            vis.text(`${num}/${den}`, pos.x + width / 2, pos.y - .1 * CHAR_HEIGHT,
                this.textStyle(1, {align: 'center'}));
        }

    }

    static table(data, pos) {
        if (data.length === 0) {
            return;
        }
        const colPadding = 4;
        const vis = new RoomVisual(pos.roomName);

        const style = this.textStyle();

// Determine column locations
        const columns = Array(_.first(data).length).fill(0);
        for (const entries of data) {
            for (let i = 0; i < entries.length - 1; i++) {
                columns[i] = Math.max(columns[i], entries[i].length);
            }
        }

// // Draw header and underline
// vis.text(header, pos.x, pos.y, style);
// vis.line(pos.x, pos.y + .3 * charHeight,
// 	pos.x + charWidth * _.sum(columns) + colPadding * columns.length, pos.y + .25 * charHeight, {
// 			 color: textColor
// 		 });

// Draw text
// let dy = 1.5 * charHeight;
        let dy = 0;
        for (const entries of data) {
            let dx = 0;
            for (const i in entries) {
                vis.text(entries[i], pos.x + dx, pos.y + dy, style);
                dx += CHAR_WIDTH * (columns[i] + colPadding);
            }
            dy += CHAR_HEIGHT;
        }
    }

    static multitext(lines, pos) {
        if (lines.length === 0) {
            return;
        }
        const vis = new RoomVisual(pos.roomName);
        const style = this.textStyle();
// Draw text
        let dy = 0;
        for (const line of lines) {
            vis.text(line, pos.x, pos.y + dy, style);
            dy += CHAR_HEIGHT;
        }
    }

    static drawHUD() {
        // Draw Overmind logo
        new RoomVisual().multitext(asciiLogo, 0, 0, {textfont: 'monospace'});
// // Display CPU Information
// new RoomVisual().text('CPU:' + ' bucket:' + Game.cpu.bucket +
// 					  ' tickLimit:' + Game.cpu.tickLimit, column, row, style);
    }

    /* Draws the Overmind logo using component coordinates extracted with Mathematica. This  uses about 0.2 CPU/tick */
    static drawLogo() {
        new RoomVisual().poly(logoComponents.black.points, logoComponents.black.style)
            .poly(logoComponents.dgray.points, logoComponents.dgray.style)
            .poly(logoComponents.lgray.points, logoComponents.lgray.style)
            .poly(logoComponents.blue.points, logoComponents.blue.style)
            .poly(logoComponents.red.points, logoComponents.red.style)
            .poly(logoComponents.purple.points, logoComponents.purple.style)
            .poly(logoComponents.pink.points, logoComponents.pink.style)
            .poly(logoText.V.points, logoText.V.style)
            .poly(logoText.E.points, logoText.E.style)
            .poly(logoText.R1.points, logoText.R1.style)
            .poly(logoText.R2.points, logoText.R2.style)
            .poly(logoText.M.points, logoText.M.style)
            .poly(logoText.I.points, logoText.I.style)
            .poly(logoText.N.points, logoText.N.style)
            .poly(logoText.D.points, logoText.D.style);
    }

    static drawNotifications(notificationMessages) {
        // const vis = new RoomVisual();
        const x = 10.5;
        const y = 7;
        if (notificationMessages.length == 0) {
            notificationMessages = ['No notifications'];
        }
        const maxStringLength = _.max(_.map(notificationMessages, msg => msg.length));
        const width = Math.max(11, 1.2 * CHAR_WIDTH * maxStringLength);
        this.infoBox('Notifications', notificationMessages, {x, y}, width);
    }

// static colonyReport(colonyName, text[]) {
// 	if (!this.enabled) return;
// 	new RoomVisual(colonyName).multitext(text, 0, 4, {textfont: 'monospace', textsize: 0.75});
// }

    static drawGraphs() {
        this.text(`CPU`, {x: 1, y: 7});
        this.barGraph(Memory.stats.persistent.avgCPU / Game.cpu.limit, {x: 2.75, y: 7});
        this.text(`BKT`, {x: 1, y: 8});
        this.barGraph(Game.cpu.bucket / 10000, {x: 2.75, y: 8});
        this.text(`GCL`, {x: 1, y: 9});
        this.barGraph(Game.gcl.progress / Game.gcl.progressTotal, {x: 2.75, y: 9});
    }

    static summary() {
        this.text(`Colonies: ${_.keys(Overmind.colonies).length} | Creeps: ${_.keys(Game.creeps).length}`, {
            x: 1,
            y: 10
        }, .93);
    }

// This typically takes about 0.3-0.6 CPU in total
    static visuals() {
        this.drawLogo();
        this.drawGraphs();
// this.drawNotifications();
        this.summary();
    }
}


RoomVisual.prototype.infoBox = function (info, x, y, opts = {}) {
    _.defaults(opts, {
        color: colors.infoBoxGood,
        textstyle: false,
        textsize: speechSize,
        textfont: 'verdana',
        opacity: 0.7,
    });

    let fontstring = '';
    if (opts.textstyle) {
        fontstring = opts.textstyle + ' ';
    }
    fontstring += opts.textsize + ' ' + opts.textfont;

    let pointer = [
        [.9, -0.25],
        [.9, 0.25],
        [0.3, 0.0],
    ];
    pointer = relPoly(x, y, pointer);
    pointer.push(pointer[0]);

    // Draw arrow
    this.poly(pointer, {
        fill: undefined,
        stroke: opts.color,
        opacity: opts.opacity,
        strokeWidth: 0.0
    });

    // // Draw box
    // this.rect(x + 0.9, y - 0.8 * opts.textsize,
    // 	0.55 * opts.textsize * _.max(_.map(info, line => line.length)), info.length * opts.textsize,
    // 	{
    // 		fill   : undefined,
    // 		opacity: opts.opacity
    // 	});

    // Draw vertical bar
    const x0 = x + 0.9;
    const y0 = y - 0.8 * opts.textsize;
    this.line(x0, y0, x0, y0 + info.length * opts.textsize, {
        color: opts.color,
    });

    // Draw text
    let dy = 0;
    for (const line of info) {
        this.text(line, x + 1, y + dy, {
            color: opts.color,
            // backgroundColor  : opts.background,
            backgroundPadding: 0.1,
            opacity: opts.opacity,
            font: fontstring,
            align: 'left',
        });
        dy += opts.textsize;
    }

    return this;
};

RoomVisual.prototype.multitext = function (textLines, x, y, opts = {}) {
    _.defaults(opts, {
        color: colors.infoBoxGood,
        textstyle: false,
        textsize: speechSize,
        textfont: 'verdana',
        opacity: 0.7,
    });

    let fontstring = '';
    if (opts.textstyle) {
        fontstring = opts.textstyle + ' ';
    }
    fontstring += opts.textsize + ' ' + opts.textfont;

    // // Draw vertical bar
    // let x0 = x + 0.9;
    // let y0 = y - 0.8 * opts.textsize;
    // this.line(x0, y0, x0, y0 + textLines.length * opts.textsize, {
    // 	color: opts.color,
    // });

    // Draw text
    let dy = 0;
    for (const line of textLines) {
        this.text(line, x, y + dy, {
            color: opts.color,
            // backgroundColor  : opts.background,
            backgroundPadding: 0.1,
            opacity: opts.opacity,
            font: fontstring,
            align: 'left',
        });
        dy += opts.textsize;
    }

    return this;
};

RoomVisual.prototype.box = function (x, y, w, h, style) {
    return this.line(x, y, x + w, y, style)
        .line(x + w, y, x + w, y + h, style)
        .line(x + w, y + h, x, y + h, style)
        .line(x, y + h, x, y, style);
};


// Taken from https://github.com/screepers/RoomVisual with slight modification: ========================================

const colors = {
    gray: '#555555',
    light: '#AAAAAA',
    road: '#666', // >:D
    energy: '#FFE87B',
    power: '#F53547',
    dark: '#181818',
    outline: '#8FBB93',
    speechText: '#000000',
    speechBackground: '#aebcc4',
    infoBoxGood: '#09ff00',
    infoBoxBad: '#ff2600'
};

const speechSize = 0.5;
const speechFont = 'Times New Roman';

RoomVisual.prototype.structure = function (x, y, type, opts = {}) {
    _.defaults(opts, {opacity: 0.5});
    switch (type) {
        case STRUCTURE_EXTENSION:
            this.circle(x, y, {
                radius: 0.5,
                fill: colors.dark,
                stroke: colors.outline,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
            this.circle(x, y, {
                radius: 0.35,
                fill: colors.gray,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_SPAWN:
            this.circle(x, y, {
                radius: 0.65,
                fill: colors.dark,
                stroke: '#CCCCCC',
                strokeWidth: 0.10,
                opacity: opts.opacity
            });
            this.circle(x, y, {
                radius: 0.40,
                fill: colors.energy,
                opacity: opts.opacity
            });

            break;
        case STRUCTURE_POWER_SPAWN:
            this.circle(x, y, {
                radius: 0.65,
                fill: colors.dark,
                stroke: colors.power,
                strokeWidth: 0.10,
                opacity: opts.opacity
            });
            this.circle(x, y, {
                radius: 0.40,
                fill: colors.energy,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_LINK: {
            // let osize = 0.3;
            // let isize = 0.2;
            let outer = [
                [0.0, -0.5],
                [0.4, 0.0],
                [0.0, 0.5],
                [-0.4, 0.0]
            ];
            let inner = [
                [0.0, -0.3],
                [0.25, 0.0],
                [0.0, 0.3],
                [-0.25, 0.0]
            ];
            outer = relPoly(x, y, outer);
            inner = relPoly(x, y, inner);
            outer.push(outer[0]);
            inner.push(inner[0]);
            this.poly(outer, {
                fill: colors.dark,
                stroke: colors.outline,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
            this.poly(inner, {
                fill: colors.gray,
                stroke: false,
                opacity: opts.opacity
            });
            break;
        }
        case STRUCTURE_TERMINAL: {
            let outer = [
                [0.0, -0.8],
                [0.55, -0.55],
                [0.8, 0.0],
                [0.55, 0.55],
                [0.0, 0.8],
                [-0.55, 0.55],
                [-0.8, 0.0],
                [-0.55, -0.55],
            ];
            let inner = [
                [0.0, -0.65],
                [0.45, -0.45],
                [0.65, 0.0],
                [0.45, 0.45],
                [0.0, 0.65],
                [-0.45, 0.45],
                [-0.65, 0.0],
                [-0.45, -0.45],
            ];
            outer = relPoly(x, y, outer);
            inner = relPoly(x, y, inner);
            outer.push(outer[0]);
            inner.push(inner[0]);
            this.poly(outer, {
                fill: colors.dark,
                stroke: colors.outline,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
            this.poly(inner, {
                fill: colors.light,
                stroke: false,
                opacity: opts.opacity
            });
            this.rect(x - 0.45, y - 0.45, 0.9, 0.9, {
                fill: colors.gray,
                stroke: colors.dark,
                strokeWidth: 0.1,
                opacity: opts.opacity
            });
            break;
        }
        case STRUCTURE_LAB:
            this.circle(x, y - 0.025, {
                radius: 0.55,
                fill: colors.dark,
                stroke: colors.outline,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
            this.circle(x, y - 0.025, {
                radius: 0.40,
                fill: colors.gray,
                opacity: opts.opacity
            });
            this.rect(x - 0.45, y + 0.3, 0.9, 0.25, {
                fill: colors.dark,
                stroke: false,
                opacity: opts.opacity
            });
        {
            let box = [
                [-0.45, 0.3],
                [-0.45, 0.55],
                [0.45, 0.55],
                [0.45, 0.3],
            ];
            box = relPoly(x, y, box);
            this.poly(box, {
                stroke: colors.outline,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
        }
            break;
        case STRUCTURE_TOWER:
            this.circle(x, y, {
                radius: 0.6,
                fill: colors.dark,
                stroke: colors.outline,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
            this.rect(x - 0.4, y - 0.3, 0.8, 0.6, {
                fill: colors.gray,
                opacity: opts.opacity
            });
            this.rect(x - 0.2, y - 0.9, 0.4, 0.5, {
                fill: colors.light,
                stroke: colors.dark,
                strokeWidth: 0.07,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_ROAD:
            this.circle(x, y, {
                radius: 0.175,
                fill: colors.road,
                stroke: false,
                opacity: opts.opacity
            });
            if (!this.roads) this.roads = [];
            this.roads.push([x, y]);
            break;
        case STRUCTURE_RAMPART:
            this.circle(x, y, {
                radius: 0.65,
                fill: '#434C43',
                stroke: '#5D735F',
                strokeWidth: 0.10,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_WALL:
            this.circle(x, y, {
                radius: 0.40,
                fill: colors.dark,
                stroke: colors.light,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_STORAGE:
            const storageOutline = relPoly(x, y, [
                [-0.45, -0.55],
                [0, -0.65],
                [0.45, -0.55],
                [0.55, 0],
                [0.45, 0.55],
                [0, 0.65],
                [-0.45, 0.55],
                [-0.55, 0],
                [-0.45, -0.55],
            ]);
            this.poly(storageOutline, {
                stroke: colors.outline,
                strokeWidth: 0.05,
                fill: colors.dark,
                opacity: opts.opacity
            });
            this.rect(x - 0.35, y - 0.45, 0.7, 0.9, {
                fill: colors.energy,
                opacity: opts.opacity,
            });
            break;
        case STRUCTURE_OBSERVER:
            this.circle(x, y, {
                fill: colors.dark,
                radius: 0.45,
                stroke: colors.outline,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
            this.circle(x + 0.225, y, {
                fill: colors.outline,
                radius: 0.20,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_NUKER:
            let outline = [
                [0, -1],
                [-0.47, 0.2],
                [-0.5, 0.5],
                [0.5, 0.5],
                [0.47, 0.2],
                [0, -1],
            ];
            outline = relPoly(x, y, outline);
            this.poly(outline, {
                stroke: colors.outline,
                strokeWidth: 0.05,
                fill: colors.dark,
                opacity: opts.opacity
            });
            let inline = [
                [0, -.80],
                [-0.40, 0.2],
                [0.40, 0.2],
                [0, -.80],
            ];
            inline = relPoly(x, y, inline);
            this.poly(inline, {
                stroke: colors.outline,
                strokeWidth: 0.01,
                fill: colors.gray,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_CONTAINER:
            this.rect(x - 0.225, y - 0.3, 0.45, 0.6, {
                fill: 'yellow',
                opacity: opts.opacity,
                stroke: colors.dark,
                strokeWidth: 0.10,
            });
            break;
        default:
            this.circle(x, y, {
                fill: colors.light,
                radius: 0.35,
                stroke: colors.dark,
                strokeWidth: 0.20,
                opacity: opts.opacity
            });
            break;
    }

    return this;
};

const dirs = [
    [],
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1]
];

RoomVisual.prototype.connectRoads = function (opts = {}) {
    _.defaults(opts, {opacity: 0.5});
    const color = opts.color || colors.road || 'white';
    if (!this.roads) return;
    // this.text(this.roads.map(r=>r.join(',')).join(' '),25,23)
    this.roads.forEach((r) => {
        // this.text(`${r[0]},${r[1]}`,r[0],r[1],{ size: 0.2 })
        for (let i = 1; i <= 4; i++) {
            const d = dirs[i];
            const c = [r[0] + d[0], r[1] + d[1]];
            const rd = _.some(this.roads, r => r[0] == c[0] && r[1] == c[1]);
            // this.text(`${c[0]},${c[1]}`,c[0],c[1],{ size: 0.2, color: rd?'green':'red' })
            if (rd) {
                this.line(r[0], r[1], c[0], c[1], {
                    color: color,
                    width: 0.35,
                    opacity: opts.opacity
                });
            }
        }
    });

    return this;
};


RoomVisual.prototype.speech = function (text, x, y, opts = {}) {
    const background = !!opts.background ? opts.background : colors.speechBackground;
    const textcolor = !!opts.textcolor ? opts.textcolor : colors.speechText;
    // noinspection PointlessBooleanExpressionJS
    const textstyle = !!opts.textstyle ? opts.textstyle : false;
    const textsize = !!opts.textsize ? opts.textsize : speechSize;
    const textfont = !!opts.textfont ? opts.textfont : speechFont;
    const opacity = !!opts.opacity ? opts.opacity : 1;

    let fontstring = '';
    if (textstyle) {
        fontstring = textstyle + ' ';
    }
    fontstring += textsize + ' ' + textfont;

    let pointer = [
        [-0.2, -0.8],
        [0.2, -0.8],
        [0, -0.3]
    ];
    pointer = relPoly(x, y, pointer);
    pointer.push(pointer[0]);

    this.poly(pointer, {
        fill: background,
        stroke: background,
        opacity: opacity,
        strokeWidth: 0.0
    });

    this.text(text, x, y - 1, {
        color: textcolor,
        backgroundColor: background,
        backgroundPadding: 0.1,
        opacity: opacity,
        font: fontstring
    });

    return this;
};


RoomVisual.prototype.animatedPosition = function (x, y, opts = {}) {

    const color = !!opts.color ? opts.color : 'blue';
    const opacity = !!opts.opacity ? opts.opacity : 0.5;
    let radius = !!opts.radius ? opts.radius : 0.75;
    const frames = !!opts.frames ? opts.frames : 6;


    const angle = (Game.time % frames * 90 / frames) * (Math.PI / 180);
    const s = Math.sin(angle);
    const c = Math.cos(angle);

    const sizeMod = Math.abs(Game.time % frames - frames / 2) / 10;
    radius += radius * sizeMod;

    const points = [
        rotate(0, -radius, s, c, x, y),
        rotate(radius, 0, s, c, x, y),
        rotate(0, radius, s, c, x, y),
        rotate(-radius, 0, s, c, x, y),
        rotate(0, -radius, s, c, x, y),
    ];

    this.poly(points, {stroke: color, opacity: opacity});

    return this;
};

function rotate(x, y, s, c, px, py) {
    const xDelta = x * c - y * s;
    const yDelta = x * s + y * c;
    return {x: px + xDelta, y: py + yDelta};
}


function relPoly(x, y, poly) {
    return poly.map(p => {
        p[0] += x;
        p[1] += y;
        return p;
    });
}

RoomVisual.prototype.test = function () {
    const demopos = [19, 24];
    this.clear();
    this.structure(demopos[0] + 0, demopos[1] + 0, STRUCTURE_LAB);
    this.structure(demopos[0] + 1, demopos[1] + 1, STRUCTURE_TOWER);
    this.structure(demopos[0] + 2, demopos[1] + 0, STRUCTURE_LINK);
    this.structure(demopos[0] + 3, demopos[1] + 1, STRUCTURE_TERMINAL);
    this.structure(demopos[0] + 4, demopos[1] + 0, STRUCTURE_EXTENSION);
    this.structure(demopos[0] + 5, demopos[1] + 1, STRUCTURE_SPAWN);

    this.animatedPosition(demopos[0] + 7, demopos[1]);

    this.speech('This is a test!', demopos[0] + 10, demopos[1], {opacity: 0.7});

    // this.infoBox(['This is', 'a test', 'mmmmmmmmmmmmm'], demopos[0] + 15, demopos[1]);

    return this;
};

const ColorSets = {
    white: ['#ffffff', '#4c4c4c'],
    grey: ['#b4b4b4', '#4c4c4c'],
    red: ['#ff7b7b', '#592121'],
    yellow: ['#fdd388', '#5d4c2e'],
    green: ['#00f4a2', '#236144'],
    blue: ['#50d7f9', '#006181'],
    purple: ['#a071ff', '#371383'],
};

const ResourceColors = {
    [RESOURCE_ENERGY]: ColorSets.yellow,
    [RESOURCE_POWER]: ColorSets.red,

    [RESOURCE_HYDROGEN]: ColorSets.grey,
    [RESOURCE_OXYGEN]: ColorSets.grey,
    [RESOURCE_UTRIUM]: ColorSets.blue,
    [RESOURCE_LEMERGIUM]: ColorSets.green,
    [RESOURCE_KEANIUM]: ColorSets.purple,
    [RESOURCE_ZYNTHIUM]: ColorSets.yellow,
    [RESOURCE_CATALYST]: ColorSets.red,
    [RESOURCE_GHODIUM]: ColorSets.white,

    [RESOURCE_HYDROXIDE]: ColorSets.grey,
    [RESOURCE_ZYNTHIUM_KEANITE]: ColorSets.grey,
    [RESOURCE_UTRIUM_LEMERGITE]: ColorSets.grey,

    [RESOURCE_UTRIUM_HYDRIDE]: ColorSets.blue,
    [RESOURCE_UTRIUM_OXIDE]: ColorSets.blue,
    [RESOURCE_KEANIUM_HYDRIDE]: ColorSets.purple,
    [RESOURCE_KEANIUM_OXIDE]: ColorSets.purple,
    [RESOURCE_LEMERGIUM_HYDRIDE]: ColorSets.green,
    [RESOURCE_LEMERGIUM_OXIDE]: ColorSets.green,
    [RESOURCE_ZYNTHIUM_HYDRIDE]: ColorSets.yellow,
    [RESOURCE_ZYNTHIUM_OXIDE]: ColorSets.yellow,
    [RESOURCE_GHODIUM_HYDRIDE]: ColorSets.white,
    [RESOURCE_GHODIUM_OXIDE]: ColorSets.white,

    [RESOURCE_UTRIUM_ACID]: ColorSets.blue,
    [RESOURCE_UTRIUM_ALKALIDE]: ColorSets.blue,
    [RESOURCE_KEANIUM_ACID]: ColorSets.purple,
    [RESOURCE_KEANIUM_ALKALIDE]: ColorSets.purple,
    [RESOURCE_LEMERGIUM_ACID]: ColorSets.green,
    [RESOURCE_LEMERGIUM_ALKALIDE]: ColorSets.green,
    [RESOURCE_ZYNTHIUM_ACID]: ColorSets.yellow,
    [RESOURCE_ZYNTHIUM_ALKALIDE]: ColorSets.yellow,
    [RESOURCE_GHODIUM_ACID]: ColorSets.white,
    [RESOURCE_GHODIUM_ALKALIDE]: ColorSets.white,

    [RESOURCE_CATALYZED_UTRIUM_ACID]: ColorSets.blue,
    [RESOURCE_CATALYZED_UTRIUM_ALKALIDE]: ColorSets.blue,
    [RESOURCE_CATALYZED_KEANIUM_ACID]: ColorSets.purple,
    [RESOURCE_CATALYZED_KEANIUM_ALKALIDE]: ColorSets.purple,
    [RESOURCE_CATALYZED_LEMERGIUM_ACID]: ColorSets.green,
    [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]: ColorSets.green,
    [RESOURCE_CATALYZED_ZYNTHIUM_ACID]: ColorSets.yellow,
    [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]: ColorSets.yellow,
    [RESOURCE_CATALYZED_GHODIUM_ACID]: ColorSets.white,
    [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: ColorSets.white,
};


RoomVisual.prototype.resource = function (type, x, y, size = 0.25, opacity = 1) {
    if (type == RESOURCE_ENERGY || type == RESOURCE_POWER) {
        this._fluid(type, x, y, size, opacity);
    } else if (([RESOURCE_CATALYST, RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_LEMERGIUM, RESOURCE_UTRIUM,
        RESOURCE_ZYNTHIUM, RESOURCE_KEANIUM])
        .includes(type)) {
        this._mineral(type, x, y, size, opacity);
    } else if (ResourceColors[type] != undefined) {
        this._compound(type, x, y, size, opacity);
    } else {
        return ERR_INVALID_ARGS;
    }
    return OK;
};

RoomVisual.prototype._fluid = function (type, x, y, size = 0.25, opacity = 1) {
    this.circle(x, y, {
        radius: size,
        fill: ResourceColors[type][0],
        opacity: opacity,
    });
    this.text(type[0], x, y - (size * 0.1), {
        font: (size * 1.5),
        color: ResourceColors[type][1],
        backgroundColor: ResourceColors[type][0],
        backgroundPadding: 0,
        opacity: opacity
    });
};

RoomVisual.prototype._mineral = function (type, x, y, size = 0.25, opacity = 1) {
    this.circle(x, y, {
        radius: size,
        fill: ResourceColors[type][0],
        opacity: opacity,
    });
    this.circle(x, y, {
        radius: size * 0.8,
        fill: ResourceColors[type][1],
        opacity: opacity,
    });
    this.text(type, x, y + (size * 0.03), {
        font: 'bold ' + (size * 1.25) + ' arial',
        color: ResourceColors[type][0],
        backgroundColor: ResourceColors[type][1],
        backgroundPadding: 0,
        opacity: opacity
    });
};

RoomVisual.prototype._compound = function (type, x, y, size = 0.25, opacity = 1) {
    const label = type.replace('2', '₂');

    this.text(label, x, y, {
        font: 'bold ' + (size * 1) + ' arial',
        color: ResourceColors[type][1],
        backgroundColor: ResourceColors[type][0],
        backgroundPadding: 0.3 * size,
        opacity: opacity
    });
};