import React, { Component } from 'react';
import '../../componentsStyle/Sidebar.css'
import dashboardIcon from '../../icons/dashboard.png';

//redux
import { connect } from "react-redux";
import { logOutUser } from "../../Redux/Actions/authAction";
import store from "../../Redux/store";

class Sidebar extends Component {
    render() {
        return (
            <div className="wrapper">
                <div id="sidebar">
                    <div className="sidebar-header">
                        <h3>Toefx</h3>
                    </div>

                    <div className="components">

                        {/* My Patients */}
                            <a href="/user">
                                <div className={window.location.pathname === "/clinician" ? "sidebarItem active" : "sidebarItem"}>
                                    <img className="icon" src={dashboardIcon} alt="dashbord icon"></img>
                                    <h6 className="itemText" >Patients</h6>
                                </div>
                            </a>

                        {/* Logout */}
                        <div
                            className="logoutAndMyAccount"
                            style={{ marginTop: "40%"}}
                            onClick={() => {
                                store.dispatch(logOutUser());
                                window.location.href = "/";
                                }
                            }
                        >
                            <h6 className="itemText">Log Out</h6>
                        </div>

                        {/*My account */}
                        <div className="logoutAndMyAccount">
                            <h6 className="itemText">My Account</h6>
                        </div>
                    </div>

                </div>
            </div >
        )
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth,
});

export default connect(mapStateToProps)(Sidebar);