import { Component } from 'react';
import HelpContent from 'app/components/elements/HelpContent';

class Tos extends Component {
    render() {
        return (
            <div className="row">
                <div className="column large-8 medium-10 small-12">
                    <HelpContent path="tos" title="Terms of Service" />
                </div>
            </div>
        );
    }
}

module.exports = {
    component: Tos,
    path: 'tos.html',
};
