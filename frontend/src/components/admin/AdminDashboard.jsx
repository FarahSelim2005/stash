import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  PeopleOutline as PeopleIcon,
  EventNote as EventIcon,
  SupervisorAccount as AdminIcon,
  Store as OrganizerIcon,
  Person as UserIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ title, value, icon, color }) => (
  <Paper elevation={2} sx={{ p: 2 }}>
    <Box display="flex" alignItems="center" mb={2}>
      {icon}
      <Typography variant="h6" ml={1}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h4" color={color}>
      {value}
    </Typography>
  </Paper>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    usersByRole: {
      admin: 0,
      organizer: 0,
      user: 0,
    },
    eventsByStatus: {
      pending: 0,
      approved: 0,
      declined: 0,
    },
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      // Fetch users statistics
      const usersResponse = await axios.get('http://localhost:5000/api/v1/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch events statistics
      const eventsResponse = await axios.get('http://localhost:5000/api/v1/events', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const users = usersResponse.data.data || [];
      const events = eventsResponse.data.data || [];

      // Calculate statistics
      const userStats = users.reduce((acc, user) => {
        acc.usersByRole[user.role] = (acc.usersByRole[user.role] || 0) + 1;
        return acc;
      }, { usersByRole: {} });

      const eventStats = events.reduce((acc, event) => {
        acc.eventsByStatus[event.status] = (acc.eventsByStatus[event.status] || 0) + 1;
        return acc;
      }, { eventsByStatus: {} });

      setStats({
        totalUsers: users.length,
        totalEvents: events.length,
        usersByRole: userStats.usersByRole,
        eventsByStatus: eventStats.eventsByStatus,
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard statistics.');
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      action: () => navigate('/admin/users'),
    },
    {
      title: 'Manage Events',
      description: 'Review and moderate events',
      action: () => navigate('/admin/events'),
    },
    {
      title: 'Pending Events',
      description: 'Review events awaiting approval',
      action: () => navigate('/admin/events?filter=pending'),
    },
  ];

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
          onClick={fetchDashboardStats} 
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
        Admin Dashboard
      </Typography>

      {/* Statistics Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon color="primary" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={<EventIcon color="secondary" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Events"
            value={stats.eventsByStatus.pending || 0}
            icon={<EventIcon color="warning" />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Organizers"
            value={stats.usersByRole.organizer || 0}
            icon={<OrganizerIcon color="success" />}
            color="success.main"
          />
        </Grid>
      </Grid>

      {/* User Role Distribution */}
      <Typography variant="h6" gutterBottom>
        User Distribution
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <AdminIcon color="error" />
              <Typography variant="subtitle1" ml={1}>
                Admins
              </Typography>
            </Box>
            <Typography variant="h5" color="error">
              {stats.usersByRole.admin || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <OrganizerIcon color="warning" />
              <Typography variant="subtitle1" ml={1}>
                Organizers
              </Typography>
            </Box>
            <Typography variant="h5" color="warning.main">
              {stats.usersByRole.organizer || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <UserIcon color="info" />
              <Typography variant="subtitle1" ml={1}>
                Standard Users
              </Typography>
            </Box>
            <Typography variant="h5" color="info.main">
              {stats.usersByRole.user || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {action.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary" 
                  onClick={action.action}
                >
                  Go to {action.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 