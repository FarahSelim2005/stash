import React from 'react';
import PropTypes from 'prop-types';

const UserRow = ({ user, onDelete, onUpdateRole }) => {
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>
        <span className={`role-badge ${user.role}`}>
          {user.role}
        </span>
      </td>
      <td className="actions">
        <button
          onClick={onUpdateRole}
          className="update-btn"
        >
          Update Role
        </button>
        <button
          onClick={onDelete}
          className="delete-btn"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

UserRow.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['user', 'organizer', 'admin']).isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdateRole: PropTypes.func.isRequired,
};

export default UserRow; 