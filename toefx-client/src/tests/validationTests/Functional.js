import Axios from 'axios';
import { mount, shallow } from 'enzyme';
import React from 'react';
import Signup from '../../components/Signup';
import { config } from '../../config';

let allStates = 
    {
        name : "Validation Test", 
        email: "ValidTest@gmail.com", 
        password: "validPass1", 
        confirmedPassword: "validPass1",
        age: "22"
    };

/*describe("Users must be able to create accounts", () => {
    let component;
    beforeEach(() => {
        //jest.restoreAllMocks();
        //jest.clearAllMocks();
        //jest.resetAllMocks();
        component = shallow(<Signup history={{push: jest.fn()}}/>);
    });
    it("works", async() => {
        
        //let component = shallow(<Signup history={{push: jest.fn()}}/>);
        component.setState(allStates);

        await component.instance().handleSignup({preventDefault : () => {}})

        
        
    });

});*/