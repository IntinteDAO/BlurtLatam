/* eslint-disable react/static-property-placement */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { immutableAccessor } from 'app/utils/Accessors';
import extractContent from 'app/utils/ExtractContent';
import Headroom from 'react-headroom';
import resolveRoute from 'app/ResolveRoute';
import tt from 'counterpart';
import { APP_NAME } from 'app/client_config';
import SortOrder from 'app/components/elements/SortOrder';
import SearchInput from 'app/components/elements/SearchInput';
import IconButton from 'app/components/elements/IconButton';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import * as userActions from 'app/redux/UserReducer';
import * as appActions from 'app/redux/AppReducer';
import Userpic from 'app/components/elements/Userpic';
import { SIGNUP_URL } from 'shared/constants';
import BlurtLogo from 'app/components/elements/BlurtLogo';
import normalizeProfile from 'app/utils/NormalizeProfile';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import { startPolling } from 'app/redux/PollingSaga';
import { api } from '@blurtfoundation/blurtjs';

class Header extends Component {
    static propTypes = {
        current_account_name: PropTypes.string,
        display_name: PropTypes.string,
        category: PropTypes.string,
        order: PropTypes.string,
        pathname: PropTypes.string,
        getAccountNotifications: PropTypes.func,
        startNotificationsPolling: PropTypes.func,
        loggedIn: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this.state = {
            gptAdRendered: false,
            showAd: false,
            showAnnouncement: this.props.showAnnouncement,
            currentVotingPower: 100
        };
    }

    UNSAFE_componentWillMount() {
        const {
            loggedIn,
            current_account_name,
            getAccountNotifications,
        } = this.props;
        if (loggedIn) {
            getAccountNotifications(current_account_name);
            if(!this.powerUpdateInterval) this.setCurrentPower();
            // Update power every 30 sec
            this.powerUpdateInterval = setInterval(() => {
                this.setCurrentPower();
            }, 30000);

        }
    }

    componentDidMount() {
        // if (
        //     !this.props.gptEnabled ||
        //     !process.env.BROWSER ||
        //     !window.googletag ||
        //     !window.googletag.pubads
        // ) {
        //     return null;
        // }

        const { gptEnabled } = this.props;
        if(gptEnabled) {
            window.addEventListener('gptadshown', (e) => this.gptAdRendered(e));
        }
    }

    // Consider refactor.
    // I think 'last sort order' is something available through react-router-redux history.
    // Therefore no need to store it in the window global like this.
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.pathname !== this.props.pathname) {
            const route = resolveRoute(nextProps.pathname);
            if (
                route &&
                route.page === 'PostsIndex' &&
                route.params &&
                route.params.length > 0
            ) {
                const sort_order =
                    route.params[0] !== 'home' ? route.params[0] : null;
                if (sort_order)
                    window.last_sort_order = this.last_sort_order = sort_order;
            }
        }
    }

    componentWillUnmount() {
        if (
            !this.props.gptEnabled ||
            !process.env.BROWSER ||
            !window.googletag ||
            !window.googletag.pubads
        ) {
            return null;
        }
        clearInterval(this.powerUpdateInterval);
    }

    gptAdRendered() {
        this.setState({ showAd: true, gptAdRendered: true });
    }

    headroomOnUnfix() {
        this.setState({ showAd: true });
    }

    headroomOnUnpin() {
        this.setState({ showAd: false });
    }

    hideAnnouncement() {
        this.setState({ showAnnouncement: false });
        this.props.hideAnnouncement();
    }

    setCurrentPower = () => {
        const { username } = this.props;
        if (username) {
            api.getAccounts([username], (err, response) => {
                const accountUpdated = response[0];
                localStorage.setItem('updated-account', JSON.stringify(accountUpdated));

                if (accountUpdated) {
                    const updatedVotingPower = this.calculateVotingPower(accountUpdated).toFixed();
                    localStorage.setItem('current-voting-power', updatedVotingPower);
                    this.setState({ currentVotingPower: updatedVotingPower })
                }
            });
        }
    }

    calculateVotingPower = (current_account) => {
        const { BLURT_VOTING_MANA_REGENERATION_SECONDS } = this.props;
        let voting_manabar = null;
        if (!voting_manabar) {
            voting_manabar = current_account
                ? current_account.voting_manabar
                : 0;
        }

        const current_mana = parseInt(
            voting_manabar ? voting_manabar.current_mana : 0
        );

        const last_update_time = voting_manabar
            ? voting_manabar.last_update_time
            : 0;

        let vesting_shares = 0.0;
        if (!vesting_shares) {
            vesting_shares = current_account
                ? Number(current_account.vesting_shares.split(' ')[0])
                : 0.0;
        }

        let delegated_vesting_shares = 0.0;
        if (!delegated_vesting_shares) {
            delegated_vesting_shares = current_account
                ? Number(current_account.delegated_vesting_shares.split(' ')[0])
                : 0.0;
        }

        let vesting_withdraw_rate = 0.0;
        if (!vesting_withdraw_rate) {
            vesting_withdraw_rate = current_account
                ? current_account.vesting_withdraw_rate
                    ? current_account.vesting_withdraw_rate.split(' ')[0]
                    : 0.0
                : 0.0;
        }

        let received_vesting_shares = 0.0;
        if (!received_vesting_shares) {
            received_vesting_shares = current_account
                ? Number(current_account.received_vesting_shares.split(' ')[0])
                : 0.0;
        }

        const net_vesting_shares =
            vesting_shares - delegated_vesting_shares + received_vesting_shares;

        const maxMana =
            (net_vesting_shares - Number(vesting_withdraw_rate)) * 1000000;

        const now = Math.round(Date.now() / 1000);
        const elapsed = now - last_update_time;
        const regenerated_mana = (elapsed * maxMana) / BLURT_VOTING_MANA_REGENERATION_SECONDS;
        let currentMana = current_mana;
        currentMana += regenerated_mana;
        if (currentMana >= maxMana) {
            currentMana = maxMana;
        }
        return ((currentMana * 100) / maxMana);
    }

    render() {
        const {
            category,
            order,
            pathname,
            current_account_name,
            username,
            showLogin,
            logout,
            loggedIn,
            vertical,
            nightmodeEnabled,
            toggleNightmode,
            userPath,
            showSidePanel,
            navigate,
            display_name,
            walletUrl,
            content,
            notifications,
        } = this.props;

        let { showAd, showAnnouncement, currentVotingPower } = this.state;
        let lastSeenTimestamp = 0;
        let unreadNotificationCount = 0;
        if (
            loggedIn &&
            notifications !== undefined &&
            typeof localStorage !== 'undefined'
        ) {
            if (localStorage.getItem('last_timestamp') !== null) {
                lastSeenTimestamp = localStorage.getItem('last_timestamp');
            } else {
                localStorage.setItem('last_timestamp', 0);
            }
            notifications.get('unread_notifications').map((notification) => {
                const { timestamp } = notification.toJS();
                if (lastSeenTimestamp < timestamp) {
                    unreadNotificationCount++;
                }
            });
        }
        /*Set the document.title on each header render.*/
        const route = resolveRoute(pathname);
        let tags = [];
        let home_account = false;
        let page_title = route.page;
        let sort_order = '';
        let topic = '';
        let page_name = null;
        if (route.page === 'PostsIndex') {
            sort_order = route.params[0];
            if (sort_order === 'home') {
                page_title = tt('header_jsx.home');
                const account_name = route.params[1];
                if (
                    current_account_name &&
                    account_name.indexOf(current_account_name) === 1
                ) home_account = true;
            } else {
                topic = route.params.length > 1 ? route.params[1] : '';
                tags = [topic];
                const type =
                    route.params[0] == 'payout_comments' ? 'comments' : 'posts';
                let prefix = route.params[0];
                if (prefix == 'created') prefix = 'New';
                if (prefix == 'payout') prefix = 'Pending payout';
                if (prefix == 'payout_comments') prefix = 'Pending payout';
                if (topic !== '') prefix += ` ${topic}`;
                page_title = `${prefix} ${type}`;
            }
        } else if (route.page === 'Post') {
            const user = `${route.params[1]}`.replace('@', '');
            const slug = `${route.params[2]}`;
            if (content) {
                const post_content = content.get(`${user}/${slug}`);
                if (post_content) {
                    const p = extractContent(immutableAccessor, post_content);
                    tags = p.json_metadata.tags || [];
                }
            }
            sort_order = '';
            topic = route.params[0];
        } else if (route.page == 'SubmitPost') {
            page_title = tt('header_jsx.create_a_post');
        } else if (route.page == 'Privacy') {
            page_title = tt('navigation.privacy_policy');
        } else if (route.page == 'Tos') {
            page_title = tt('navigation.terms_of_service');
        } else if (route.page == 'RecoverAccountStep1') {
            page_title = tt('header_jsx.stolen_account_recovery');
        } else if (route.page === 'UserProfile') {
            const user_name = route.params[0].slice(1);
            const user_title = display_name
                ? `${display_name} (@${user_name})`
                : user_name;
            page_title = user_title;
            if (route.params[1] === 'followers') {
                page_title = tt('header_jsx.people_following', {
                    username: user_title,
                });
            }
            if (route.params[1] === 'followed') {
                page_title = tt('header_jsx.people_followed_by', {
                    username: user_title,
                });
            }
            if (route.params[1] === 'recent-replies') {
                page_title = tt('header_jsx.replies_to', {
                    username: user_title,
                });
            }
            // @user/"posts" is deprecated in favor of "comments" as of oct-2016 (#443)
            if (route.params[1] === 'posts' || route.params[1] === 'comments') {
                page_title = tt('header_jsx.comments_by', {
                    username: user_title,
                });
            }
            if (route.params[1] === 'notifications') {
                page_title = tt('header_jsx.notifications', {
                    username: user_title,
                });
            }
        } else {
            page_name = ''; //page_title = route.page.replace( /([a-z])([A-Z])/g, '$1 $2' ).toLowerCase();
        }

        // Format first letter of all titles and lowercase user name
        if (route.page !== 'UserProfile') {
            page_title =
                page_title.charAt(0).toUpperCase() + page_title.slice(1);
        }

        if (
            process.env.BROWSER &&
            route.page !== 'Post' &&
            route.page !== 'PostNoCategory'
        )
            document.title = page_title + ' — ' + APP_NAME;

        const logo_link =
            resolveRoute(pathname).params &&
                resolveRoute(pathname).params.length > 1 &&
                this.last_sort_order
                ? '/' + this.last_sort_order
                : current_account_name
                    ? `/@${current_account_name}/feed`
                    : '/';

        //TopRightHeader Stuff
        const defaultNavigate = (e) => {
            if (e.metaKey || e.ctrlKey) {
                // prevent breaking anchor tags
            } else {
                e.preventDefault();
            }
            const a =
                e.target.nodeName.toLowerCase() === 'a'
                    ? e.target
                    : e.target.parentNode;
            browserHistory.push(a.pathname + a.search + a.hash);
        };

        // Since navigate isn't set, defaultNavigate will always be used.
        const nav = navigate || defaultNavigate;

        const submit_story = $STM_Config.read_only_mode ? null : loggedIn ? (
            <Link to="/submit.html">
                <IconButton />
            </Link>
        ) : null;

        const feed_link = `/@${username}/feed`;
        const replies_link = `/@${username}/recent-replies`;
        const account_link = `/@${username}`;
        const comments_link = `/@${username}/comments`;
        const wallet_link = `${walletUrl}/@${username}`;
        const settings_link = `/@${username}/settings`;
        const pathCheck = userPath === '/submit.html' ? true : null;
        const notifications_link = `/@${username}/notifications`;
        const notif_label =
            tt('g.notifications') +
            (unreadNotificationCount > 0
                ? ` (${unreadNotificationCount})`
                : '');
        const user_menu = [
            {
                icon: 'chevron-up-circle',
                value: `Voting Power : ${currentVotingPower}%`
            },
            {
                link: feed_link,
                icon: 'home',
                value: tt('g.feed'),
            },
            { link: account_link, icon: 'profile', value: tt('g.blog') },
            {
                link: notifications_link,
                icon: 'notification',
                value: notif_label,
            },
            { link: comments_link, icon: 'replies', value: tt('g.comments') },
            {
                link: replies_link,
                icon: 'reply',
                value: tt('g.replies'),
            },
            {
                link: wallet_link,
                icon: 'wallet',
                value: tt('g.wallet'),
            },

            {
                link: '#',
                icon: 'eye',
                onClick: toggleNightmode,
                value: tt('g.toggle_nightmode'),
            },
            { link: settings_link, icon: 'cog', value: tt('g.settings') },
            loggedIn
                ? {
                    link: '#',
                    icon: 'enter',
                    onClick: logout,
                    value: tt('g.logout'),
                }
                : { link: '#', onClick: showLogin, value: tt('g.login') },
        ];
        showAd = true;
        return (
            <Headroom
                onUnpin={(e) => this.headroomOnUnpin(e)}
                onUnfix={(e) => this.headroomOnUnfix(e)}
            >
                <header className="Header">
                    {/*{showAnnouncement && (*/}
                    {/*    <Announcement onClose={e => this.hideAnnouncement(e)} />*/}
                    {/*)}*/}
                    {/* If announcement is shown, ad will not render unless it's in a parent div! */}
                    {/*<div style={showAd ? {} : { display: 'none' }}>*/}
                    {/*    <GptAd*/}
                    {/*        tags={tags}*/}
                    {/*        type="Freestar"*/}
                    {/*        id="bsa-zone_1566493796250-1_123456"*/}
                    {/*    />*/}
                    {/*</div>*/}

                    <nav className="row Header__nav">
                        <div className="small-5 large-4 columns Header__logotype">
                            {/*LOGO*/}
                            <Link to={logo_link}>
                                <BlurtLogo />
                            </Link>
                        </div>

                        <div className="large-4 columns show-for-large large-centered Header__sort">
                            {/*SORT*/}
                            <SortOrder
                                sortOrder={order}
                                topic={category === 'feed' ? '' : category}
                                horizontal
                                pathname={pathname}
                            />
                        </div>
                        <div className="small-7 large-4 columns Header__buttons">
                            {/*NOT LOGGED IN SIGN IN AND SIGN UP LINKS*/}
                            {!loggedIn && (
                                <span className="Header__user-signup show-for-medium">
                                    <a
                                        className="Header__login-link"
                                        href="/login.html"
                                        onClick={showLogin}
                                    >
                                        {tt('g.login')}
                                    </a>
                                    <a
                                        className="Header__signup-link"
                                        href={SIGNUP_URL}
                                    >
                                        {tt('g.sign_up')}
                                    </a>
                                </span>
                            )}

                            {/*CUSTOM SEARCH*/}
                            <span className="Header__search--desktop">
                                <SearchInput />
                            </span>
                            <span className="Header__search">
                                <a href="/static/search.html">
                                    <IconButton icon="magnifyingGlass" />
                                </a>
                            </span>

                            {/*SUBMIT STORY*/}
                            {submit_story}
                            {/*USER AVATAR */}
                            {loggedIn && (
                                <DropdownMenu
                                    className={'Header__usermenu'}
                                    items={user_menu}
                                    title={username}
                                    el="span"
                                    selected={tt('g.rewards')}
                                    position="left"
                                >
                                    <li className={'Header__userpic '}>
                                        <span title={username}>
                                            <Userpic account={username} />
                                        </span>
                                    </li>
                                    {unreadNotificationCount > 0 && (
                                        <div className="Header__notification">
                                            <span>
                                                {unreadNotificationCount}
                                            </span>
                                        </div>
                                    )}
                                </DropdownMenu>
                            )}
                            {/*HAMBURGER*/}
                            <span
                                onClick={showSidePanel}
                                className="toggle-menu Header__hamburger"
                            >
                                <span className="hamburger" />
                            </span>
                        </div>
                    </nav>
                </header>
            </Headroom>
        );
    }
}

export { Header as _Header_ };

const mapStateToProps = (state, ownProps) => {
    // SSR code split.
    if (!process.env.BROWSER) {
        return {
            username: null,
            loggedIn: false,
        };
    }

    let display_name;
    const route = resolveRoute(ownProps.pathname);
    if (route.page === 'UserProfile') {
        const profile = state.global.getIn([
            'accounts',
            route.params[0].slice(1),
        ]);
        display_name = profile ? normalizeProfile(profile.toJS()).name : null;
    }

    const userPath = state.routing.locationBeforeTransitions.pathname;
    const username = state.user.getIn(['current', 'username']);
    const BLURT_VOTING_MANA_REGENERATION_SECONDS = state.global.getIn([
        'blurt_config',
        'BLURT_VOTING_MANA_REGENERATION_SECONDS',
    ]);

    const notifications = state.global.getIn([
        'unread_notifications',
        username,
    ]);
    const loggedIn = !!username;
    const current_account_name = username
        ? username
        : state.offchain.get('account');

    const gptEnabled = state.app.getIn(['googleAds', 'gptEnabled']);
    const walletUrl = state.app.get('walletUrl');
    const content = state.global.get('content');
    return {
        username,
        loggedIn,
        userPath,
        nightmodeEnabled: state.user.getIn(['user_preferences', 'nightmode']),
        display_name,
        current_account_name,
        showAnnouncement: state.user.get('showAnnouncement'),
        gptEnabled,
        walletUrl,
        content,
        notifications,
        BLURT_VOTING_MANA_REGENERATION_SECONDS,
        ...ownProps,
    };
};

const mapDispatchToProps = (dispatch) => ({
    showLogin: (e) => {
        if (e) e.preventDefault();
        dispatch(userActions.showLogin({ type: 'basic' }));
    },
    logout: (e) => {
        if (e) e.preventDefault();
        dispatch(userActions.logout({ type: 'default' }));
    },
    toggleNightmode: (e) => {
        if (e) e.preventDefault();
        dispatch(appActions.toggleNightmode());
    },
    showSidePanel: () => {
        dispatch(userActions.showSidePanel());
    },
    hideSidePanel: () => {
        dispatch(userActions.hideSidePanel());
    },
    hideAnnouncement: () => dispatch(userActions.hideAnnouncement()),
    getAccountNotifications: (username) => {
        const query = {
            account: username,
        };
        return dispatch(
            fetchDataSagaActions.getAccountUnreadNotifications(query)
        );
    },
    startNotificationsPolling: (username) => {
        const query = {
            account: username,
        };
        const params = {
            pollAction: fetchDataSagaActions.getAccountUnreadNotifications,
            pollPayload: query,
            delay: 600000, // The delay between successive polls
        };
        return dispatch(startPolling(params));
    },
});

const connectedHeader = connect(mapStateToProps, mapDispatchToProps)(Header);

export default connectedHeader;
