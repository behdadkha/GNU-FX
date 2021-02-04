import { mount, shallow } from 'enzyme';
import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Provider } from "react-redux";
import User from '../components/user/User';
import store from '../Redux/store'
import * as setFootAction from '../Redux/Actions/setFootAction'
import { GetImageSrcByURLsAndName } from '../Utils';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { SetCurrentUser } from '../Redux/Actions/authAction';
import Axios from 'axios';
import { config } from '../config';
import { compose } from 'redux';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


let images = [{ name: "this.png", url: "some" }]
let toeData = [
    {
        toes: [
            { images: [{ name: "this.png", date: "2020-11-02", fungalCoverage: "30%" }] },
            { images: [] },
            { images: [] },
            { images: [] },
            { images: [] }
        ]
    }
];
let bigArrayofImages = [
    { imageName: "this.png", url: "thisURL" },
    { imageName: "random.jpeg", url: "randomImageURL" },
    { imageName: "forth.jpeg", url: "forthImageURL" },
    { imageName: "righFoot.png", url: "righFootURL" },
    { imageName: "secondImage index.jpeg", url: "secondImageURL" },
    { imageName: "rightSmall.jpeg", url: "rightSmallURL" },
]
let bigArrayofToeData = {
    feet: [
        {//left foot
            toes: [
                {
                    images: [
                        { name: "this.png", date: "2020-11-02", fungalCoverage: "30%" },
                        { name: "random.jpeg", date: "2010-11-02", fungalCoverage: "10%" }
                    ]
                },
                {
                    images: []
                },
                {
                    images: []
                },
                {
                    images: [
                        { name: "forth.jpeg", date: "2010-11-02", fungalCoverage: "10%" }
                    ]
                },
                {
                    images: [

                    ]
                }
            ]
        },
        {//right foot
            toes: [
                {
                    images: [
                    ]
                },
                {
                    images: [

                    ]
                },
                {
                    images: [
                        { name: "righFoot.png", date: "2020-11-02", fungalCoverage: "30%" },
                        { name: "secondImage index.jpeg", date: "2010-11-02", fungalCoverage: "10%" }
                    ]
                },
                {
                    images: [

                    ]
                },
                {
                    images: [
                        { name: "rightSmall.jpeg", date: "2010-11-02", fungalCoverage: "10%" }
                    ]
                }
            ]
        }
    ]
}
describe("Testing User.js constructor", () => {
    let component, mockedHistory;
    beforeEach(() => {
        mockedHistory = { push: jest.fn() }
        component = shallow(<User store={store} history={mockedHistory} />).dive().dive();
    });

    it("all states are initialized correctly", () => {
        expect(component.state('selectedTreatment')).toEqual(0);
        expect(component.state('selectedTreatment')).toEqual(0);
        expect(component.state('rightFootData').length).toEqual(0);
        expect(component.state('leftFootData').length).toEqual(0);
        expect(component.state('leftFootDates').length).toEqual(0);
        expect(component.state('rightFootDates').length).toEqual(0);
        expect(component.state('toeData')).toEqual({});
        expect(component.state('imageUrls').length).toEqual(0);
        expect(component.state('dataLoaded')).toEqual(false);
    });

});

describe("Testing componentDidMount", () => {
    let component, mockedHistory;
    beforeEach(() => {
        mockedHistory = { push: jest.fn() }
    });

    it("redirects to the main page if not logged in", () => {
        const store = mockStore({ auth: { isAuth: false }, foot: { selectedFoot: 0 } })
        component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);

        expect(mockedHistory.push).toHaveBeenCalledWith('/login');
    });

    it("should call redux store to get toe data and images if currently dont exist", (done) => {
        //const stores = mockStore({ auth: { isAuth: true }, foot: {selectedFoot: 0, images: [], toeData: []} })
        Axios.get = jest.fn(() => Promise.resolve({data: []}));
        store.dispatch(SetCurrentUser("someone"));
        jest.spyOn(setFootAction, 'getAndSaveImages');
        jest.spyOn(setFootAction, 'getAndSaveToeData');
        component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);

        expect(setFootAction.getAndSaveImages).toHaveBeenCalled();

        setTimeout(() => {
            expect(setFootAction.getAndSaveToeData).toHaveBeenCalled();
            done()
        }, 200);
    });

    it("images array toedata have data, imageUrls and toeData states should be set", (done) => {

        const store = mockStore({ auth: { isAuth: true }, foot: { selectedFoot: 0, images: images, toeData: toeData } })

        component = shallow(<User store={store} history={mockedHistory} />).dive().dive();

        expect(component.state('imageUrls')).toEqual(images);
        expect(component.state('toeData')).toEqual(toeData);
        done();
    });

});

describe('processServerFeetData function', () => {
    let imageUrls, toeData, mockedHistory;
    beforeEach(() => {
        imageUrls = [{ imageName: "this.png", url: "some" }]
        toeData = {
            feet: [
                {
                    toes: [
                        { images: [{ name: "this.png", date: "2020-11-02", fungalCoverage: "30%" }] },
                        { images: [] },
                        { images: [] },
                        { images: [] },
                        { images: [] }
                    ]
                }
            ]
        };
        mockedHistory = { push: jest.fn() }
    });
    it("correctly processes the toe data", () => {
        let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
        let instance = component.find(User).children().instance();

        instance.setState({ toeData: toeData, imageUrls: imageUrls });
        let { images, dates, fungalCoverage } = instance.processServerFeetData(0);

        const expectedFungal = [[toeData.feet[0].toes[0].images[0].fungalCoverage], [null], [null], [null], [null]]
        const expectedImages = [[imageUrls[0].url], [], [], [], []]

        expect(images).toEqual(expectedImages)
        expect(dates).toEqual([toeData.feet[0].toes[0].images[0].date])
        expect(fungalCoverage).toEqual(expectedFungal)
    });

    it("can handle state variable toeData and imageUrls are empty", () => {
        let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
        let instance = component.find(User).children().instance();

        instance.setState({ toeData: [], imageUrls: [] });
        let { images, dates, fungalCoverage } = instance.processServerFeetData(0);

        expect(images).toEqual([[], [], [], [], []])
        expect(dates).toEqual([])
        expect(fungalCoverage).toEqual([[], [], [], [], []])
    });

    it("is called with footId = 3", () => {
        let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
        let instance = component.find(User).children().instance();

        instance.setState({ toeData: [], imageUrls: [] });
        let { images, dates, fungalCoverage } = instance.processServerFeetData(3);

        expect(images).toEqual([[], [], [], [], []])
        expect(dates).toEqual([])
        expect(fungalCoverage).toEqual([[], [], [], [], []])
    });

    describe("nulls are propperly placed in arrays with multiple toe enteries", () => {

        beforeEach(() => {
            imageUrls = bigArrayofImages
            toeData = bigArrayofToeData
        });

        it("left foot", () => {

            let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
            let instance = component.find(User).children().instance();

            instance.setState({ toeData: toeData, imageUrls: imageUrls });
            let { images, dates, fungalCoverage } = instance.processServerFeetData(0);

            const expectedFungal = [["30%", "10%"], [null, null], [null, null], [null, null, "10%"], [null, null, null]]
            const expectedImages = [["thisURL", "randomImageURL"], [], [], ["forthImageURL"], []]

            expect(images).toEqual(expectedImages)
            expect(dates).toEqual(["2020-11-02", "2010-11-02", "2010-11-02"])
            expect(fungalCoverage).toEqual(expectedFungal)
        });

        it("right foot", () => {

            let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
            let instance = component.find(User).children().instance();

            instance.setState({ toeData: toeData, imageUrls: imageUrls });
            let { images, dates, fungalCoverage } = instance.processServerFeetData(1);

            const expectedFungal = [[], [], ["30%", "10%"], [null, null], [null, null, "10%"]]
            const expectedImages = [[], [], ["righFootURL", "secondImageURL"], [], ["rightSmallURL"]]

            expect(images).toEqual(expectedImages)
            expect(dates).toEqual(["2020-11-02", "2010-11-02", "2010-11-02"])
            expect(fungalCoverage).toEqual(expectedFungal)
        });

        it("one of the urls is empty", () => {

            imageUrls[5].url = "";
            let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
            let instance = component.find(User).children().instance();

            instance.setState({ toeData: toeData, imageUrls: imageUrls });
            let { images, dates, fungalCoverage } = instance.processServerFeetData(1);

            const expectedFungal = [[], [], ["30%", "10%"], [null, null], [null, null, "10%"]]
            const expectedImages = [[], [], ["righFootURL", "secondImageURL"], [], [""]]

            expect(images).toEqual(expectedImages)
            expect(dates).toEqual(["2020-11-02", "2010-11-02", "2010-11-02"])
            expect(fungalCoverage).toEqual(expectedFungal)
            imageUrls[5].url = "rightSmallURL";
        });
    });

})

describe('organizeDataforGraph method', () => {

    it("calls the processServerFeetData function for both left foot and right foot", () => {
        let mockedHistory = { push: jest.fn() }
        let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
        let instance = component.find(User).children().instance();
        instance.setState({ toeData: bigArrayofToeData, imageUrls: bigArrayofImages });
        jest.spyOn(instance, 'processServerFeetData');

        instance.organizeDataforGraph();

        expect(instance.processServerFeetData).toHaveBeenCalledWith(0);
        expect(instance.processServerFeetData).toHaveBeenCalledWith(1);
    });

    it("populates the state variables by the data recieved from processServerFeetData", () => {
        let mockedHistory = { push: jest.fn() }
        let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
        component = component.find(User).children();
        let instance = component.instance();
        instance.setState({ toeData: bigArrayofToeData, imageUrls: bigArrayofImages });
        jest.spyOn(instance, 'processServerFeetData');

        instance.organizeDataforGraph();

        const expectedLeftFootData = [
            {
                name: 'Big Toe',
                data: ['30%', '10%'],
                images: ['thisURL', 'randomImageURL']
            },
            { name: 'Index Toe', data: [null, null], images: [] },
            { name: 'Middle Toe', data: [null, null], images: [] },
            {
                name: 'Fourth Toe',
                data: [null, null, '10%'],
                images: ['forthImageURL']
            },
            { name: 'Little Toe', data: [null, null, null], images: [] }
        ]
        const expectedLeftFootDates = ['2020-11-02', '2010-11-02', '2010-11-02']
        const expectedRightFootData = [
            { name: 'Big Toe', data: [], images: [] },
            { name: 'Index Toe', data: [], images: [] },
            {
                name: 'Middle Toe',
                data: ['30%', '10%'],
                images: ['righFootURL', 'secondImageURL']
            },
            { name: 'Fourth Toe', data: [null, null], images: [] },
            {
                name: 'Little Toe',
                data: [null, null, '10%'],
                images: ['rightSmallURL']
            }
        ]
        const expectedRightFootDates = ['2020-11-02', '2010-11-02', '2010-11-02'];

        expect(component.state('leftFootData')).toEqual(expectedLeftFootData);
        expect(component.state('leftFootDates')).toEqual(expectedLeftFootDates);
        expect(component.state('rightFootData')).toEqual(expectedRightFootData);
        expect(component.state('rightFootDates')).toEqual(expectedRightFootDates);
        expect(component.state('dataLoaded')).toEqual(true);
    });

    it("toeData is empty", () => {
        let mockedHistory = { push: jest.fn() }
        let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
        component = component.find(User).children();
        let instance = component.instance();

        instance.organizeDataforGraph();

        expect(component.state('leftFootData')).toEqual([]);
        expect(component.state('leftFootDates')).toEqual([]);
        expect(component.state('rightFootData')).toEqual([]);
        expect(component.state('rightFootDates')).toEqual([]);
        expect(component.state('dataLoaded')).toEqual(false);
    });

    it("leftFootData is empty but rightFootData has data", () => {
        let mockedHistory = { push: jest.fn() }
        let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
        component = component.find(User).children();
        let instance = component.instance();

        instance.setState({ leftFootData: [{ feet: [] }], toeData: bigArrayofToeData, imageUrls: bigArrayofImages });
        instance.organizeDataforGraph();

        const expectedLeftFootData = [
            {
                name: 'Big Toe',
                data: ['30%', '10%'],
                images: ['thisURL', 'randomImageURL']
            },
            { name: 'Index Toe', data: [null, null], images: [] },
            { name: 'Middle Toe', data: [null, null], images: [] },
            {
                name: 'Fourth Toe',
                data: [null, null, '10%'],
                images: ['forthImageURL']
            },
            { name: 'Little Toe', data: [null, null, null], images: [] }
        ]
        const expectedLeftFootDates = ['2020-11-02', '2010-11-02', '2010-11-02']
        const expectedRightFootData = [
            { name: 'Big Toe', data: [], images: [] },
            { name: 'Index Toe', data: [], images: [] },
            {
                name: 'Middle Toe',
                data: ['30%', '10%'],
                images: ['righFootURL', 'secondImageURL']
            },
            { name: 'Fourth Toe', data: [null, null], images: [] },
            {
                name: 'Little Toe',
                data: [null, null, '10%'],
                images: ['rightSmallURL']
            }
        ]
        const expectedRightFootDates = ['2020-11-02', '2010-11-02', '2010-11-02'];

        expect(component.state('leftFootData')).toEqual(expectedLeftFootData);
        expect(component.state('leftFootDates')).toEqual(expectedLeftFootDates);
        expect(component.state('rightFootData')).toEqual(expectedRightFootData);
        expect(component.state('rightFootDates')).toEqual(expectedRightFootDates);
        expect(component.state('dataLoaded')).toEqual(true);
    });

    it("Both rightFootData and leftFootData have value", () => {
        let mockedHistory = { push: jest.fn() }
        let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
        component = component.find(User).children();
        let instance = component.instance();

        instance.setState({ leftFootData: [{ feet: [] }], rightFootData: [{ feet: [] }], toeData: bigArrayofToeData, imageUrls: bigArrayofImages });
        instance.organizeDataforGraph();


        expect(component.state('leftFootData')).toEqual([{ feet: [] }]);
        expect(component.state('leftFootDates')).toEqual([]);
        expect(component.state('rightFootData')).toEqual([{ feet: [] }]);
        expect(component.state('rightFootDates')).toEqual([]);
        expect(component.state('dataLoaded')).toEqual(false);
    });
});

describe('printToeData method', () => {

    it("correctly outputs fungal coverage in format: 20% -> 10% -> ...",() => {
        let mockedHistory = { push: jest.fn() }
        let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
        component = component.find(User).children();
        let instance = component.instance();
        instance.setState({toeData: bigArrayofToeData, imageUrls: bigArrayofImages });
        const output = instance.printToeData("1", "Big toe", ["20%", "10%", "1%"]);
        
        expect(output).toEqual(
            <tr key="1">
                <td className="total-details-left-col">Big toe</td>
                <td>20% -> 10% -> 1%</td>
            </tr>
        );
    });

    it("param percentageData is an empty array",() => {
        let mockedHistory = { push: jest.fn() }
        let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
        component = component.find(User).children();
        let instance = component.instance();
        instance.setState({ toeData: bigArrayofToeData, imageUrls: bigArrayofImages });
        const output = instance.printToeData("1", "Big toe", []);
        
        expect(output).toEqual(
            <tr key="1">
                <td className="total-details-left-col">Big toe</td>
                <td>No Data</td>
            </tr>
        );
    });
    
    it("instead of a string for name int is passed ",() => {
        let mockedHistory = { push: jest.fn() }
        let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
        component = component.find(User).children();
        let instance = component.instance();
        instance.setState({ toeData: bigArrayofToeData, imageUrls: bigArrayofImages });
        const output = instance.printToeData("1", 200, ["20%", "10%", "1%"]);
        
        expect(output.props.children[0].props.children).toEqual(200);
    });

})

describe('Testing user.js UI', () => {
    it("shows loading when toe data are not loaded", () => {
        let mockedHistory = { push: jest.fn() }
        let component = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
        component = component.find(User).children();

        expect(component.find("[test-id='loading']").props().children).toEqual("Loading...");
    });
});






