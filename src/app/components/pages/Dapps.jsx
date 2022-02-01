/* eslint-disable react/button-has-type */
import React, { Component } from 'react';
import DappsList from '../cards/DappsList';

class Dapps extends Component {
    render() {
        return (
            <div className="text-center">
                <h2>Dapps and Tools on Blurt Ecosystem</h2>
                <hr />
                <div className="row">
                    <div className="column">
                        <DappsList />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'dapps',
    component: Dapps,
};
