/* eslint-disable import/no-import-module-exports */
import React, { Component } from 'react';

class About extends Component {
    render() {
        return (
            <div className="About">
                <section className="AboutMission">
                    <div className="AboutMission__heading-container">
                        <h1 className="AboutMission__heading">About Blurtblog.tekraze</h1>
                        <h2>This frontend is run by Dev and Witness @tekraze to support blurt blog</h2>
                        <p>This frontend we are running to support Blurt Blog and to provide an alternate way to access frontend.</p>
                    </div>

                    <div className="row">
                        <div className="column">
                            <b>Maintained By</b> @tekraze
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

module.exports = {
    path: 'about.html',
    component: About,
};
