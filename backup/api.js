
function* range(beg, end, step = 1) {
    for (let i = beg; i < end; i += step)
        yield i;
}

module.exports = {
    'range': range,
};
