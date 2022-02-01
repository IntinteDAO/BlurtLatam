import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class HelpTip extends Component {
    static propTypes = {
        children: PropTypes.objectOf(PropTypes.object).isRequired,
        content: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
            .isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
        };
    }

    setVisibility = (visible) => {
        this.setState({
            visible,
        });
    };

    assignOutsideTouchHandler = () => {
        const handler = (e) => {
            let currentNode = e.target;
            const componentNode = ReactDOM.findDOMNode(this.refs.instance);
            while (currentNode.parentNode) {
                if (currentNode === componentNode) return;
                currentNode = currentNode.parentNode;
            }
            if (currentNode !== document) return;
            this.hide();
            document.removeEventListener('touchstart', handler);
        };
        document.addEventListener('touchstart', handler);
    };

    handleTouch = () => {
        this.show();
        this.assignOutsideTouchHandler();
    };

    hide = () => this.setVisibility(false);

    show = () => this.setVisibility(true);

    render() {
        const { props, state, show, hide, handleTouch } = this;
        return (
            <div
                onMouseEnter={show}
                onMouseLeave={hide}
                onTouchStart={handleTouch}
                ref="helptip"
                className="helptip"
            >
                <span className="helptip__target">{props.children}</span>
                {state.visible && (
                    <div ref="helptip" className="helptip__box">
                        <div
                            ref="helptip-content"
                            className="helptip__box-content"
                        >
                            {props.content}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
