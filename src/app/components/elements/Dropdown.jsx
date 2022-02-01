/* eslint-disable react/static-property-placement */
import PropTypes from 'prop-types';
import { createElement, Component } from 'react';
import { findParent } from 'app/utils/DomUtils';

export default class Dropdown extends Component {

    static propTypes = {
        children: PropTypes.any,
        className: PropTypes.string,
        title: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
        ]).isRequired,
        href: PropTypes.string,
        onHide: PropTypes.func,
        onShow: PropTypes.func,
        show: PropTypes.bool,
    };

    static defaultProps = {
        onHide: () => null,
        onShow: () => null,
        show: false,
        className: 'dropdown-comp',
        href: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            shown: false,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.show !== this.state.shown) {
            this.setState({ shown: nextProps.show });
        }
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.hide);
    }

    hide = (e) => {
        // Do not hide the dropdown if there was a click within it.
        const inside_dropdown = !!findParent(e.target, 'dropdown__content');
        if (inside_dropdown) return;
        e.preventDefault();
        this.setState({ shown: false });
        this.props.onHide();
        document.removeEventListener('click', this.hide);
    };

    show = (e) => {
        e.preventDefault();
        this.setState({ shown: true });
        this.props.onShow();
        document.addEventListener('click', this.hide);
    };

    toggle = (e) => {
        const { shown } = this.state;
        if (shown) {
            this.hide(e);
        } else this.show(e);
    };

    render() {
        const { children, className, title, href, position } = this.props;

        let entry = (
            <a key="entry" href={href || '#'} onClick={this.toggle}>
                {title}
            </a>
        );

        const content = (
            <div key="dropdown-content" className={'dropdown__content'}>
                {children}
            </div>
        );
        const cls =
            'dropdown' +
            (this.state.shown ? ' show' : '') +
            (className ? ` ${className}` : '') +
            (position ? ` ${position}` : '');
        return createElement('div', { className: cls, key: 'dropdown' }, [
            entry,
            content,
        ]);
    }
}
