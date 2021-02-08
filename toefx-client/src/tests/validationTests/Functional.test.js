import Axios from 'axios';
import { mount, shallow } from 'enzyme';
import React from 'react';
import Signup from '../../components/Signup';
import Login from '../../components/Login';
import { config } from '../../config';
import Upload from '../../components/user/Upload';
import { Provider } from 'react-redux';
import store from '../../Redux/store';
import ResetPassword from '../../components/user/ResetPassword';
import { SetAuthHeader } from '../../Utils';
import MyAccount from '../../components/user/MyAccount';
import Sidebar from '../../components/user/Sidebar';
import Schedule from '../../components/user/Schedule';
import User from '../../components/user/User';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let allStates =
{
    name: "Validation Test",
    email: "ValidTest@gmail.com",
    password: "validPass1",
    confirmedPassword: "validPass1",
    age: "22"
};

describe("Functional: Users must be able to create accounts", () => {
    it("Creating account and checking if its created", async () => {
        let mockedHistory = { push: jest.fn() }
        let component = shallow(<Signup history={mockedHistory} />);

        component.setState(allStates);

        //creating the test user
        await component.instance().handleSignup({ preventDefault: () => { } })
        expect(mockedHistory.push).toHaveBeenCalledWith('/login');

        //trying to create it again but it will say that the account already exists
        await component.instance().handleSignup({ preventDefault: () => { } })
        expect(component.state('accountExistsError')).toBe(true);

        
    });

});

describe("Functional: The program must let the user log into their existing account", () => {
    let mockedHistory, component;
    let ValidUser;

    beforeEach(() => {
        ValidUser = { email: "demoTEST@gmail.com", password: "123test" }
        mockedHistory = { push: jest.fn() }
        component = shallow(<Login history={mockedHistory} />);
    })

    it("User login", async () => {

        window.location.reload = jest.fn();
        component.setState({ email: ValidUser.email, password: ValidUser.password });

        //Logging in
        await component.instance().handleLoginPatient({ preventDefault: () => { } })

        //InvalidUser state remained false
        expect(component.state('invalidUser')).toBe(false);

    });

    it("User should be redirected to their dashboard /user", async () => {

        window.location.reload = jest.fn();
        component.setState({ email: ValidUser.email, password: ValidUser.password });

        //Logging in
        await component.instance().handleLoginPatient({ preventDefault: () => { } })

        //If the page is redirected to /user, it means that the login was successful
        expect(mockedHistory.push).toHaveBeenCalledWith('/user');
    });

});


 /*it('deleting the test account', async () => {    
        await Axios.delete(`${config.dev_server}/user/delete`)
    })*/

describe("The program must notify the user if the uploaded image is not a valid image", () => {

    it('', async () => {
        const ValidUser = { email: "demoTEST@gmail.com", password: "123test" }
        let mockedHistory = { push: jest.fn() }
        let component = mount(<Provider store={store}><Upload history={mockedHistory} /></Provider>);
        component = component.find(Upload).children();

        window.URL.createObjectURL = jest.fn()
        const file = new File([Blob], '../../icons/appointment', { type: 'text' })

        component.setState({selectedFootId : 0 , selectedToeId: 0});
        
        await component.instance().handleUpload({ target: { files: [file] } });

        expect(component.state('invalidFileTypeError')).toBe(true);
    });

    it('deleting the test account', async () => {    
        await Axios.delete(`${config.dev_server}/user/delete`)
    })
});


describe("Functional(F-11): User should be able to see their treatment schedule", () => {
    it("My Account sidebar", async () => {
        
        const ValidUser = { email: "demoTEST@gmail.com", password: "123test" }
        let mockedHistory = { push: jest.fn() }
        //component.setState({email: "demo@gmail.com", age: "12"});
        window.location.reload = jest.fn();
        let mockedStore = mockStore({auth: {isAuth: true}});
        let component = mount(<Provider store={mockedStore}><Schedule history={mockedHistory} /></Provider>);
        //Token for demo user
        SetAuthHeader('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmYjZjYmE4N2Y5ODlkMDY0MDQ3NzAwZSIsIm5hbWUiOiJhc2RmIiwiaWF0IjoxNjExNzA1MzcwfQ.sIL_9vOUJPUNOrZeo1chQiKhhr2zZTSQuU3yGm5pKVU');

        expect(component.find(Schedule).children().state('scheduleData')).toEqual([]);
    });
});


describe("Performance(p-1): Login time must be less than 30 seconds", () => {
    it("User login", async () => {
        let mockedHistory, component;
        let ValidUser;
        ValidUser = { email: "demoTEST@gmail.com", password: "123test" }
        mockedHistory = { push: jest.fn() }
        component = shallow(<Login history={mockedHistory} />);
        //get current time
        var t0 = performance.now();
        window.location.reload = jest.fn();
        component.setState({ email: ValidUser.email, password: ValidUser.password });

        //Logging in
        await component.instance().handleLoginPatient({ preventDefault: () => { } })

        //Time after execution
        var t1 = performance.now();

        //If the page is redirected to /user, it means that the login was successful
        expect(mockedHistory.push).toHaveBeenCalledWith('/user');

        //Time took= t1 - t0
        expect(t1 - t0).toBeLessThan(30000);

    });
});

describe("Performance(p-3): Loading a storyline for viewing should take no more than 20 seconds", () => {
    let mockedHistory, component;
    let ValidUser;
    beforeEach(() => {
        ValidUser = { email: "demoTEST@gmail.com", password: "123test" }
        mockedHistory = { push: jest.fn() }
        component = shallow(<Login history={mockedHistory} />);
    })
    it("storyline loading", async () => {
        jest.restoreAllMocks();

        //get current time
        var t0 = performance.now();
        let componentUser = mount(<Provider store={store}><User history={mockedHistory} /></Provider>);
        //Time after execution
        var t1 = performance.now();
        //Time took= t1 - t0
        expect(t1 - t0).toBeLessThan(20000);
    });
});


