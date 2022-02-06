/* eslint-disable jsx-a11y/anchor-is-valid */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'immutable';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';
import Callout from 'app/components/elements/Callout';
import Icon from 'app/components/elements/Icon';
import Userpic from 'app/components/elements/Userpic';
import tt from 'counterpart';
import classNames from 'classnames';

const notificationsIcon = (type) => {
    const types = {
        reply: 'chatbox',
        reply_post: 'chatbox',
        reply_comment: 'chatbox',
        follow: 'voters',
        set_label: 'pencil2',
        set_role: 'pencil2',
        error: 'cog',
        reblog: 'reblog',
        mention: 'chatboxes',
        transfer: 'transfer',
        witness_vote: 'witness',
        vote: 'chevron-up-circle',
    };

    let icon = 'chain';
    if (type in types) {
        icon = types[type];
    } else {
        console.error('no icon for type: ', type);
    }

    return <Icon size="1x" name={icon} />;
};

let notificationFilter = 'all';

const notificationFilterToTypes = {
    replies: ['reply_comment', 'reply'],
    follows: ['follow'],
    upvotes: ['vote'],
    reblogs: ['reblog'],
    mentions: ['mention'],
};

const highlightText = (text, highlight) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {' '}
            {parts.map((part, i) => (
                <span
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    style={
                        part.toLowerCase() === highlight.toLowerCase()
                            ? { fontWeight: 'bold' }
                            : {}
                    }
                >
                    {part}
                </span>
            ))}{' '}
        </span>
    );
};

const pic = (author) => {
    return (
        <a href={'/@' + author}>
            <Userpic account={author} />
        </a>
    );
};

class NotificationsList extends Component {
    // eslint-disable-next-line no-undef
    static defaultProps = {
        notifications: [],
    };

    // eslint-disable-next-line no-undef
    static propTypes = {
        username: PropTypes.string.isRequired,
        markAsRead: PropTypes.func.isRequired,
    };

    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }

    componentDidMount() {
        const { username, getAccountNotifications } = this.props;
        if (username) {
            getAccountNotifications(username);
        }
    }

    componentDidUpdate(prevProps) {
        const { username, getAccountNotifications } = this.props;
        if (prevProps.username !== username) {
            getAccountNotifications(username);
        }
        this.applyFilter();
    }

    // eslint-disable-next-line no-undef
    onClickFilter = (e) => {
        e.preventDefault();
        const target = e.target;

        const filterElements = document.getElementsByClassName(
            'notification__filter'
        );

        // reset
        for (let fi = 0; fi < filterElements.length; fi += 1) {
            const filterElement = filterElements[fi];
            filterElement.classList.remove('selected');
        }

        target.classList.add('selected');
        notificationFilter = target.dataset.type;
        this.applyFilter();

        target.blur();
    };

    // eslint-disable-next-line no-undef
    onClickMarkAsRead = (e) => {
        e.preventDefault();
        const { username, markAsRead } = this.props;
        markAsRead(username);
    };

    // eslint-disable-next-line no-undef
    applyFilter = () => {
        const notificationElements =
            document.getElementsByClassName('notification__item');

        let visibleCount = 0;
        for (let ni = 0; ni < notificationElements.length; ni += 1) {
            const notificationElement = notificationElements[ni];

            if (notificationFilter === 'all') {
                notificationElement.classList.remove('hide');

                visibleCount += 1;
                if (visibleCount % 2 === 0) {
                    notificationElement.classList.add('even');
                } else {
                    notificationElement.classList.remove('even');
                }
            } else if (
                Object.prototype.hasOwnProperty.call(
                    notificationFilterToTypes,
                    notificationFilter
                )
            ) {
                const notificationTypes =
                    notificationFilterToTypes[notificationFilter];
                let matchType = false;

                for (let ti = 0; ti < notificationTypes.length; ti += 1) {
                    const notificationType = notificationTypes[ti];
                    if (
                        notificationElement.classList.contains(
                            `notification__${notificationType}`
                        )
                    ) {
                        matchType = true;
                    }
                }

                if (matchType === false) {
                    notificationElement.classList.add('hide');
                } else {
                    notificationElement.classList.remove('hide');
                    visibleCount += 1;
                }

                if (visibleCount % 2 === 0) {
                    notificationElement.classList.add('even');
                } else {
                    notificationElement.classList.remove('even');
                }
            }
        }
    };

    render() {
        const { notifications, isOwnAccount, accountName } = this.props;
        // eslint-disable-next-line consistent-return
        const renderItem = (item, index) => {
            const lastRead = localStorage.getItem('last_timestamp');
            const unRead = lastRead <= item.timestamp;
            const key = `${index}${item.timestamp}`;
            if (item.type === 'mention') {
                const type = item.type;
                const account = item.author;
                const timestamp = item.timestamp;
                const permlink = item.permlink;
                return (
                    <div
                        key={key}
                        className={`notification__item flex-body notification__${item.type}`}
                    >
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${account}/${permlink}`}>
                                    {highlightText(
                                        `${tt('notificationsList_jsx.mention', {
                                            account,
                                        })}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper
                                    date={new Date(timestamp * 1000).toJSON()}
                                />
                            </div>
                        </div>
                        {unRead && (
                            <span className="notification__unread">&bull;</span>
                        )}
                    </div>
                );
            } else if (item.type === 'transfer') {
                const type = item.type;
                const account = item.from;
                const timestamp = item.timestamp;
                const amount = item.amount;
                return (
                    <div
                        key={key}
                        className={`notification__item flex-body notification__${item.type}`}
                    >
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a
                                    href={`https://blurtwallet.com/@${accountName}/transfers`}
                                >
                                    {highlightText(
                                        `${tt(
                                            'notificationsList_jsx.transfer',
                                            { account, amount }
                                        )}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper
                                    date={new Date(timestamp * 1000).toJSON()}
                                />
                            </div>
                        </div>
                        {unRead && (
                            <span className="notification__unread">&bull;</span>
                        )}
                    </div>
                );
            } else if (item.type === 'reply') {
                const type = item.type;
                const account = item.author;
                const timestamp = item.timestamp;
                const permlink = item.permlink;
                return (
                    <div
                        key={key}
                        className={`notification__item flex-body notification__${item.type}`}
                    >
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${account}/${permlink}`}>
                                    {highlightText(
                                        `${tt('notificationsList_jsx.reply', {
                                            account,
                                        })}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper
                                    date={new Date(timestamp * 1000).toJSON()}
                                />
                            </div>
                        </div>
                        {unRead && (
                            <span className="notification__unread">&bull;</span>
                        )}
                    </div>
                );
            } else if (item.type === 'reblog') {
                const type = item.type;
                const account = item.account;
                const timestamp = item.timestamp;
                const permlink = item.permlink;
                return (
                    <div
                        key={key}
                        className={`notification__item flex-body notification__${item.type}`}
                    >
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${accountName}/${permlink}`}>
                                    {highlightText(
                                        `${tt('notificationsList_jsx.reblog', {
                                            account,
                                        })}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper
                                    date={new Date(timestamp * 1000).toJSON()}
                                />
                            </div>
                        </div>
                        {unRead && (
                            <span className="notification__unread">&bull;</span>
                        )}
                    </div>
                );
            } else if (item.type === 'follow') {
                const type = item.type;
                const account = item.follower;
                const timestamp = item.timestamp;
                return (
                    <div
                        key={key}
                        className={`notification__item flex-body notification__${item.type}`}
                    >
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${account}`}>
                                    {highlightText(
                                        `${tt('notificationsList_jsx.follow', {
                                            account,
                                        })}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper
                                    date={new Date(timestamp * 1000).toJSON()}
                                />
                            </div>
                        </div>
                        {unRead && (
                            <span className="notification__unread">&bull;</span>
                        )}
                    </div>
                );
            } else if (item.type === 'witness_vote') {
                const type = item.type;
                const account = item.account;
                const timestamp = item.timestamp;
                return (
                    <div
                        key={key}
                        className={`notification__item flex-body notification__${item.type}`}
                    >
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${account}`}>
                                    {highlightText(
                                        `${tt(
                                            'notificationsList_jsx.witness_vote',
                                            {
                                                account,
                                            }
                                        )}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper
                                    date={new Date(timestamp * 1000).toJSON()}
                                />
                            </div>
                        </div>
                        {unRead && (
                            <span className="notification__unread">&bull;</span>
                        )}
                    </div>
                );
            } else if (item.type === 'vote') {
                const type = item.type;
                const voter = item.voter;
                const timestamp = item.timestamp;
                const permlink = item.permlink;
                const account = accountName;
                return (
                    <div
                        key={key}
                        className={`notification__item flex-body notification__${item.type}`}
                    >
                        <div className="flex-row">{pic(`${voter}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${account}/${permlink}`}>
                                    {highlightText(
                                        `${tt('notificationsList_jsx.vote', {
                                            voter,
                                        })}`,
                                        `${voter}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper
                                    date={new Date(timestamp * 1000).toJSON()}
                                />
                            </div>
                        </div>
                        {unRead && (
                            <span className="notification__unread">&bull;</span>
                        )}
                    </div>
                );
            }
        };

        return (
            <div className="">
                {isOwnAccount}
                {notifications && notifications.length > 0 && (
                    <center>
                        <br />
                        <a href="#" onClick={this.onClickMarkAsRead}>
                            <strong>
                                {tt('notificationsList_jsx.mark_all_as_read')}
                            </strong>
                        </a>
                        <br />
                    </center>
                )}

                <center>
                    <div className="notification__filter_select">
                        <a
                            className={classNames('notification__filter', {
                                selected: notificationFilter === 'all',
                            })}
                            role="link"
                            data-type="all"
                            tabIndex={0}
                            onClick={this.onClickFilter}
                        >
                            {tt('notificationsList_jsx.all')}
                        </a>
                        <a
                            className={classNames('notification__filter', {
                                selected: notificationFilter === 'replies',
                            })}
                            role="link"
                            data-type="replies"
                            tabIndex={0}
                            onClick={this.onClickFilter}
                        >
                            {tt('notificationsList_jsx.replies')}
                        </a>
                        <a
                            className={classNames('notification__filter', {
                                selected: notificationFilter === 'mentions',
                            })}
                            role="link"
                            data-type="mentions"
                            tabIndex={0}
                            onClick={this.onClickFilter}
                        >
                            {tt('notificationsList_jsx.mentions')}
                        </a>
                        <a
                            className={classNames('notification__filter', {
                                selected: notificationFilter === 'follows',
                            })}
                            role="link"
                            data-type="follows"
                            tabIndex={0}
                            onClick={this.onClickFilter}
                        >
                            {tt('notificationsList_jsx.follows')}
                        </a>
                        <a
                            className={classNames('notification__filter', {
                                selected: notificationFilter === 'upvotes',
                            })}
                            role="link"
                            data-type="upvotes"
                            tabIndex={0}
                            onClick={this.onClickFilter}
                        >
                            {tt('notificationsList_jsx.upvotes')}
                        </a>
                        <a
                            className={classNames('notification__filter', {
                                selected: notificationFilter === 'reblogs',
                            })}
                            role="link"
                            data-type="reblogs"
                            tabIndex={0}
                            onClick={this.onClickFilter}
                        >
                            {tt('notificationsList_jsx.reblogs')}
                        </a>
                    </div>
                </center>

                {notifications && notifications.length > 0 && (
                    <div style={{ lineHeight: '1rem' }}>
                        {notifications.map((item, index) =>
                            renderItem(item, index)
                        )}
                    </div>
                )}
                {!notifications && process.env.BROWSER && (
                    <Callout>
                        {`Welcome! You don't have any notifications yet.`}
                    </Callout>
                )}
            </div>
        );
    }
}

export default connect(
    (state, props) => {
        const accountName = props.username;
        const isOwnAccount =
            state.user.getIn(['current', 'username'], '') == accountName;
        const notifications = state.global
            .getIn(['notifications', accountName, 'notifications'], List())
            .toJS();
        return {
            ...props,
            isOwnAccount,
            accountName,
            notifications,
        };
    },
    (dispatch) => ({
        getAccountNotifications: (username) => {
            const query = {
                account: username,
            };
            return dispatch(
                fetchDataSagaActions.getAccountNotifications(query)
            );
        },
        markAsRead: (username) => {
            const query = {
                account: username,
            };
            if (typeof localStorage != 'undefined') {
                localStorage.setItem(
                    'last_timestamp',
                    Math.floor(Date.now() / 1000)
                );
            }

            return dispatch(
                fetchDataSagaActions.getAccountNotifications(query)
            );
        },
    })
)(NotificationsList);
