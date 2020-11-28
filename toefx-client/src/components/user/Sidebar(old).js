import React, { Component } from 'react';
//import '../../componentsStyle/Sidebar.css'
import dashboardIcon from '../../icons/dashboard.png';
import scheduleIcon from '../../icons/schedule.png';
import reportIcon from '../../icons/report.png';
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

                        {/* My Dashboard */}
                            <a href="/user">
                                <div className={window.location.pathname === "/user" ? "sidebarItem active" : "sidebarItem"}>
                                    <img className="icon" src={dashboardIcon} alt="dashbord icon"></img>
                                    <h6 className="itemText" >My Dashboard</h6>
                                </div>
                            </a>

                        {/* Treatment Schedule */}
                        <a href="/user/schedule">
                            <div className={window.location.pathname === "/user/schedule" ? "sidebarItem active" : "sidebarItem"} >
                                <img className="icon" src={scheduleIcon} alt="schedule icon"></img>
                                <h6 className="itemText">Treatment Schedule</h6>
                            </div>
                        </a>

                        {/* Lab report */}
                        <a href="/user/labreports">
                            <div className={window.location.pathname === "/user/labreports" ? "sidebarItem active" : "sidebarItem"}>
                                <img className="icon" src={reportIcon} alt="report icon"></img>
                                <h6 className="itemText">Lab Reports</h6>
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
                        <a href="/user/myAccount">
                            <div className="logoutAndMyAccount">
                                <h6 className="itemText">My Account</h6>
                            </div>
                        </a>
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
