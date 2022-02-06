import React, { Component } from 'react';
import { connect } from 'react-redux';
import Icon from './Icon';

class Blacklist extends Component {
    render() {
        const { blacklist, author, coalStatus } = this.props; // redux

        if (coalStatus === 'enabled') {
            const blacklisted = blacklist.get(author);
            if (blacklisted !== undefined) {
                const description = `@${blacklisted.reason}: ${blacklisted.notes}\nIf you believe this is in error, please contact us in #apeals discord.blurt.world`;
                return (
                    <span title={description}>
                        <Icon name="alert" />
                    </span>
                );
            }
        }
        return null;
    }
}

export default connect((state, ownProps) => {
    // const userPreferences = state.app.get('user_preferences').toJS();
    const coalStatus = 'enabled';
    const blacklist =
        state.global.getIn(['blacklist']) == undefined
            ? undefined
            : state.global.getIn(['blacklist']);
    return {
        blacklist,
        coalStatus,
    };
})(Blacklist);
