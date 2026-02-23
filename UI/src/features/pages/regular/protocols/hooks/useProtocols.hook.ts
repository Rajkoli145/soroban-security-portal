import { useEffect, useState } from 'react';
import { getProtocolListDataCall, getReportsCall, getVulnerabilitiesCall } from '../../../../../api/soroban-security-portal/soroban-security-portal-api';
import { ProtocolItem } from '../../../../../api/soroban-security-portal/models/protocol';
import { Report } from '../../../../../api/soroban-security-portal/models/report';
import { Vulnerability, VulnerabilityCategory } from '../../../../../api/soroban-security-portal/models/vulnerability';

export const useProtocols = () => {
    const [protocolsList, setProtocolsList] = useState<ProtocolItem[]>([]);
    const [filteredProtocols, setFilteredProtocols] = useState<ProtocolItem[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [protocolsData, reportsData, vulnerabilitiesData] = await Promise.all([
                getProtocolListDataCall(),
                getReportsCall(),
                getVulnerabilitiesCall()
            ]);
            setProtocolsList(protocolsData);
            setFilteredProtocols(protocolsData);
            setReports(reportsData);
            setVulnerabilities(vulnerabilitiesData);
        } catch (error) {
            console.error('Failed to fetch protocols data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const lowerSearch = searchText.toLowerCase();
        const filtered = protocolsList.filter(p => {
            const matchesName = p.name.toLowerCase().includes(lowerSearch);
            const matchesDesc = p.description && p.description.toLowerCase().includes(lowerSearch);

            // Check if search matches company or auditors from associated reports
            const protocolReports = reports.filter(r => r.protocolId === p.id);
            const matchesCompany = protocolReports.some(r => r.companyName?.toLowerCase().includes(lowerSearch));
            const matchesAuditor = protocolReports.some(r => r.auditorName?.toLowerCase().includes(lowerSearch));

            return matchesName || matchesDesc || matchesCompany || matchesAuditor;
        });
        setFilteredProtocols(filtered);
    }, [searchText, protocolsList, reports]);

    // Aggregate metrics for each protocol
    const getProtocolMetrics = (protocolId: number) => {
        const protocolReports = reports.filter(r => r.protocolId === protocolId);
        const protocolVulnerabilities = vulnerabilities.filter(v => v.protocolId === protocolId);

        const totalVulnerabilities = protocolVulnerabilities.length;
        const fixedVulnerabilities = protocolVulnerabilities.filter(v => v.category === VulnerabilityCategory.Valid).length;
        const fixRate = totalVulnerabilities > 0 ? Math.round((fixedVulnerabilities / totalVulnerabilities) * 100) : 0;

        return {
            reportsCount: protocolReports.length,
            vulnerabilitiesCount: totalVulnerabilities,
            fixedCount: fixedVulnerabilities,
            fixRate,
            companyName: protocolReports.length > 0 ? protocolReports[0].companyName : 'N/A',
            auditors: Array.from(new Set(protocolReports.map(r => r.auditorName))).filter(Boolean) as string[]
        };
    };

    return {
        protocols: filteredProtocols,
        loading,
        searchText,
        setSearchText,
        getProtocolMetrics,
        refresh: fetchData
    };
};
