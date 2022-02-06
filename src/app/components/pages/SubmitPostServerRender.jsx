import React, { Component } from 'react';
import tt from 'counterpart';

class SubmitPostServerRender extends Component {
    render() {
        return <div className="text-center">{tt('g.loading')}...</div>;
    }
}

module.exports = {
    path: 'submit.html',
    component: SubmitPostServerRender,
};
