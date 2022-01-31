/* eslint react/prop-types: 0 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import Icon from 'app/components/elements/Icon';
import { Link } from 'react-router';
import normalizeProfile from 'app/utils/NormalizeProfile';
import AffiliationMap from 'app/utils/AffiliationMap';
import tt from 'counterpart';
import Overlay from 'react-overlays/lib/Overlay';
import { findDOMNode } from 'react-dom';
import AuthorDropdown from '../AuthorDropdown';
import Blacklist from '../Blacklist';

const { string, bool, number } = PropTypes;

const closers = [];

const fnCloseAll = () => {
    let close;
    while ((close = closers.shift())) {
        close();
    }
};

class Author extends Component {
    static defaultProps = {
        follow: true,
        mute: true,
        showAffiliation: false,
    };

    static propTypes = {
        author: string.isRequired,
        follow: bool,
        mute: bool,
        authorRepLog10: number,
        showAffiliation: bool,
    };

    constructor(...args) {
        super(...args);
        this.state = { show: false };
        this.toggle = this.toggle.bind(this);
        this.close = this.close.bind(this);
    }

    componentDidMount() {
        if (!this.authorProfileLink) {
            return;
        }
        if (this.authorProfileLink.addEventListener) {
            this.authorProfileLink.addEventListener('click', this.toggle, false);
        } else {
            this.authorProfileLink.attachEvent('click', this.toggle, false);
        }
    }

    shouldComponentUpdate = shouldComponentUpdate(this, 'Author');

    componentWillUnmount() {
        if (!this.authorProfileLink) {
            return;
        }
        if (this.authorProfileLink.removeEventListener) {
            this.authorProfileLink.removeEventListener('click', this.toggle);
        } else {
            this.authorProfileLink.detachEvent('click', this.toggle);
        }
    }

    close = () => {
        this.setState({
            show: false,
        });
    };

    toggle = (e) => {
        if (!(e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            e.stopPropagation();
            const show = !this.state.show;
            fnCloseAll();
            if (show) {
                this.setState({ show });
                closers.push(this.close);
            }
        }
    };

    render() {
        const { author, follow, mute, authorRepLog10, showAffiliation } =
            this.props; // html
        const { username } = this.props; // redux
        const { name, about } = this.props.account
            ? normalizeProfile(this.props.account.toJS())
            : {};

        if (!(follow || mute) || username === author) {
            return (
                <span
                    className="author"
                    itemProp="author"
                    itemScope
                    itemType="http://schema.org/Person"
                >
                    <strong>
                        <Link to={'/@' + author}>{author}</Link>
                    </strong>{' '}
                    {/* <Reputation value={authorRepLog10} /> */}
                    <Blacklist author={author} />
                    {showAffiliation && AffiliationMap[author] ? (
                        <span className="affiliation">
                            {tt('g.affiliation_' + AffiliationMap[author])}
                        </span>
                    ) : null}
                </span>
            );
        }

        return (
            <span className="Author">
                <span
                    itemProp="author"
                    itemScope
                    itemType="http://schema.org/Person"
                >
                    <strong>
                        <Link
                            className="ptc"
                            ref={(link) => {
                                this.authorProfileLink = link;
                            }}
                            to={'/@' + author}
                        >
                            {author}
                            {/* <Reputation value={authorRepLog10} /> */}
                            {showAffiliation && AffiliationMap[author] ? (
                                <span className="affiliation">
                                    {tt(
                                        'g.affiliation_' +
                                            AffiliationMap[author]
                                    )}
                                </span>
                            ) : null}
                            <Icon name="dropdown-arrow" />
                        </Link>
                    </strong>
                </span>
                <Overlay
                    show={this.state.show}
                    onHide={this.close}
                    placement="bottom"
                    container={this}
                    target={() => findDOMNode(this.target)}
                    rootClose
                >
                    <AuthorDropdown
                        author={author}
                        follow={follow}
                        mute={mute}
                        authorRepLog10={authorRepLog10}
                        name={name}
                        about={about}
                        username={username}
                    />
                </Overlay>
            </span>
        );
    }
}

import { connect } from 'react-redux';

export default connect((state, ownProps) => {
    const { author, follow, mute, authorRepLog10 } = ownProps;
    const username = state.user.getIn(['current', 'username']);
    const account = state.global.getIn(['accounts', author]);
    return {
        author,
        follow,
        mute,
        authorRepLog10,
        username,
        account,
    };
})(Author);
