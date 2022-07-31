import React, { Component } from 'react';
import { connect } from 'react-redux';

class PromotedMember extends Component {
    render() {
        const { promoted_member, author } = this.props; // redux

        const promoted = promoted_member.get(author);

        if (promoted !== undefined) {
            const description = `@${promoted.category}: ${promoted.description}`;
            return (
                <span className="PromotedMember" title={description}>Promoted - { promoted.category}</span>
            );
        }
        return null;
    }
}

export default connect((state) => {
    const promoted_member =
        state.global.getIn(['promoted_members']) == undefined
            ? undefined
            : state.global.getIn(['promoted_members']);
    return {
        promoted_member
    };
})(PromotedMember);
