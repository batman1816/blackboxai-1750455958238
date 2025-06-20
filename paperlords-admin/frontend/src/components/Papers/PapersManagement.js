import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
const seasons = ['Winter', 'Summer', 'Spring', 'Fall'];
const paperTypes = ['Question Paper', 'Mark Scheme'];

const PapersManagement = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'IGCSE',
    subject: '',
    year: currentYear,
    season: 'Summer',
    paperType: 'Question Paper',
    driveLink: '',
    description: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [filters, setFilters] = useState({
    type: '',
    subject: '',
    year: '',
    season: ''
  });

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Fetch papers with pagination and filters
  const fetchPapers = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page + 1,
        limit: pageSize,
        ...filters
      });

      const response = await axios.get(`/papers?${queryParams}`);
      setPapers(response.data.papers);
      setTotalRows(response.data.total);
    } catch (error) {
      showSnackbar('Error fetching papers', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters, showSnackbar]);

  useEffect(() => {
    fetchPapers();
  }, [page, pageSize, filters, fetchPapers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPaper) {
        await axios.put(`/papers/${selectedPaper._id}`, formData);
        showSnackbar('Paper updated successfully');
      } else {
        await axios.post('/papers', formData);
        showSnackbar('Paper added successfully');
      }
      handleCloseDialog();
      fetchPapers();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error saving paper', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this paper?')) {
      try {
        await axios.delete(`/papers/${id}`);
        showSnackbar('Paper deleted successfully');
        fetchPapers();
      } catch (error) {
        showSnackbar('Error deleting paper', 'error');
      }
    }
  };

  const handleOpenDialog = (paper = null) => {
    setSelectedPaper(paper);
    setFormData(paper || {
      title: '',
      type: 'IGCSE',
      subject: '',
      year: currentYear,
      season: 'Summer',
      paperType: 'Question Paper',
      driveLink: '',
      description: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPaper(null);
  };

  const columns = [
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'subject', headerName: 'Subject', width: 150 },
    { field: 'year', headerName: 'Year', width: 100 },
    { field: 'season', headerName: 'Season', width: 120 },
    { field: 'paperType', headerName: 'Paper Type', width: 150 },
    {
      field: 'driveLink',
      headerName: 'Drive Link',
      width: 100,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() => window.open(params.value, '_blank')}
        >
          <LinkIcon />
        </IconButton>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row._id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center" marginBottom={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h5">Papers Management</Typography>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Paper
            </Button>
          </Grid>
        </Grid>

        {/* Filters */}
        <Grid container spacing={2} marginBottom={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="IGCSE">IGCSE</MenuItem>
                <MenuItem value="IAL">IAL</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Subject"
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select
                value={filters.year}
                label="Year"
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Season</InputLabel>
              <Select
                value={filters.season}
                label="Season"
                onChange={(e) => setFilters({ ...filters, season: e.target.value })}
              >
                <MenuItem value="">All</MenuItem>
                {seasons.map((season) => (
                  <MenuItem key={season} value={season}>
                    {season}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Papers Table */}
        <DataGrid
          rows={papers}
          columns={columns}
          pagination
          pageSize={pageSize}
          rowCount={totalRows}
          paginationMode="server"
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          getRowId={(row) => row._id}
          autoHeight
          disableSelectionOnClick
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPaper ? 'Edit Paper' : 'Add New Paper'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Type"
                    required
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="IGCSE">IGCSE</MenuItem>
                    <MenuItem value="IAL">IAL</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={formData.year}
                    label="Year"
                    required
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  >
                    {years.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Season</InputLabel>
                  <Select
                    value={formData.season}
                    label="Season"
                    required
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  >
                    {seasons.map((season) => (
                      <MenuItem key={season} value={season}>
                        {season}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Paper Type</InputLabel>
                  <Select
                    value={formData.paperType}
                    label="Paper Type"
                    required
                    onChange={(e) => setFormData({ ...formData, paperType: e.target.value })}
                  >
                    {paperTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Drive Link"
                  required
                  value={formData.driveLink}
                  onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                  helperText="Enter Google Drive, Dropbox, or Proton Drive link"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedPaper ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PapersManagement;
