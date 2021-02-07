const jestConfig = require("./jest.config");
const utils = require('../utils');
const toeDataSchema = require("../database/toe-dataSchema");

describe('Utils', () => {
    it('run command ', () => {
        expect(utils.runCommand("all")).rejects.toEqual("Can't run this command");
    });
    it('getToeData with correct userid ', () => {
        toeDataSchema.findOne = jest.fn().mockResolvedValue([{userId: '1',feet : [{toes:[{images:[{date: "2021-01-27",name: "0.PNG",fungalCoverage: "43%"}]},]}]}]);
        expect(utils.getToeData('1')).resolves.toEqual([{"feet": [{"toes": [{"images": [{"date": "2021-01-27", "fungalCoverage": "43%", "name": "0.PNG"}]}]}], "userId": "1"}]);
    });
    it('getToeData with wrong userid', () => {
        toeDataSchema.findOne = jest.fn().mockRejectedValueOnce([{userId: '1',feet : [{toes:[{images:[{date: "2021-01-27",name: "0.PNG",fungalCoverage: "43%"}]},]}]}]);
        expect(utils.getToeData('2')).rejects.toEqual("Data not found");
    });
});