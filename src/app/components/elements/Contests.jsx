import tt from 'counterpart';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';

function Contest({ contest }) {
    if (!contest || !contest.title) {
        return null;
    }

    const url = contest.permalink
        ? `/@${contest.author}/${contest.permlink}`
        : contest.url;
    const tag = contest.tag ? (
        <p className="Notices__featured">{contest.tag}</p>
    ) : null;
    const title = url ? (
        <Link className="Notices__title-link" to={url}>
            {contest.title}
        </Link>
    ) : (
        contest.title
    );
    const by = contest.author ? (
        <span className="Notices__by"> {tt('g.by')}&nbsp;</span>
    ) : null;
    const author = contest.author ? (
        <Link className="Notices__author-link" to={'/@' + contest.author}>
            {contest.author}
        </Link>
    ) : null;
    const date = contest.created ? (
        <span>
            {' . '}
            <TimeAgoWrapper date={contest.created} />
        </span>
    ) : null;

    return (
        <li className="Notices__notice">
            {tag}
            <p className="Notices__title">{title}</p>
            <p className="Notices__metadata">
                {by}
                {author}
                {date}
            </p>
        </li>
    );
}

function BlurtContests({ contests }) {
    if (!contests || contests.length === 0) {
        return null;
    }

    return (
        <div className="c-sidebar__module">
            <div className="c-sidebar__header">
                <h3 className="c-sidebar__h3">Contests</h3>
            </div>
            <div className="c-sidebar__content">
                <ul className="Notices">
                    {contests.map((contest, i) => (
                        <Contest key={i} contest={contest} />
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default BlurtContests;
