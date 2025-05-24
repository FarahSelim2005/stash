import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import PropTypes from 'prop-types';
import './AdminStyles.css';

const UpdateUserRoleModal = ({ open, onClose, user, onUpdateRole }) => {
  const [selectedRole, setSelectedRole] = useState('');

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedRole && user) {
      onUpdateRole(user._id, selectedRole);
    }
  };

  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Update User Role</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>
          <Select
            value={selectedRole}
            onChange={handleRoleChange}
            label="Role"
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="organizer">Organizer</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
        >
          Update Role
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UpdateUserRoleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['user', 'organizer', 'admin']).isRequired,
  }).isRequired,
  onUpdateRole: PropTypes.func.isRequired,
};

export default UpdateUserRoleModal; 