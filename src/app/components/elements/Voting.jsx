/* eslint-disable react/button-has-type */
/* eslint-disable react/require-default-props */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/static-property-placement */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Slider from '@appigram/react-rangeslider';
import tt from 'counterpart';
import CloseButton from 'app/components/elements/CloseButton';
import * as transactionActions from 'app/redux/TransactionReducer';
import Icon from 'app/components/elements/Icon';
import { fromJS } from 'immutable';
import { api } from '@blurtfoundation/blurtjs'
import FormattedAsset from 'app/components/elements/FormattedAsset';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import {
    formatDecimal,
    parsePayoutAmount,
} from 'app/utils/ParsersAndFormatters';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Dropdown from 'app/components/elements/Dropdown';
import VotersListReveal from './VotersLIstReveal';

const MAX_VOTES_DISPLAY = 150;
const VOTE_WEIGHT_DROPDOWN_THRESHOLD = 50; //if BP is more than 50, enable the slider
const MAX_WEIGHT = 10000;

class Voting extends Component {

    static propTypes = {
        // HTML properties
        post: PropTypes.string.isRequired,
        showList: PropTypes.bool,

        // Redux connect properties
        vote: PropTypes.func.isRequired,
        author: PropTypes.string, // post was deleted
        permlink: PropTypes.string,
        username: PropTypes.string,
        is_comment: PropTypes.bool,
        active_votes: PropTypes.any,
        loggedin: PropTypes.bool,
        post_obj: PropTypes.any,
        current_account: PropTypes.any,
        enable_slider: PropTypes.bool,
        voting: PropTypes.bool
    };

    static defaultProps = {
        showList: true,
    };

    constructor(props) {
        super(props);
        this.state = {
            showWeight: false,
            myVote: null,
            sliderWeight: {
                up: MAX_WEIGHT,
                down: MAX_WEIGHT,
            },
            voting_bar: null,
            mana_updated: null,
            showVotersListModal: false
        };

        this.voteUp = (e) => {
            e && e.preventDefault();
            this.voteUpOrDown(true);
        };

        this.voteDown = (e) => {
            e && e.preventDefault();
            this.voteUpOrDown(false);
        };

        this.voteUpOrDown = (up) => {
            if (this.props.voting) return;
            this.setState({ votingUp: up });
            if (this.state.showWeight) this.setState({ showWeight: false });
            const { myVote } = this.state;
            const { author, permlink, username, is_comment } = this.props;

            let weight;
            if (myVote > 0 || myVote < 0) {
                // if there is a current vote, we're clearing it
                weight = 0;
            } else if (this.props.enable_slider) {
                // if slider is enabled, read its value
                weight = up
                    ? this.state.sliderWeight.up
                    : -this.state.sliderWeight.down;
            } else {
                // otherwise, use max power
                weight = up ? MAX_WEIGHT : -MAX_WEIGHT;
            }

            const isFlag = up ? null : true;
            this.props.vote(weight, {
                author,
                permlink,
                username,
                myVote,
                isFlag,
            });
        };

        this.handleWeightChange = (up) => (weight) => {
            const { sliderWeight } = this.state;
            let w;
            if (up) {
                w = {
                    up: weight,
                    down: sliderWeight.down,
                };
            } else {
                w = {
                    up: sliderWeight.up,
                    down: weight,
                };
            }
            const { username, is_comment } = this.props;

            localStorage.setItem(
                'voteWeight' + (up ? '' : 'Down') + '-'
                + username + (is_comment ? '-comment' : ''),
                weight
            );

            this.setState({ sliderWeight: w });
        };

        this.storeSliderWeight = (up) => () => {
            const { sliderWeight } = this.state;
            const { username, is_comment } = this.props;
            const weight = up
                ? sliderWeight.up
                : sliderWeight.down;
            localStorage.setItem(
                'voteWeight'
                + (up ? '' : 'Down')
                + '-'
                + username
                + (is_comment ? '-comment' : ''),
                weight
            );
        };

        this.readSliderWeight = () => {
            const { username, enable_slider, is_comment } = this.props;
            if (enable_slider) {
                const sliderWeightUp = Number(
                    localStorage.getItem(
                        'voteWeight' +
                        '-' +
                        username +
                        (is_comment ? '-comment' : '')
                    )
                );
                const sliderWeightDown = Number(
                    localStorage.getItem(
                        'voteWeight' +
                        'Down' +
                        '-' +
                        username +
                        (is_comment ? '-comment' : '')
                    )
                );
                this.setState({
                    sliderWeight: {
                        up: sliderWeightUp ? sliderWeightUp : MAX_WEIGHT,
                        down: sliderWeightDown ? sliderWeightDown : MAX_WEIGHT,
                    },
                });
            }
        };

        this.handleVotersListModalHide = () => {
            this.setState({ showVotersListModal: false });
        }

        this.handleVotersListModalShow = () => {
            this.setState({ showVotersListModal: true });
        }

        this.toggleWeightUp = (e) => {
            e.preventDefault();
            this.toggleWeightUpOrDown(true);
        };

        this.toggleWeightDown = (e) => {
            e && e.preventDefault();
            this.toggleWeightUpOrDown(false);
        };

        this.toggleWeightUpOrDown = (up) => {
            this.setState({
                showWeight: !this.state.showWeight,
                showWeightDir: up ? 'up' : 'down',
            });
        };
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Voting');
    }

    calculateVotingPower = (current_account) => {
        const { BLURT_VOTING_MANA_REGENERATION_SECONDS } = this.props;

        let voting_manabar = null
        if (!voting_manabar) {
            voting_manabar = current_account
                ? current_account.voting_manabar
                : 0
        }

        const current_mana = parseInt(
            voting_manabar ? voting_manabar.current_mana : 0
        )

        const last_update_time = voting_manabar
            ? voting_manabar.last_update_time
            : 0

        let vesting_shares = 0.0
        if (!vesting_shares) {
            vesting_shares = current_account
                ? Number(current_account.vesting_shares.split(' ')[0])
                : 0.0
        }

        let delegated_vesting_shares = 0.0
        if (!delegated_vesting_shares) {
            delegated_vesting_shares = current_account
                ? Number(current_account.delegated_vesting_shares.split(' ')[0])
                : 0.0
        }

        let vesting_withdraw_rate = 0.0
        if (!vesting_withdraw_rate) {
            vesting_withdraw_rate = current_account
                ? current_account.vesting_withdraw_rate
                    ? current_account.vesting_withdraw_rate.split(' ')[0]
                    : 0.0
                : 0.0
        }

        let received_vesting_shares = 0.0
        if (!received_vesting_shares) {
            received_vesting_shares = current_account
                ? Number(current_account.received_vesting_shares.split(' ')[0])
                : 0.0
        }

        const net_vesting_shares =
            vesting_shares - delegated_vesting_shares + received_vesting_shares

        const maxMana =
            (net_vesting_shares - Number(vesting_withdraw_rate)) * 1000000

        const now = Math.round(Date.now() / 1000)
        const elapsed = now - last_update_time
        const regenerated_mana =
            (elapsed * maxMana) / BLURT_VOTING_MANA_REGENERATION_SECONDS
        let currentMana = current_mana
        currentMana += regenerated_mana
        if (currentMana >= maxMana) {
            currentMana = maxMana
        }

        const updatedPower = (currentMana * 100) / maxMana;

        if (localStorage) {
            localStorage.setItem('updated-account', JSON.stringify(current_account));
            localStorage.setItem('current-voting-power', updatedPower);
        }

        this.setState({
            voting_manabar_updated: voting_manabar,
            delegated_vesting_shares_updated: delegated_vesting_shares,
            vesting_shares_updated: vesting_shares,
            received_vesting_shares_updated: received_vesting_shares,
            vesting_withdraw_rate_updated: vesting_withdraw_rate,
            mana_updated: current_mana,
            last_update_time_updated: last_update_time
        });
    }


    componentDidMount() {
        const { username } = this.props;
        if (username) {
            const currentAccountfromLocal = JSON.parse(localStorage.getItem('updated-account'));
            if (currentAccountfromLocal) {
                this.calculateVotingPower(currentAccountfromLocal);
                this.powerUpdateInterval = setInterval(() => {
                    this.calculateVotingPower(currentAccountfromLocal);
                }, 30000)
            } else {
                this.getVotingManabar(username);
            }
        }

    }

    componentWillMount() {
        const { username, active_votes } = this.props;
        this.checkMyVote(username, active_votes);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const { username, active_votes } = nextProps;
        if (active_votes != this.props.active_votes) {
            this.checkMyVote(username, active_votes);
            if (username) {
                const currentAccountfromLocal = JSON.parse(localStorage.getItem('updated-account'));
                if (currentAccountfromLocal) {
                    this.calculateVotingPower(currentAccountfromLocal);
                } else {
                    this.getVotingManabar(username);
                }
            }
        }
    }

    componentDidUpdate(prevProps) {
        const { username, active_votes } = prevProps;
        if (this.props.active_votes != active_votes) {
            this.checkMyVote(username, active_votes);
            if (username) {
                const currentAccountfromLocal = JSON.parse(localStorage.getItem('updated-account'));
                if (currentAccountfromLocal) {
                    this.calculateVotingPower(currentAccountfromLocal);
                } else {
                    this.getVotingManabar(username);
                }
            }
        }

    }

    componentWillUnmount() {
        if (this.powerUpdateInterval) clearInterval(this.powerUpdateInterval);
    }

    getVotingManabar(username) {
        if (username) {
            localStorage.setItem('user-api-call-status', 'pending');
            api.getAccounts([username], (err, response) => {
                const accountUpdated = response[0];
                if (accountUpdated) {
                    this.calculateVotingPower(accountUpdated);
                }
            });
        }
    }

    checkMyVote(username, active_votes) {
        if (username && active_votes) {
            const vote = active_votes.find(
                (el) => el.get('voter') === username
            );
            // weight warning, the API may send a string or a number (when zero)
            if (vote) this.setState({
                myVote: parseInt(vote.get('percent') || 0, 10),
            });
        }
    }

    render() {
        const {
            active_votes,
            showList,
            voting,
            enable_slider,
            is_comment,
            post_obj,
            current_account,
            operationFlatFee,
            bandwidthKbytesFee,
            // price_per_blurt,
            // sbd_print_rate,
            username,
            author,
            permlink,
            blacklist,
            rewardBalance,
            recentClaims,
            contentConstant,
            currentSupply,
            vestedBlurt,
            vote_power_reserve_rate,
            BLURT_100_PERCENT,
            BLURT_UPVOTE_LOCKOUT_SECONDS,
            BLURT_VOTING_MANA_REGENERATION_SECONDS,
            coalStatus,
        } = this.props;

        const {
            voting_manabar_updated,
            vesting_shares_updated,
            delegated_vesting_shares_updated,
            vesting_withdraw_rate_updated,
            received_vesting_shares_updated,
            mana_updated,
            last_update_time_updated,
        } = this.state;
        let voting_manabar = null;
        if (!voting_manabar_updated && !voting_manabar) {
            voting_manabar = current_account
                ? current_account.get('voting_manabar')
                : 0;
        } else if (voting_manabar_updated) {
            voting_manabar = fromJS(voting_manabar_updated);
        }

        let current_mana = parseInt(
            voting_manabar ? voting_manabar.get('current_mana') : 0
        );

        current_mana = parseInt(mana_updated ? mana_updated : current_mana);

        let last_update_time = voting_manabar
            ? voting_manabar.get('last_update_time')
            : 0;
        last_update_time = last_update_time_updated
            ? last_update_time_updated
            : last_update_time;

        let vesting_shares = 0.0;
        if (!vesting_shares_updated && !vesting_shares) {
            vesting_shares = current_account
                ? current_account.get('vesting_shares')
                : 0.0;
        } else if (vesting_shares_updated) {
            vesting_shares = vesting_shares_updated;
        }

        let delegated_vesting_shares = 0.0;
        if (!delegated_vesting_shares_updated && !delegated_vesting_shares) {
            delegated_vesting_shares = current_account
                ? current_account.get('delegated_vesting_shares')
                : 0.0;
        } else if (delegated_vesting_shares_updated) {
            delegated_vesting_shares = delegated_vesting_shares_updated;
        }

        let vesting_withdraw_rate = 0.0;
        if (!vesting_withdraw_rate_updated && !vesting_withdraw_rate) {
            vesting_withdraw_rate = current_account
                ? current_account.get('vesting_withdraw_rate')
                    ? current_account.get('vesting_withdraw_rate').split(' ')[0]
                    : 0.0
                : 0.0;
        } else if (vesting_withdraw_rate_updated) {
            vesting_withdraw_rate = vesting_withdraw_rate_updated;
        }

        let received_vesting_shares = 0.0;
        if (!received_vesting_shares_updated && !received_vesting_shares) {
            received_vesting_shares = current_account
                ? current_account.get('received_vesting_shares')
                : 0.0;
        } else if (received_vesting_shares_updated) {
            received_vesting_shares = received_vesting_shares_updated;
        }

        const net_vesting_shares =
            vesting_shares - delegated_vesting_shares + received_vesting_shares;

        const maxMana =
            (net_vesting_shares - Number(vesting_withdraw_rate)) * 1000000;

        const now = Math.round(Date.now() / 1000);
        const elapsed = now - last_update_time;
        const regenerated_mana =
            (elapsed * maxMana) / BLURT_VOTING_MANA_REGENERATION_SECONDS;
        let currentMana = current_mana;
        currentMana += regenerated_mana;
        if (currentMana >= maxMana) {
            currentMana = maxMana;
        }

        const currentVp = (currentMana * 100) / maxMana;

        const operation = {
            voter: username,
            author,
            permlink,
            weight: 10000,
        };
        const size = JSON.stringify(operation).replace(
            /[\[\]\,\"]/g,
            ''
        ).length;
        const bw_fee = Math.max(
            0.001,
            ((size / 1024) * bandwidthKbytesFee).toFixed(3)
        );
        const fee = (operationFlatFee + bw_fee).toFixed(3);
        const postRshares = parseInt(post_obj.get('net_rshares'));
        const S = parseInt(contentConstant);
        const cashoutTime = post_obj.get('cashout_time');
        const cashoutDelta = parseInt(
            (Date.parse(cashoutTime) - new Date()) / 1000
        );
        const ratio = vestedBlurt / currentSupply;
        const getVoteValue = (voteWeight) => {
            if (cashoutDelta <= 0) {
                return 0;
            }
            let usedMana =
                (current_mana * (voteWeight * 100) * 60 * 60 * 24) /
                BLURT_100_PERCENT;
            const maxVoteDenom =
                vote_power_reserve_rate *
                BLURT_VOTING_MANA_REGENERATION_SECONDS;
            usedMana = (usedMana + maxVoteDenom - 1) / maxVoteDenom;
            let rshares = parseInt(usedMana);
            if (cashoutDelta < BLURT_UPVOTE_LOCKOUT_SECONDS) {
                rshares = parseInt(
                    (rshares * cashoutDelta) / BLURT_UPVOTE_LOCKOUT_SECONDS
                );
            }
            const totalRshares = rshares + postRshares;
            const claims = parseInt(
                (totalRshares * (totalRshares + 2 * S)) / (totalRshares + 4 * S)
            );
            const rewards = rewardBalance / recentClaims;
            const postValue = claims * rewards * ratio;
            return postValue * (rshares / totalRshares);
        };

        const { votingUp, showWeight, showWeightDir, myVote } = this.state;

        const votingUpActive = voting && votingUp;
        const voteValue = getVoteValue(this.state.sliderWeight.up / 100);
        const slider = (up) => {
            const b = up
                ? this.state.sliderWeight.up
                : this.state.sliderWeight.down;
            const s = up ? '' : '-';
            return (
                <span>
                    <div id="btn_group">
                        <button
                            id="weight-10"
                            onClick={this.handleButtonWeightChange(up, 1000)}
                        >
                            {' '}
                            10%{' '}
                        </button>
                        <button
                            id="weight-25"
                            onClick={this.handleButtonWeightChange(up, 2500)}
                        >
                            {' '}
                            25%{' '}
                        </button>
                        <button
                            id="weight-50"
                            onClick={this.handleButtonWeightChange(up, 5000)}
                        >
                            {' '}
                            50%{' '}
                        </button>
                        <button
                            id="weight-75"
                            onClick={this.handleButtonWeightChange(up, 7500)}
                        >
                            {' '}
                            75%{' '}
                        </button>
                        <button
                            id="weight-100"
                            onClick={this.handleButtonWeightChange(up, 10000)}
                        >
                            {' '}
                            100%{' '}
                        </button>
                    </div>
                    {votingUpActive ? (
                        <a
                            href="#"
                            onClick={() => null}
                            className="confirm_weight"
                            title={tt('g.upvote')}
                        >
                            <Icon size="2x" name={'empty'} />
                        </a>
                    ) : (
                        <a
                            href="#"
                            onClick={this.voteUp}
                            className="confirm_weight"
                            title={tt('g.upvote')}
                        >
                            <Icon size="2x" name="chevron-up-circle" />
                        </a>
                    )}
                    <div className="weight-display">{s + b / 100}%</div>
                    <Slider
                        min={100}
                        max={MAX_WEIGHT}
                        step={100}
                        value={b}
                        onChange={this.handleWeightChange(up)}
                        onChangeComplete={this.storeSliderWeight(up)}
                        tooltip={false}
                    />
                    {currentVp ? (
                        <div className="voting-power-display">
                            {/* {tt('voting_jsx.vote_value')}:{' '} */}
                            <b title="Worth of your Vote">VW</b> : {voteValue.toFixed(3)} BLURT &nbsp;|&nbsp;
                            {/* {tt('voting_jsx.voting_power')}:{' '} */}
                            <b title="your Voting power to vote">VP</b>: {currentVp.toFixed(2)}% &nbsp;|&nbsp;
                            {/* {tt('g.transaction_fee')} */}
                            <b title="Transaction Fee for casting your vote">Fee</b>: {fee} BLURT
                        </div>
                    ) : (
                        ''
                    )}
                </span>
            );
        };
        this.handleButtonWeightChange = (up, weight) => (e) => {
            let w;
            if (up) {
                w = {
                    up: weight,
                    down: this.state.sliderWeight.down,
                };
            } else {
                w = {
                    up: this.state.sliderWeight.up,
                    down: weight,
                };
            }
            this.setState({ sliderWeight: w });

            const { username, is_comment } = this.props;
            localStorage.setItem(
                'voteWeight' +
                (up ? '' : 'Down') +
                '-' +
                username +
                (is_comment ? '-comment' : ''),
                weight
            );
        };

        const total_votes = post_obj.getIn(['stats', 'total_votes']);

        const cashout_time = post_obj.get('cashout_time');
        const max_payout = parsePayoutAmount(
            post_obj.get('max_accepted_payout')
        );
        const pending_payout = parsePayoutAmount(
            post_obj.get('pending_payout_value')
        );
        // const pending_payout_sp = pending_payout / price_per_steem;

        const promoted = parsePayoutAmount(post_obj.get('promoted'));
        const total_author_payout = parsePayoutAmount(
            post_obj.get('total_payout_value')
        );
        const total_curator_payout = parsePayoutAmount(
            post_obj.get('curator_payout_value')
        );

        let payout =
            pending_payout + total_author_payout + total_curator_payout;
        if (payout < 0.0) payout = 0.0;
        if (payout > max_payout) payout = max_payout;
        const payout_limit_hit = payout >= max_payout;
        // Show pending payout amount for declined payment posts
        if (max_payout === 0) payout = pending_payout;
        const up = (
            <Icon
                name={votingUpActive ? 'empty' : 'chevron-up-circle'}
                className="upvote"
            />
        );
        const classUp =
            'Voting__button Voting__button-up' +
            (myVote > 0 ? ' Voting__button--upvoted' : '') +
            (votingUpActive ? ' votingUp' : '');

        // There is an "active cashout" if: (a) there is a pending payout, OR (b) there is a valid cashout_time AND it's NOT a comment with 0 votes.
        const cashout_active =
            pending_payout > 0 ||
            (cashout_time.indexOf('1969') !== 0 &&
                !(is_comment && total_votes == 0));
        const payoutItems = [];

        const minimumAmountForPayout = 0.02;
        let warnZeroPayout = '';
        if (pending_payout > 0 && pending_payout < minimumAmountForPayout) {
            warnZeroPayout = tt('voting_jsx.must_reached_minimum_payout');
        }

        if (cashout_active) {
            const payoutDate = (
                <span>
                    {tt('voting_jsx.payout')}{' '}
                    <TimeAgoWrapper date={cashout_time} />
                </span>
            );
            payoutItems.push({
                value: tt('voting_jsx.pending_payout', {
                    value: formatDecimal(pending_payout).join(''),
                }),
            });
            if (max_payout > 0) {
                payoutItems.push({
                    value: tt('voting_jsx.breakdown') + ': ',
                });
                payoutItems.push({
                    value: tt('voting_jsx.pending_payouts_author', {
                        value: formatDecimal(pending_payout / 2).join(''),
                    }),
                });
                payoutItems.push({
                    value: tt('voting_jsx.pending_payouts_curators', {
                        value: formatDecimal(pending_payout / 2).join(''),
                    }),
                });
            }
            // add beneficiary info.
            const beneficiaries = post_obj.get('beneficiaries');
            if (beneficiaries.size > 0) {
                payoutItems.push({
                    value: 'Beneficiaries:',
                });
                beneficiaries.forEach(function (key) {
                    payoutItems.push({
                        value:
                            '- ' +
                            key.get('account') +
                            ': ' +
                            (parseFloat(key.get('weight')) / 100).toFixed(2) +
                            '%',
                        link: '/@' + key.get('account'),
                    });
                });
            }

            payoutItems.push({ value: payoutDate });
            if (warnZeroPayout !== '') {
                payoutItems.push({ value: warnZeroPayout });
            }
        }

        if (max_payout == 0) {
            payoutItems.push({ value: tt('voting_jsx.payout_declined') });
        } else if (max_payout < 1000000) {
            payoutItems.push({
                value: tt('voting_jsx.max_accepted_payout', {
                    value: formatDecimal(max_payout).join(''),
                }),
            });
        }
        if (promoted > 0) {
            payoutItems.push({
                value: tt('voting_jsx.promotion_cost', {
                    value: formatDecimal(promoted).join(''),
                }),
            });
        }
        // - payout instead of total_author_payout: total_author_payout can be zero with 100% beneficiary
        // - !cashout_active is needed to avoid the info is also shown for pending posts.
        if (!cashout_active && payout > 0) {
            payoutItems.push({
                value: tt('voting_jsx.past_payouts', {
                    value: formatDecimal(
                        total_author_payout + total_curator_payout
                    ).join(''),
                }),
            });
            payoutItems.push({
                value: tt('voting_jsx.past_payouts_author', {
                    value: formatDecimal(total_author_payout).join(''),
                }),
            });
            payoutItems.push({
                value: tt('voting_jsx.past_payouts_curators', {
                    value: formatDecimal(total_curator_payout).join(''),
                }),
            });
        }
        const payoutEl = (
            <DropdownMenu el="div" items={payoutItems}>
                <span style={payout_limit_hit ? { opacity: '0.5' } : {}}>
                    <FormattedAsset
                        amount={payout}
                        asset="BLURT"
                        classname={max_payout === 0 ? 'strikethrough' : ''}
                    />
                    {payoutItems.length > 0 && <Icon name="dropdown-arrow" />}
                </span>
            </DropdownMenu>
        );

        let voters_list = null;
        if (showList && total_votes > 0 && active_votes) {
            const avotes = active_votes.toJS();
            let total_rshares = 0;
            // sum of rshares
            // eslint-disable-next-line no-plusplus
            for (let v = 0; v < avotes.length; ++v) {
                const { rshares } = avotes[v];
                total_rshares += Number(rshares);
            }
            avotes.sort((a, b) =>
                Math.abs(parseInt(a.rshares)) > Math.abs(parseInt(b.rshares))
                    ? -1
                    : 1
            );
            const voters = [];
            for (
                let v = 0;
                v < avotes.length && voters.length < MAX_VOTES_DISPLAY;
                // eslint-disable-next-line no-plusplus
                ++v
            ) {
                const { percent, voter, rshares } = avotes[v];
                const sign = Math.sign(percent);
                if (sign === 0) continue;
                voters.push({
                    value:
                        (sign > 0 ? '+ ' : '- ') +
                        voter +
                        ': ' +
                        ((payout * rshares) / total_rshares).toFixed(3) +
                        ' BLURT (' +
                        percent / 100 +
                        '%)',
                    link: '/@' + voter,
                });
            }
            if (total_votes > voters.length) {
                voters.push({
                    value: (
                        <span>
                            &hellip;{' '}
                            {tt('voting_jsx.and_more', {
                                count: total_votes - voters.length,
                            })}
                        </span>
                    ),
                });
            }
            const { showVotersListModal } = this.state;
            voters_list = (
                <span className="DropdownMenu">
                    <a href="#" onClick={this.handleVotersListModalShow}>
                        {voters.length}
                        {' '}
                        votes
                        <Icon name="dropdown-arrow" />
                    </a>
                    {showVotersListModal === true && (
                        <VotersListReveal style={{ width: '350px !important' }} show onHide={this.handleVotersListModalHide}>
                            <CloseButton onClick={this.handleVotersListModalHide} />
                            <h3 style={{ 'text-align': 'center' }}>
                                Voters (
                                {voters.length}
                                )
                            </h3>
                            <hr />
                            <div className="voters-list">
                                <ul>
                                    {voters.map((voter, i) => {
                                        return (
                                            <li style={{ listStyleType: 'none' }} key={i}>
                                                {voter.link ? <a href={voter.link}>{voter.value}</a> : <span>{voter.value}</span>}
                                            </li>
                                        )
                                    })}
                                </ul>
                                <div className="text-center">
                                    <button
                                        className="secondary button no-border"
                                        onClick={this.handleVotersListModalHide}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </VotersListReveal>
                    )}
                </span>
            );
        }

        let voteUpClick = this.voteUp;
        let dropdown = null;
        let voteChevron = votingUpActive ? (
            up
        ) : (
            <a
                href="#"
                onClick={voteUpClick}
                title={myVote > 0 ? tt('g.remove_vote') : tt('g.upvote')}
                id="upvote_button"
            >
                {up}
            </a>
        );
        if (myVote <= 0 && enable_slider) {
            voteUpClick = this.toggleWeightUp;
            voteChevron = null;
            // Vote weight adjust
            dropdown = (
                <Dropdown
                    show={showWeight && showWeightDir == 'up'}
                    onHide={() => this.setState({ showWeight: false })}
                    onShow={() => {
                        this.setState({
                            showWeight: true,
                            showWeightDir: 'up',
                        });
                        this.readSliderWeight();
                    }}
                    title={up}
                >
                    <div className="Voting__adjust_weight">
                        {slider(true)}
                        <CloseButton
                            className="Voting__adjust_weight_close"
                            onClick={() => this.setState({ showWeight: false })}
                        />
                    </div>
                </Dropdown>
            );
        }
        return (
            <span className="Voting">
                <span className="Voting__inner">
                    {(coalStatus === 'disabled' ||
                        blacklist.get(author) === undefined) && (
                            <span className={classUp}>
                                {voteChevron}
                                {dropdown}
                            </span>
                        )}
                    {payoutEl}
                </span>
                {voters_list}
            </span>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const post = state.global.getIn(['content', ownProps.post]);
        if (!post) return ownProps;
        const author = post.get('author');
        const permlink = post.get('permlink');
        const active_votes = post.get('active_votes');
        const is_comment = post.get('parent_author') !== '';

        const current_account = state.user.get('current');
        const username = current_account
            ? current_account.get('username')
            : null;
        const vesting_shares = current_account
            ? current_account.get('vesting_shares')
            : 0.0;
        const delegated_vesting_shares = current_account
            ? current_account.get('delegated_vesting_shares')
            : 0.0;
        const received_vesting_shares = current_account
            ? current_account.get('received_vesting_shares')
            : 0.0;
        const net_vesting_shares =
            vesting_shares - delegated_vesting_shares + received_vesting_shares;
        const voting = state.global.get(
            `transaction_vote_active_${author}_${permlink}`
        );
        //const price_per_blurt = pricePerSteem(state);
        // const sbd_print_rate = state.global.getIn(['props', 'sbd_print_rate']);
        const recentClaims = parseInt(
            state.global.getIn(['reward_fund', 'recent_claims'])
        );
        const rewardBalance = parseFloat(
            state.global.getIn(['reward_fund', 'reward_balance'])
        );
        const contentConstant = state.global.getIn([
            'reward_fund',
            'content_constant',
        ]);
        const operationFlatFee = state.global.getIn([
            'props',
            'operation_flat_fee',
        ]);
        const bandwidthKbytesFee = state.global.getIn([
            'props',
            'bandwidth_kbytes_fee',
        ]);
        const currentSupply = parseFloat(
            state.global.getIn(['props', 'current_supply'])
        );
        const vestedBlurt = parseFloat(
            state.global.getIn(['props', 'total_vesting_fund_blurt'])
        );
        const vote_power_reserve_rate = parseInt(
            state.global.getIn(['props', 'vote_power_reserve_rate'])
        );
        const BLURT_100_PERCENT = state.global.getIn([
            'blurt_config',
            'BLURT_100_PERCENT',
        ]);
        const BLURT_UPVOTE_LOCKOUT_SECONDS = state.global.getIn([
            'blurt_config',
            'BLURT_UPVOTE_LOCKOUT_SECONDS',
        ]);
        const BLURT_VOTING_MANA_REGENERATION_SECONDS = state.global.getIn([
            'blurt_config',
            'BLURT_VOTING_MANA_REGENERATION_SECONDS',
        ]);
        const blacklist = state.global.get('blacklist');
        const enable_slider =
            net_vesting_shares > VOTE_WEIGHT_DROPDOWN_THRESHOLD;
        const userPreferences = state.app.get('user_preferences').toJS();
        const coalStatus = 'enabled';
        return {
            post: ownProps.post,
            showList: ownProps.showList,
            author,
            permlink,
            username,
            active_votes,
            enable_slider,
            is_comment,
            post_obj: post,
            current_account,
            loggedin: username != null,
            voting,
            operationFlatFee,
            bandwidthKbytesFee,
            blacklist,
            recentClaims,
            rewardBalance,
            contentConstant,
            currentSupply,
            vestedBlurt,
            vote_power_reserve_rate,
            BLURT_100_PERCENT,
            BLURT_UPVOTE_LOCKOUT_SECONDS,
            BLURT_VOTING_MANA_REGENERATION_SECONDS,
            coalStatus,
            // price_per_blurt,
            // sbd_print_rate,
        };
    },

    // mapDispatchToProps
    (dispatch) => ({
        vote: (weight, { author, permlink, username, myVote, isFlag }) => {
            const confirm = () => {
                if (myVote == null) return null;
                if (weight === 0) return isFlag
                    ? tt('voting_jsx.removing_your_vote')
                    : tt(
                        'voting_jsx.removing_your_vote_will_reset_curation_rewards_for_this_post'
                    );
                if (weight > 0) return isFlag
                    ? tt('voting_jsx.changing_to_an_upvote')
                    : tt(
                        'voting_jsx.changing_to_an_upvote_will_reset_curation_rewards_for_this_post'
                    );
                // if (weight < 0)
                //     return isFlag
                //         ? tt('voting_jsx.changing_to_a_downvote')
                //         : tt(
                //               'voting_jsx.changing_to_a_downvote_will_reset_curation_rewards_for_this_post'
                //           );
                return null;
            };
            dispatch(
                transactionActions.broadcastOperation({
                    type: 'vote',
                    operation: {
                        voter: username,
                        author,
                        permlink,
                        weight,
                        __config: {
                            title: weight < 0 ? 'Confirm Downvote' : null,
                        },
                    },
                    confirm,
                    errorCallback: (errorKey) => {
                        console.log('Transaction Error:' + errorKey);
                    },
                })
            );
        },
    })
)(Voting);
