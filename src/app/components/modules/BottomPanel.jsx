import { Component } from 'react';
import CloseButton from 'app/components/elements/CloseButton';
import PropTypes from 'prop-types';

export default class BottomPanel extends Component {
    static propTypes = {
        children: PropTypes.objectOf(PropTypes.object),
        visible: PropTypes.bool,
        hide: PropTypes.func.isRequired,
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.visible) {
            document.addEventListener('click', this.props.hide);
        } else {
            document.removeEventListener('click', this.props.hide);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.props.hide);
    }

    render() {
        const { children, visible, hide } = this.props;
        return (
            <div className="BottomPanel">
                <div className={visible ? 'visible ' : ''}>
                    <CloseButton onClick={hide} />
                    {children}
                </div>
            </div>
        );
    }
}
