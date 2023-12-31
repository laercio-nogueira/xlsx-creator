"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = exports.parseMetadata = exports.parse = void 0;
const xlsx_1 = require("./lib/xlsx");
const helpers_1 = require("./lib/helpers");
const workbook_1 = require("./lib/workbook");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parse = (mixed, options = {}) => {
    const { dateNF, header = 1, range, blankrows, defval, raw = true, rawNumbers, ...otherOptions } = options;
    const workBook = (0, helpers_1.isString)(mixed)
        ? (0, xlsx_1.readFile)(mixed, { dateNF, raw, ...otherOptions })
        : (0, xlsx_1.read)(mixed, { dateNF, raw, ...otherOptions });
    return Object.keys(workBook.Sheets).map((name) => {
        const sheet = workBook.Sheets[name];
        return {
            name,
            data: xlsx_1.utils.sheet_to_json(sheet, {
                dateNF,
                header,
                range: typeof range === 'function' ? range(sheet) : range,
                blankrows,
                defval,
                raw,
                rawNumbers,
            }),
        };
    });
};
exports.parse = parse;
const parseMetadata = (mixed, options = {}) => {
    const workBook = (0, helpers_1.isString)(mixed) ? (0, xlsx_1.readFile)(mixed, options) : (0, xlsx_1.read)(mixed, options);
    return Object.keys(workBook.Sheets).map((name) => {
        const sheet = workBook.Sheets[name];
        return { name, data: sheet['!ref'] ? xlsx_1.utils.decode_range(sheet['!ref']) : null };
    });
};
exports.parseMetadata = parseMetadata;
const build = (worksheets, { parseOptions = {}, writeOptions = {}, sheetOptions = {}, ...otherOptions } = {}) => {
    const { bookType = 'xlsx', bookSST = false, type = 'buffer', ...otherWriteOptions } = writeOptions;
    const legacyOptions = Object.keys(otherOptions).filter((key) => {
        if (['!cols', '!rows', '!merges', '!protect', '!autofilter'].includes(key)) {
            console.debug(`Deprecated options['${key}'], please use options.sheetOptions['${key}'] instead.`);
            return true;
        }
        console.debug(`Unknown options['${key}'], please use options.parseOptions / options.writeOptions`);
        return false;
    });
    const workBook = worksheets.reduce((soFar, { name, data, options = {} }, index) => {
        const sheetName = name || `Sheet_${index}`;
        const sheetData = xlsx_1.utils.aoa_to_sheet(data, parseOptions);
        soFar.SheetNames.push(sheetName);
        soFar.Sheets[sheetName] = sheetData;
        Object.assign(soFar.Sheets[sheetName], legacyOptions, sheetOptions, options);
        return soFar;
    }, new workbook_1.WorkBook());
    return (0, xlsx_1.write)(workBook, { bookType, bookSST, type, ...otherWriteOptions });
};
exports.build = build;
exports.default = { parse: exports.parse, parseMetadata: exports.parseMetadata, build: exports.build };
