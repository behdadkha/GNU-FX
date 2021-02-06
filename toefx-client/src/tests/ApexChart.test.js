import { mount, shallow } from 'enzyme';
import React from 'react';
import ApexChart from '../components/user/ApexChart';
import store from '../Redux/store'

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const LeftFootData = [
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
const LeftFootDates = ['2020-11-02', '2010-11-02', '2010-11-02']
const RightFootData = [
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
const RightFootDates = ['2020-11-02', '2010-11-02', '2010-11-02'];
describe('viewFoot function ApexChart', () => {

    it('saves the selectedFoot in redux store', () => {
        store.dispatch = jest.fn();
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        instance.viewFoot(true);

        expect(store.dispatch).toHaveBeenCalledWith({ "payload": 0, "type": "SET_SELECTED_FOOT" })
    });

    it('saves the selectedFoot in redux store', () => {
        store.dispatch = jest.fn();
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        instance.viewFoot(true);

        expect(component.state('shownToes')).toEqual([true, true, false, false, false]);
        expect(component.state('showLeftFoot')).toBe(true);
        expect(component.state('showingDetails')).toBe(false);
        expect(component.state('treatmentIndex')).toBe(0);
    });

})


describe('resetShownToesData function ApexChart', () => {

    it('correctly filters data for the selected foot', () => {
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        instance.resetShownToesData();

        //shownToes is [true, true, false, false, false] therefore leftFoot indextoe should have two null values
        const expectedGraphData = [
            { "data": ["30%", "10%"], "images": ["thisURL", "randomImageURL"], "name": "Big Toe" },
            { "data": [null, null], "images": [], "name": "Index Toe" },
            { "data": [], "name": "" },
            { "data": [], "name": "" },
            { "data": [], "name": "" }
        ]

        expect(component.state('series')).toEqual(expectedGraphData);
        expect(component.state('options').xaxis.categories).toEqual(["2020-11-02", "2010-11-02", "2010-11-02"]);
    });

})

describe('resetShownToesData function ApexChart', () => {

    it('correctly filters data for the selected foot', () => {
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        instance.resetShownToesData();

        //shownToes is [true, true, false, false, false] therefore leftFoot indextoe should have two null values
        const expectedGraphData = [
            { "data": ["30%", "10%"], "images": ["thisURL", "randomImageURL"], "name": "Big Toe" },
            { "data": [null, null], "images": [], "name": "Index Toe" },
            { "data": [], "name": "" },
            { "data": [], "name": "" },
            { "data": [], "name": "" }
        ]

        expect(component.state('series')).toEqual(expectedGraphData);
        expect(component.state('options').xaxis.categories).toEqual(["2020-11-02", "2010-11-02", "2010-11-02"]);
    });


    it('empty leftFootData', () => {
        let empty = [];
        let component = mount(
            <ApexChart store={store} leftFootData={empty} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        instance.resetShownToesData();

        const expectedGraphData = [
            { "data": [], "name": "" },
            { "data": [], "name": "" },
            { "data": [], "name": "" },
            { "data": [], "name": "" },
            { "data": [], "name": "" }
        ]

        expect(component.state('series')).toEqual(expectedGraphData);
        expect(component.state('options').xaxis.categories).toEqual(["2020-11-02", "2010-11-02", "2010-11-02"]);
    });

})

describe('showToe', () => {
    it('Correctly modifies the shownToes state variable (index toe)', () => {
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        instance.resetShownToesData = jest.fn();
        instance.showToe(1);//index teo


        expect(component.state('shownToes')).toEqual([false, true, false, false, false]);
        expect(component.state('treatmentIndex')).toEqual(2);
        expect(component.state('showingDetails')).toEqual(false);
        expect(instance.resetShownToesData).toHaveBeenCalled();
    });

    it('selectedToe index is out of range', () => {
        let store = mockStore({ foot: { selectedFoot: 1 } });
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={[]}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        instance.showToe(10);//index teo

        expect(component.state('shownToes')).toEqual([true, true, false, false, false]);//initial values
        expect(component.state('treatmentIndex')).toEqual(0);

    });

    it('rightFootData is empty and rightFoot is selected', () => {
        let store = mockStore({ foot: { selectedFoot: 1 } });
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={[]}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        instance.resetShownToesData = jest.fn();
        instance.showToe(2);//index teo


        expect(component.state('shownToes')).toEqual([false, false, true, false, false]);
        expect(component.state('treatmentIndex')).toEqual(2);
        expect(component.state('showingDetails')).toEqual(false);
        expect(instance.resetShownToesData).toHaveBeenCalled();
    });
})

describe('showHideAllToes', () => {

    it('little toe is set to true only', () => {
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        instance.resetShownToesData = jest.fn();
        component.setState({shownToes: [false, false, false, false, true]});
        instance.showHideAllToes();

        expect(component.state('shownToes')).toEqual([true, true, true, true, true]);
        expect(component.state('treatmentIndex')).toEqual(0);
        expect(component.state('showingDetails')).toEqual(false);
    });

    it('all toes are selected, it should hide all', () => {
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        instance.resetShownToesData = jest.fn();
        component.setState({shownToes: [true, true, true, true, true]});
        instance.showHideAllToes();

        expect(component.state('shownToes')).toEqual([false, false, false, false, false]);
        expect(component.state('treatmentIndex')).toEqual(0);
        expect(component.state('showingDetails')).toEqual(false);
    });

})



describe('areAllToesShown', () => {

    it('only little toe is visible', () => {
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        component.setState({shownToes: [false, false, false, false, true]});
        const output = instance.areAllToesShown();

        expect(output).toEqual(false);
    });

    it('all toes are visible', () => {
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        component.setState({shownToes: [true, true, true, true, true]});
        const output = instance.areAllToesShown();

        expect(output).toEqual(true);
    });

})

describe('printToeButton', () => {

    it('returns a button for big toe', () => {
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        component.setState({shownToes: [true, true, true, true, true]});
        const output = instance.printToeButton(2);

        expect(output.props.className).toEqual('btnMiddleToe');
    });

    it('toe id out of range', () => {
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        component.setState({shownToes: [true, true, true, true, true]});
        const output = instance.printToeButton(9);
        
        expect(output).toEqual('');
    });

})

describe('printToeButtons', () => {

    it('rightFoot is selected', () => {
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        component.setState({shownToes: [true, true, true, true, true], showLeftFoot: false});
        const output = instance.printToeButtons();
        
        expect(output.props.className).toEqual('rightFootContainer');
    });

    it('rightFoot is selected', () => {
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        component.setState({shownToes: [true, true, true, true, true], showLeftFoot: true});
        const output = instance.printToeButtons();
        
        expect(output.props.className).toEqual('leftFootContainer');
    });
})

describe('printToeData', () => {
    
    it('rightFoot is selected', () => {
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        component.setState({shownToes: [true, false, true, true, true], showLeftFoot: false});
        const output = instance.printToeData(1, "Big Toe", ['thisURL', 'randomImageURL'], ["10%", "20%"]);

        expect(output.props.children[1].props.children).toEqual('Big Toe');
    });

    it('leftfoot is selected', () => {
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        component.setState({shownToes: [true, false, true, true, true], right: true});
        const output = instance.printToeData(0, "Big Toe", ['thisURL', 'randomImageURL'], ["10%", "20%"]);

        expect(output.props.children[1].props.children).toEqual('Big Toe');
    });

})

describe('printSelectedDateDetails', () => {
    
    it('rightFoot is selected', () => {
        let component = mount(
            <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
                leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
            </ApexChart>
        );

        let instance = component.instance();
        component.setState({shownToes: [true, false, true, true, true], showLeftFoot: false});
        const output = instance.printSelectedDateDetails();
        expect(output.props.className).toEqual('selected-details-container split-graph');
    });

})

describe('showingDetails is true', () => {
    let component = mount(
        <ApexChart store={store} leftFootData={LeftFootData} rightFootData={RightFootData}
            leftFootDates={LeftFootDates} rightFootDates={RightFootDates}>
        </ApexChart>
    );

    jest.spyOn(component.instance(), 'printSelectedDateDetails');
    component.setState({showingDetails: true});

    expect(component.instance().printSelectedDateDetails).toHaveBeenCalled();
})
