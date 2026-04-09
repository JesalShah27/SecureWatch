import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const fetchAlerts = async () => {
    const res = await api.get('/alerts');
    return res.data;
};

export const fetchAssets = async () => {
    const res = await api.get('/assets');
    return res.data;
};

export const blockIp = async (ip, reason) => {
    const res = await api.post('/response/block-ip', { ip_address: ip, reason });
    return res.data;
};

export const lookupThreatIntelIP = async (ip) => {
    const res = await api.get(`/threat-intel/ip/${ip}`);
    return res.data;
};

export const lookupThreatIntelHash = async (hash) => {
    const res = await api.get(`/threat-intel/hash/${hash}`);
    return res.data;
};

// Agent API
export const fetchAgents = async () => {
    const res = await api.get('/agents');
    return res.data;
};

export const fetchAgent = async (agentId) => {
    const res = await api.get(`/agents/${agentId}`);
    return res.data;
};

export const removeAgent = async (agentId) => {
    const res = await api.delete(`/agents/${agentId}`);
    return res.data;
};

export const sendAgentCommand = async (agentId, command, args = {}) => {
    const res = await api.post(`/agents/${agentId}/command`, { command, args });
    return res.data;
};

// FIM API
export const fetchFimEvents = async () => {
    const res = await api.get('/fim');
    return res.data;
};

export const fetchFimSummary = async () => {
    const res = await api.get('/fim/summary');
    return res.data;
};

// Vulnerability API
export const fetchVulnerabilities = async () => {
    const res = await api.get('/vulnerabilities');
    return res.data;
};

export const fetchVulnSummary = async () => {
    const res = await api.get('/vulnerabilities/summary');
    return res.data;
};

// SCA API
export const fetchSCAResults = async () => {
    const res = await api.get('/sca');
    return res.data;
};

export const fetchSCASummary = async () => {
    const res = await api.get('/sca/summary');
    return res.data;
};

// Compliance API
export const fetchComplianceState = async () => {
    const res = await api.get('/compliance');
    return res.data;
};

// Hunting API
export const fetchHuntPlaybooks = async () => {
    const res = await api.get('/hunting/playbooks');
    return res.data;
};

export const executeHuntQuery = async (query_string, index = "siem-*") => {
    const res = await api.post('/hunting/execute', { query_string, index });
    return res.data;
};

// Health & Audit API
export const fetchBackendHealth = async () => {
    const res = await api.get('/diagnostics');
    return res.data;
};

export const fetchAuditLogs = async () => {
    const res = await api.get('/audit');
    return res.data;
};


