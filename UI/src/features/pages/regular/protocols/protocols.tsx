import { FC, useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    TextField,
    InputAdornment,
    IconButton,
    CircularProgress,
    Grid,
    Chip,
    Stack,
    Divider,
    Autocomplete
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import DescriptionIcon from '@mui/icons-material/Description';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PercentIcon from '@mui/icons-material/Percent';
import { useNavigate } from 'react-router-dom';
import { useProtocols } from './hooks';
import { environment } from '../../../../environments/environment';
import { useTheme } from '../../../../contexts/ThemeContext';
import ReactGA from 'react-ga4';

export const Protocols: FC = () => {
    const { themeMode } = useTheme();
    const navigate = useNavigate();
    const {
        protocols,
        protocolsList,
        companiesList,
        auditorsList,
        loading,
        searchText,
        setSearchText,
        selectedProtocols,
        setSelectedProtocols,
        selectedCompanies,
        setSelectedCompanies,
        selectedAuditors,
        setSelectedAuditors,
        getProtocolMetrics
    } = useProtocols();
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: "/protocols", title: "Protocols Page" });
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: '24px' }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 4, color: themeMode === 'light' ? '#1A1A1A' : '#F2F2F2' }}>
                PROTOCOLS
            </Typography>

            <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    size="small"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    placeholder="Search protocols..."
                    sx={{ width: '100%', maxWidth: 600 }}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <IconButton
                    id="protocols-filter-toggle"
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: themeMode === 'light' ? '#1F2937' : '#374151',
                        color: 'white',
                        '&:hover': {
                            bgcolor: themeMode === 'light' ? '#111827' : '#4B5563'
                        },
                        borderRadius: '10px',
                        transition: 'all 0.2s ease-in-out',
                        '&:active': { transform: 'scale(0.95)' }
                    }}
                >
                    <FilterListIcon />
                </IconButton>

                <Button
                    variant="contained"
                    onClick={() => {
                        setSearchText('');
                        setSelectedProtocols([]);
                        setSelectedCompanies([]);
                        setSelectedAuditors([]);
                    }}
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                >
                    Clear Filters
                </Button>
            </Box>

            {showFilters && (
                <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', p: 2, borderRadius: '12px', bgcolor: themeMode === 'light' ? '#f5f5f5' : '#222', border: '1px solid', borderColor: 'divider' }}>
                    <Autocomplete
                        id="protocol-filter-select"
                        multiple
                        size="small"
                        options={protocolsList}
                        value={selectedProtocols}
                        onChange={(_, newValue) => setSelectedProtocols(newValue)}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => (
                            <TextField {...params} label="Protocol" sx={{ minWidth: 200 }} />
                        )}
                        sx={{ flexGrow: 1, maxWidth: 300 }}
                    />
                    <Autocomplete
                        id="company-filter-select"
                        multiple
                        size="small"
                        options={companiesList}
                        value={selectedCompanies}
                        onChange={(_, newValue) => setSelectedCompanies(newValue)}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => (
                            <TextField {...params} label="Company" sx={{ minWidth: 200 }} />
                        )}
                        sx={{ flexGrow: 1, maxWidth: 300 }}
                    />
                    <Autocomplete
                        id="auditor-filter-select"
                        multiple
                        size="small"
                        options={auditorsList}
                        value={selectedAuditors}
                        onChange={(_, newValue) => setSelectedAuditors(newValue)}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => (
                            <TextField {...params} label="Auditor" sx={{ minWidth: 200 }} />
                        )}
                        sx={{ flexGrow: 1, maxWidth: 300 }}
                    />
                </Box>
            )}

            {protocols.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                    <Typography variant="h5" color="text.secondary">
                        No protocols found matching your search.
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {protocols.map((protocol) => {
                        const metrics = getProtocolMetrics(protocol.id);
                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={protocol.id}>
                                <Card sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: '20px',
                                    backgroundColor: themeMode === 'light' ? '#fafafa' : '#1A1A1A',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'all 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                                        borderColor: 'primary.main'
                                    }
                                }}>
                                    <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: themeMode === 'light' ? '#fff' : '#222', borderRadius: '20px 20px 0 0', overflow: 'hidden' }}>
                                        <CardMedia
                                            component="img"
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                p: 3
                                            }}
                                            image={`${environment.apiUrl}/api/v1/protocols/${protocol.id}/image.png`}
                                            alt={protocol.name}
                                        />
                                    </Box>

                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {protocol.name}
                                        </Typography>

                                        <Divider sx={{ mb: 2 }} />

                                        <Grid container spacing={2} sx={{ mb: 3 }}>
                                            <Grid size={6}>
                                                <Stack spacing={0.5}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                        <DescriptionIcon sx={{ fontSize: 16 }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Reports</Typography>
                                                    </Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{metrics.reportsCount}</Typography>
                                                </Stack>
                                            </Grid>
                                            <Grid size={6}>
                                                <Stack spacing={0.5}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                        <BugReportIcon sx={{ fontSize: 16 }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Vulns</Typography>
                                                    </Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{metrics.vulnerabilitiesCount}</Typography>
                                                </Stack>
                                            </Grid>
                                            <Grid size={6}>
                                                <Stack spacing={0.5}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                        <CheckCircleIcon sx={{ fontSize: 16 }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Fixed</Typography>
                                                    </Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>{metrics.fixedCount}</Typography>
                                                </Stack>
                                            </Grid>
                                            <Grid size={6}>
                                                <Stack spacing={0.5}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                        <PercentIcon sx={{ fontSize: 16 }} />
                                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Fix Rate</Typography>
                                                    </Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: metrics.fixRate > 70 ? 'success.main' : metrics.fixRate > 40 ? 'warning.main' : 'error.main' }}>
                                                        {metrics.fixRate}%
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                                                Audited By
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {metrics.auditors.length > 0 ? (
                                                    metrics.auditors.slice(0, 3).map((auditor) => (
                                                        <Chip key={auditor} label={auditor} size="small" sx={{ borderRadius: '6px' }} />
                                                    ))
                                                ) : (
                                                    <Typography variant="caption" color="text.disabled">No reports yet</Typography>
                                                )}
                                                {metrics.auditors.length > 3 && (
                                                    <Chip label={`+${metrics.auditors.length - 3}`} size="small" variant="outlined" sx={{ borderRadius: '6px' }} />
                                                )}
                                            </Box>
                                        </Box>

                                        <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={() => navigate(`/protocol/${protocol.id}`)}
                                                sx={{
                                                    borderRadius: '10px',
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    boxShadow: 'none'
                                                }}
                                            >
                                                View Details
                                            </Button>
                                            <IconButton
                                                sx={{
                                                    borderRadius: '10px',
                                                    border: '1px solid',
                                                    borderColor: 'divider'
                                                }}
                                                onClick={() => navigate(`/protocol/${protocol.id}`)}
                                            >
                                                <FullscreenIcon />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
};
