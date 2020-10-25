import React, { Component } from 'react'
import { connect } from 'react-redux';

class User extends Component {
    render() {
        console.log(this.props.auth.user.name)
        return (
            <div>
                {this.props.auth.name}
            </div>
        )
    }
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps)(User);