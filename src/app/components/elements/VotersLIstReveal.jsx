import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-overlays/lib/Modal';

function VotersListReveal({ children, onHide, show }) {
    const modalStyle = {
        bottom: 0,
        left: 0,
        overflowY: 'scroll',
        position: 'fixed',
        right: 0,
        top: 0,
        display: 'block',
        zIndex: 105
    };

    return (
        <Modal
            backdrop
            onHide={onHide}
            show={show}
            backdropClassName="reveal-overlay"
            backdropStyle={{ display: 'block' }}
            style={modalStyle}
        >
            <div
                className="votersListModal reveal fade in"
                role="document"
                tabIndex="-1"
                style={{ display: 'block' }}
            >
                {children}
            </div>
        </Modal>
    );
}

VotersListReveal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
};

export default VotersListReveal;