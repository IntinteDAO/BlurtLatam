import PropTypes from 'prop-types';

export const CloseButton = ({ className, ...restProps }) => {
    return (
        <button {...restProps} className="close-button" type="button">
            &times;
        </button>
    );
};

CloseButton.propTypes = {
    className: PropTypes.string,
};

export default CloseButton;
