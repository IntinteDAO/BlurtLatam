import PropTypes from 'prop-types';

const Children = PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.node),
    PropTypes.node
]);

export default { Children };
