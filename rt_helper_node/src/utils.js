const REGEXP = /^([^:]+): (.+)$/;
const SYMBOL = '<f--s!s--f>';

module.exports = {
    parseApiResponce(text, rowsToSlice = 2) {
        const result = {};

        text = text.replace(/\n( +)/gi, SYMBOL);

        for (const record of text.split('\n').slice(rowsToSlice)) {
            if (record) {
                const data = record.match(REGEXP);

                if (data) {
                    if (typeof data[2] === 'string') {
                        data[2] = data[2].replace(new RegExp(SYMBOL, 'gi'), '\n');
                    }
                    result[data[1]] = data[2];
                }
            }
        }

        return result;
    }
}