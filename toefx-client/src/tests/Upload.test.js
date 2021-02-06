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

    describe('processImageValidationResult method', () => {

        it('correct param is passed', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();

            component.setState({ files: [{ name: "firstImage" }] });
            component.instance().processImageValidationResult({ data: "toe" });

            expect(component.state('files')[0]).toEqual({ name: "firstImage", valid: true, text: "Upload success!" });
        });

        it('an empty json is passed as the argument', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();

            component.setState({ files: [{ name: "firstImage" }] });
            component.instance().processImageValidationResult({});

            expect(component.state('files')[0]).toEqual({ name: "firstImage" });
        });

        it('res.data doesnt equal to toe', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();

            component.setState({ files: [{ name: "firstImage" }] });
            component.instance().processImageValidationResult({ data: "something else" });

            expect(component.state('files')[0]).toEqual({ name: "firstImage", valid: false, text: "Please upload a valid image of a toe." });
        });

        it('state variable files has multiple files', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();

            component.setState({ files: [{ name: "firstImage" }, { name: "secondImage" }] });
            component.instance().processImageValidationResult({ data: "toe" });

            expect(component.state('files')[1]).toEqual({ name: "secondImage", valid: true, text: "Upload success!" });
        });
    })

    it('printFileValidationErrorToConsole method', () => {
        let component = mount(<Provider store={store}><Upload /></Provider>);
        component = component.find(Upload).children();
        console.log = jest.fn();
        component.instance().printFileValidationErrorToConsole("not quite right");

        expect(console.log).toHaveBeenCalledWith("not quite right");
    })

    describe('validateImage method', () => {

        it('users is not logged in, request should be sent to notloggedin', () => {
            const store = mockStore({ auth: { isAuth: false } });
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();

            Axios.post = jest.fn(() => Promise.resolve({ data: "toe" }));
            component.instance().validateImage("this.png");

            expect(Axios.post).toHaveBeenCalled();
        });

        it('users is not logged in, server rejects', () => {
            const store = mockStore({ auth: { isAuth: false } });
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();
            Axios.post = jest.fn();
            Axios.post.mockRejectedValueOnce();
            component.instance().validateImage("this.png");

            expect(component.instance().validateImage).toThrow();
        });

        it('users is not logged in, request should be sent to notloggedin', () => {
            const store = mockStore({ auth: { isAuth: true } });
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();

            Axios.get = jest.fn(() => Promise.resolve({ data: "toe" }));
            component.instance().validateImage("this.png");

            expect(Axios.get).toHaveBeenCalled();
        });

        it('users is logged in, server rejects', () => {
            const store = mockStore({ auth: { isAuth: true } });
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();
            Axios.get = jest.fn();
            Axios.get.mockRejectedValueOnce();
            component.instance().validateImage("this.png");

            expect(component.instance().validateImage).toThrow();
        });
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

            window.URL.createObjectURL = jest.fn();
            Axios.post = jest.fn(() => Promise.resolve());
            jest.spyOn(component.instance(), 'validateImage');
            await component.instance().handleUpload({ target: { files: [{ name: "first file", type: "image/png" }] } });

            expect(Axios.post).toHaveBeenCalled();
            expect(component.instance().validateImage).toHaveBeenCalledWith({ name: "first file", type: "image/png" });
        });

        it('sends a post request to the server with the correct data, user not logged in', async () => {
            const store = mockStore({ auth: { isAuth: false } });
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();

            window.URL.createObjectURL = jest.fn();
            Axios.post = jest.fn(() => Promise.resolve({ data: { img: "this.png" } }));
            component.instance().validateImage = jest.fn();
            await component.instance().handleUpload({ target: { files: [{ name: "first file", type: "image/png" }] } });

            expect(Axios.post).toHaveBeenCalled();
            expect(component.instance().validateImage).toHaveBeenCalledWith("this.png");
        });
    })


    describe('handleDiagnose method', () => {

        it('requests the server to run diagnosis and sets the states (logged in)', async () => {

            const store = mockStore({ auth: { isAuth: true } });
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();

            component.setState({ files: [{ name: "firstImage" }] });
            Axios.get = jest.fn(() => Promise.resolve({ data: "toe" }));
            await component.instance().handleDiagnose(0);

            expect(Axios.get).toHaveBeenCalledWith(`${config.dev_server}/diagnose/loggedin/?imageName=firstImage`);
            expect(component.state('diagnosis')).toEqual([{ image: 0, text: "toe", diagnosisButton: true }]);

        });

        it('requests the server to run diagnosis and sets the states (not logged in)', async () => {

            const store = mockStore({ auth: { isAuth: false } });
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();

            component.setState({ tempfileName: "firstImage" });
            Axios.get = jest.fn(() => Promise.resolve({ data: "toe" }));
            await component.instance().handleDiagnose(0);

            expect(Axios.get).toHaveBeenCalledWith(`${config.dev_server}/diagnose/notloggedin/?imageName=firstImage`);
            expect(component.state('diagnosis')).toEqual([{ image: 0, text: "toe", diagnosisButton: true }]);

        });

        it('tempfileName is empty', async () => {

            const store = mockStore({ auth: { isAuth: false } });
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();

            component.setState({ tempfileName: "" });
            Axios.get = jest.fn(() => Promise.resolve({ data: "toe" }));
            await component.instance().handleDiagnose(0);

            expect(Axios.get).toHaveBeenCalledTimes(0);

        });

        it('list index out of range', async () => {

            const store = mockStore({ auth: { isAuth: true } });
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();

            component.setState({ files: [{ name: "firstImage" }] });
            Axios.get = jest.fn(() => Promise.resolve({ data: "toe" }));
            await component.instance().handleDiagnose(10);

            expect(Axios.get).toHaveBeenCalledTimes(0);

        });

    })
    describe('isParamNotSet method', () => {

        it('correct foot id and toe id given', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();
            component.setState({ selectedFootId: 1, selectedToeId: 2 });

            expect(component.instance().isParamNotSet()).toEqual(false);
        });

        it('selectedToeId is -1', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();
            component.setState({ selectedFootId: 1, selectedToeId: -1 });

            expect(component.instance().isParamNotSet()).toEqual(true);
        });

        it('selectedFootId and selectedToeId are -1', () => {
            let component = mount(<Provider store={store}><Upload /></Provider>);
            component = component.find(Upload).children();
            component.setState({ selectedFootId: -1, selectedToeId: -1 });

            expect(component.instance().isParamNotSet()).toEqual(true);
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

    it('printToeButton', () => {
        let component = mount(<Provider store={store}><Upload /></Provider>);
        component = component.find(Upload).children();
        const output = component.instance().printToeButton(0);

        expect(output.key).toBe("0");
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
