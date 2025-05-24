import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Pagination,
  Stack,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import axios from 'axios';

const ITEMS_PER_PAGE = 9;

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, declined
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'title'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/v1/events', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Events Response:', response.data);
      const eventData = response.data.data || response.data || [];
      setEvents(eventData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to fetch events. Please try again later.');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (eventId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showSnackbar('No authentication token found. Please login again.', 'error');
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/v1/events/${eventId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      // Update the local state
      setEvents(events.map(event => 
        event._id === eventId ? { ...event, status: newStatus } : event
      ));
      showSnackbar(`Event ${newStatus} successfully`, 'success');
    } catch (err) {
      console.error('Error updating event status:', err);
      showSnackbar(err.response?.data?.message || 'Failed to update event status.', 'error');
    }
  };

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showSnackbar('No authentication token found. Please login again.', 'error');
        return;
      }

      await axios.delete(
        `http://localhost:5000/api/v1/events/${eventToDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setEvents(events.filter(event => event._id !== eventToDelete._id));
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      showSnackbar('Event deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting event:', err);
      showSnackbar('Failed to delete event', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'declined':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesFilter = filter === 'all' || event.status === filter;
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });

  const paginatedEvents = filteredAndSortedEvents.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const pageCount = Math.ceil(filteredAndSortedEvents.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchEvents} 
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Manage Events
      </Typography>

      <Box mb={3} display="flex" gap={2} flexWrap="wrap">
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter Status</InputLabel>
          <Select
            value={filter}
            label="Filter Status"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All Events</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="declined">Declined</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Search events"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon color="action" />,
          }}
        />

        <Box>
          <Button
            startIcon={<SortIcon />}
            onClick={() => handleSortChange('date')}
            color={sortBy === 'date' ? 'primary' : 'inherit'}
          >
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            startIcon={<SortIcon />}
            onClick={() => handleSortChange('title')}
            color={sortBy === 'title' ? 'primary' : 'inherit'}
          >
            Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {paginatedEvents.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" gutterBottom>
                    {event.title}
                  </Typography>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteClick(event)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {new Date(event.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Location: {event.location}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Price: ${event.price}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Available Tickets: {event.availableTickets}
                </Typography>
                <Box mt={1}>
                  <Chip 
                    label={event.status}
                    color={getStatusColor(event.status)}
                    size="small"
                  />
                </Box>
              </CardContent>
              {event.status === 'pending' && (
                <CardActions>
                  <Button
                    size="small"
                    color="success"
                    variant="contained"
                    onClick={() => handleStatusUpdate(event._id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="contained"
                    onClick={() => handleStatusUpdate(event._id, 'declined')}
                  >
                    Decline
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredAndSortedEvents.length === 0 && (
        <Typography variant="body1" color="textSecondary" align="center">
          No events found
        </Typography>
      )}

      {filteredAndSortedEvents.length > 0 && (
        <Box mt={4} display="flex" justifyContent="center">
          <Stack spacing={2}>
            <Pagination 
              count={pageCount} 
              page={page} 
              onChange={handlePageChange}
              color="primary"
            />
          </Stack>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the event "{eventToDelete?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminEventsPage; 