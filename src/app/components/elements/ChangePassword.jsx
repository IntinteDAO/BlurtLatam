/* eslint react/prop-types: 0 */
import { Component } from 'react';
import tt from 'counterpart';
import { Link } from 'react-router';

class ChangePassword extends Component {
    render() {
        return (
            <div>
                {tt('g.external_link_message')}
                {': '}
                <Link to={`${$STM_Config.wallet_url}`}>Wallet</Link>
            </div>
        );
    }
}

export default reduxForm()(ChangePassword);
