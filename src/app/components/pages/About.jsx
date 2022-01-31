import { Component } from 'react';
import { APP_NAME, APP_URL } from 'app/client_config';
import tt from 'counterpart';

class About extends Component {
    render() {
        return (
            <div className="About">
                <section className="AboutMission">
                    <div className="AboutMission__heading-container">
                        <h1 className="AboutMission__heading">About Blurtlatam</h1>
                        <p>Blurtlatam is run by a team of witnesses including freakeao, blurthispano and blurtlatam. We want to boost the emerging communities but especially the Spanish community.</p>
                        <p>This frontend we are running to support Blurt Blog and to provide an alternate way to access frontend.</p>
                    </div>

                    <div className="row">
                        <div className="column">
                            <b>Maintained By</b> @freakeao and @tekraze
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
