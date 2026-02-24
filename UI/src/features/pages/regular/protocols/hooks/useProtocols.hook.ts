import { useEffect, useState } from 'react';
import { getProtocolListDataCall, getReportsCall, getVulnerabilitiesCall, getCompanyListDataCall, getAuditorListDataCall } from '../../../../../api/soroban-security-portal/soroban-security-portal-api';
import { ProtocolItem } from '../../../../../api/soroban-security-portal/models/protocol';
import { Report } from '../../../../../api/soroban-security-portal/models/report';
import { Vulnerability, VulnerabilityCategory } from '../../../../../api/soroban-security-portal/models/vulnerability';
import { CompanyItem } from '../../../../../api/soroban-security-portal/models/company';
import { AuditorItem } from '../../../../../api/soroban-security-portal/models/auditor';

export const useProtocols = () => {
    const [protocolsList, setProtocolsList] = useState<ProtocolItem[]>([]);
    const [filteredProtocols, setFilteredProtocols] = useState<ProtocolItem[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
    const [companiesList, setCompaniesList] = useState<CompanyItem[]>([]);
    const [auditorsList, setAuditorsList] = useState<AuditorItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedProtocols, setSelectedProtocols] = useState<ProtocolItem[]>([]);
    const [selectedCompanies, setSelectedCompanies] = useState<CompanyItem[]>([]);
    const [selectedAuditors, setSelectedAuditors] = useState<AuditorItem[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [protocolsData, reportsData, vulnerabilitiesData, companiesData, auditorsData] = await Promise.all([
                getProtocolListDataCall(),
                getReportsCall(),
                getVulnerabilitiesCall(),
                getCompanyListDataCall(),
                getAuditorListDataCall()
            ]);
            setProtocolsList(protocolsData);
            setFilteredProtocols(protocolsData);
            setReports(reportsData);
            setVulnerabilities(vulnerabilitiesData);
            setCompaniesList(companiesData);
            setAuditorsList(auditorsData);
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
            // 1. Explicit multi-select filters (AND logic between different types, OR within same type)
            if (selectedProtocols.length > 0 && !selectedProtocols.some(sp => sp.id === p.id)) {
                return false;
            }

            const protocolReports = reports.filter(r => r.protocolId === p.id);

            if (selectedCompanies.length > 0 && !selectedCompanies.some(sc => protocolReports.some(r => r.companyName === sc.name))) {
                return false;
            }

            if (selectedAuditors.length > 0 && !selectedAuditors.some(sa => protocolReports.some(r => r.auditorName === sa.name))) {
                return false;
            }

            // 2. Broad search text filter
            if (!lowerSearch) return true;

            const matchesName = p.name.toLowerCase().includes(lowerSearch);
            const matchesDesc = p.description && p.description.toLowerCase().includes(lowerSearch);
            const matchesCompany = protocolReports.some(r => r.companyName?.toLowerCase().includes(lowerSearch));
            const matchesAuditor = protocolReports.some(r => r.auditorName?.toLowerCase().includes(lowerSearch));

            return matchesName || matchesDesc || matchesCompany || matchesAuditor;
        });
        setFilteredProtocols(filtered);
    }, [searchText, protocolsList, reports, selectedProtocols, selectedCompanies, selectedAuditors]);

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
        getProtocolMetrics,
        refresh: fetchData
    };
};
