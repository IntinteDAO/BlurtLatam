import React, { Component } from 'react';
import { Link } from 'react-router';
import Userpic from 'app/components/elements/Userpic';
import Follow from 'app/components/elements/Follow';

export default class AuthorDropdown extends Component {

    render() {
        const {
            author, follow, username, name, mute, about
        } = this.props;
        const author_link = (
            <span
                className="author"
                itemProp="author"
                itemScope
                itemType="http://schema.org/Person"
            >
                <Link to={'/@' + author}>
                    <strong>{author}</strong>
                </Link>
                {/* <Reputation value={props.authorRepLog10} /> */}
            </span>
        );
        if (!(follow || mute) || username === author) {
            return author_link;
        }

        return (
            <div className="Author__container">
                <div className="Author__dropdown">
                    <Link to={'/@' + author}>
                        <Userpic account={author} />
                    </Link>
                    <Link to={'/@' + author} className="Author__name">
                        {name}
                    </Link>
                    <Link to={'/@' + author} className="Author__username">
                        @
                        {author}
                    </Link>
                    <div>
                        <Follow
                            className="float-right"
                            follower={username}
                            following={author}
                            what="blog"
                            showFollow={follow}
                            showMute={mute}
                        />
                    </div>
                    <div className="Author__bio">{about}</div>
                </div>
            </div>
        );
    }
}