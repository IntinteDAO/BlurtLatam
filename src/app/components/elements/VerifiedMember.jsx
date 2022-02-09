import React, { Component } from 'react';
import { connect } from 'react-redux';

class VerifiedMember extends Component {
    render() {
        const { verified_member, author } = this.props; // redux

        const verified = verified_member.get(author);
        console.log('Verified', verified);
        if (verified !== undefined) {
            const description = `@${verified.category}: ${verified.description}`;
            return (
                <span className="VerifiedMember" title={description}>Member - Verified</span>
            );
        }
        return null;
    }
}

export default connect((state) => {
    const verified_member =
        state.global.getIn(['verified_members']) == undefined
            ? undefined
            : state.global.getIn(['verified_members']);
    return {
        verified_member
    };
})(VerifiedMember);
