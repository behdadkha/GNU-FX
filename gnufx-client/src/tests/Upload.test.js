import { mount, shallow } from 'enzyme';
import React from 'react';
import { Provider } from "react-redux";
import Upload from '../components/user/Upload';
import store from '../Redux/store'

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Axios from 'axios';
import { config } from '../config';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


describe('Upload.js', () => {
    describe('Component initialization', () => {
        it('States are initialized correctly', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();

            expect(component.state('input')).toEqual("Upload");
            expect(component.state('uploaded')).toEqual(false);
            expect(component.state('files')).toEqual([]);
            expect(component.state('diagnosis')).toEqual([]);
            expect(component.state('uploadProgress')).toEqual(0);
            expect(component.state('tempfileName')).toEqual("");
            expect(component.state('foot')).toEqual("");
            expect(component.state('toe')).toEqual("");
            expect(component.state('selectedFootId')).toEqual(-1);
            expect(component.state('selectedToeId')).toEqual(-1);
            expect(component.state('showChooseFootAndToeError')).toEqual(false);
            expect(component.state('invalidFileTypeError')).toEqual(false);

        });
    })
    it('onBackButtonEvent method', () => {
        let component = mount(<Provider store={store}><Upload /></Provider>);
        component = component.find(Upload).children();
        window.location.reload = jest.fn();

        component.instance().onBackButtonEvent({ preventDefault: () => { } })

        expect(window.location.reload).toHaveBeenCalled();
    })

    it('printFileValidationErrorToConsole method', () => {
        let component = mount(<Provider store={store}><Upload /></Provider>);
        component = component.find(Upload).children();
        console.log = jest.fn();
        component.instance().printFileValidationErrorToConsole("not quite right");

        expect(console.log).toHaveBeenCalledWith("Error validating file: not quite right");
    })

    describe('updateUploadProgress method', () => {
        it('correctly calculates the progress in %', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();
            component.instance().updateUploadProgress({ loaded: 20, total: 70 });

            expect(component.state('uploadProgress')).toBe(Math.round((20 / 70) * 100) + "%");
        });

        it('both total and loaded are zero', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();
            component.instance().updateUploadProgress({ loaded: 0, total: 0 });

            expect(component.state('uploadProgress')).toBe(0);
        });

        it('total is negative', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();
            component.instance().updateUploadProgress({ loaded: 20, total: -30 });

            expect(component.state('uploadProgress')).toBe(0);
        });
    })

    describe('handleUpload method', () => {
        it('sends a post request to the server with the correct data', async () => {
            const store = mockStore({ auth: { isAuth: true } });
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();
            component.setState({files: [{ target: { files: [{ name: "first file", type: "image/png" }] } }] });

            window.URL.createObjectURL = jest.fn();
            Axios.post = jest.fn(() => Promise.resolve());
            await component.instance().handleUpload();

            expect(Axios.post).toHaveBeenCalled();
        });

        it('sends a post request to the server with the correct data, user not logged in', async () => {
            const store = mockStore({ auth: { isAuth: true } });
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();
            component.setState({files: [{ target: { files: [{ name: "first file", type: "image/png" }] } }] });

            window.URL.createObjectURL = jest.fn();
            Axios.post = jest.fn(() => Promise.resolve({ data: { img: "this.png" } }));
            await component.instance().handleUpload();

            expect(Axios.post).toHaveBeenCalled();
        });
    })

    describe('setFoot method', () => {
        it('selectedFootId is set correctly', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();
            component.instance().setFoot(0);
    
            expect(component.state('selectedFootId')).toBe(0);
        })

        it('out of range foot id is passed as the argument', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();
            component.instance().setFoot(5);
    
            expect(component.state('selectedFootId')).toBe(-1);
        })
    })
    
    describe('setToe method', () => {
        it('selectedToeId is set correctly', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();
            component.instance().setToe(0);
    
            expect(component.state('selectedToeId')).toBe(0);
        })

        it('out of range toeId is passed as the argument', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();
            component.instance().setToe(10);
    
            expect(component.state('selectedToeId')).toBe(-1);
        })
    })

    it('printToeButtons', () => {
        let component = mount(<Provider store={store}><Upload /></Provider>);
        component = component.find(Upload).children();
        const output = component.instance().printToeButtons();

        expect(output.props.className).toBe("toolbar");
    })

    it('right foot is selected when printToeButtons is called', () => {
        let component = mount(<Provider store={store}><Upload /></Provider>);
        component = component.find(Upload).children();
        component.setState({selectedFootId: 1});
        const output = component.instance().printToeButtons();
    
        expect(output.props.className).toBe("toolbar");
    })


})
