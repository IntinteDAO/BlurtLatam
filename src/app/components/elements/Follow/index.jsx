/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import * as transactionActions from 'app/redux/TransactionReducer';
import * as userActions from 'app/redux/UserReducer';
import { Set, Map } from 'immutable';
import tt from 'counterpart';

const { string, bool } = PropTypes;

class Follow extends Component {
    static defaultProps = {
        showFollow: true,
        showMute: true,
        fat: false,
    };

    static propTypes = {
        following: string,
        follower: string, // OPTIONAL default to current user
        showFollow: bool,
        showMute: bool,
        fat: bool,
        children: PropTypes.any,
        showLogin: PropTypes.func.isRequired,
    };

    constructor(props) {
        super();
        this.state = {};
        this.initEvents(props);
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Follow');
    }

    UNSAFE_componentWillUpdate(nextProps) {
        this.initEvents(nextProps);
    }

    followLoggedOut = (e) => {
        // close author preview if present
        const author_preview = document.querySelector('.dropdown-pane.is-open');
        if (author_preview) author_preview.remove();
        // resume authenticate modal
        this.props.showLogin(e);
    };

    initEvents(props) {
        const {
            updateFollow,
            follower,
            following,
            operation_flat_fee,
            bandwidth_kbytes_fee,
        } = props;
        const upd = (type) => {
            if (this.state.busy) return;
            this.setState({ busy: true });
            const done = () => {
                this.setState({ busy: false });
            };
            updateFollow(
                follower,
                following,
                type,
                operation_flat_fee,
                bandwidth_kbytes_fee,
                done
            );
        };
        this.follow = () => {
            upd('blog');
        };
        this.unfollow = () => {
            upd();
        };
        this.ignore = () => {
            upd('ignore');
        };
        this.unignore = () => {
            upd();
        };
    }

    render() {
        const { loading } = this.props;
        if (loading) return (
            <span>
                <LoadingIndicator />
                {' '}
                {tt('g.loading')}
                &hellip;
            </span>
        );
        if (loading !== false) {
            // must know what the user is already following before any update can happen
            return <span />;
        }

        const { follower, following } = this.props; // html
        // Show follow preview for new users
        if (!follower || !following) return (
            <span>
                <label
                    className="button slim hollow secondary"
                    onClick={this.followLoggedOut}
                >
                    {tt('g.follow')}
                </label>
            </span>
        );
        // Can't follow or ignore self
        if (follower === following) return <span />;

        const { followingWhat } = this.props; // redux
        const {
            showFollow, showMute, fat, children
        } = this.props; // html
        const { busy } = this.state;

        const cnBusy = busy ? 'disabled' : '';
        const cnActive = 'button' + (fat ? '' : ' slim');
        const cnInactive = cnActive + ' hollow secondary ' + cnBusy;
        return (
            <span>
                {showFollow && followingWhat !== 'blog' && (
                    <label className={cnInactive} onClick={this.follow}>
                        {tt('g.follow')}
                    </label>
                )}

                {showFollow && followingWhat === 'blog' && (
                    <label className={cnInactive} onClick={this.unfollow}>
                        {tt('g.unfollow')}
                    </label>
                )}

                {showMute && followingWhat !== 'ignore' && (
                    <label className={cnInactive} onClick={this.ignore}>
                        {tt('g.mute')}
                    </label>
                )}

                {showMute && followingWhat === 'ignore' && (
                    <label className={cnInactive} onClick={this.unignore}>
                        {tt('g.unmute')}
                    </label>
                )}

                {children && (
                    <span>
                        &nbsp;&nbsp;
                        {children}
                    </span>
                )}
            </span>
        );
    }
}

const emptyMap = Map();
const emptySet = Set();

export default connect(
    (state, ownProps) => {
        let { follower } = ownProps;
        if (!follower) {
            const current_user = state.user.get('current');
            follower = current_user ? current_user.get('username') : null;
        }

        const { following } = ownProps;
        const f = state.global.getIn(
            ['follow', 'getFollowingAsync', follower],
            emptyMap
        );

        // the line below was commented out by val - I think it's broken so sometimes the loading indicator is shown forever
        // const loading = f.get('blog_loading', false) || f.get('ignore_loading', false)
        const loading = false;

        const followingWhat = f.get('blog_result', emptySet).contains(following)
            ? 'blog'
            : f.get('ignore_result', emptySet).contains(following)
                ? 'ignore'
                : null;

        return {
            follower,
            following,
            followingWhat,
            loading,
            operation_flat_fee: state.global.getIn([
                'props',
                'operation_flat_fee',
            ]),
            bandwidth_kbytes_fee: state.global.getIn([
                'props',
                'bandwidth_kbytes_fee',
            ]),
        };
    },
    (dispatch) => ({
        updateFollow: (
            follower,
            following,
            action,
            operationFlatFee,
            bandwidthKbytesFee,
            done
        ) => {
            const what = action ? [action] : [];
            const json = ['follow', { follower, following, what }];
            const operation = {
                id: 'follow',
                required_posting_auths: [follower],
                json: JSON.stringify(json),
            };
            const size = JSON.stringify(operation).replace(/[\[\]\,\"]/g, '')
                .length;
            const bw_fee = Math.max(
                0.001,
                ((size / 1024) * bandwidthKbytesFee).toFixed(3)
            );
            const fee = (operationFlatFee + bw_fee).toFixed(3);
            dispatch(
                transactionActions.broadcastOperation({
                    type: 'custom_json',
                    operation: {
                        id: 'follow',
                        required_posting_auths: [follower],
                        json: JSON.stringify(json),
                    },
                    confirm: tt('g.operation_cost', { fee }),
                    successCallback: done,
                    // TODO: Why?
                    errorCallback: done,
                })
            );
        },
        showLogin: (e) => {
            if (e) e.preventDefault();
            dispatch(userActions.showLogin());
        },
    })
)(Follow);
