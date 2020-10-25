import React, { Component } from 'react'
import { connect } from 'react-redux';

class User extends Component {
    render() {
        return (
            <div>
                {this.props.auth.user.name}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps)(User);