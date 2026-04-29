import axios from 'axios';

// IMPORTANT: This module uses the GLOBAL axios instance so that the
// AuthContext interceptors (which inject Bearer tokens and handle 401s)
// are automatically applied to every request. Do NOT use axios.create()
// here — that would bypass authentication entirely.

const BASE_URL = `http://${window.location.hostname}:8000/api`;

// Helper to make requests using the global axios instance with the correct base URL.
const apiGet = (path) => axios.get(`${BASE_URL}${path}`);
const apiPost = (path, data, config) => axios.post(`${BASE_URL}${path}`, data, config);
const apiDelete = (path) => axios.delete(`${BASE_URL}${path}`);

export const fetchAlerts = async () => {
    const res = await apiGet('/alerts');
    return res.data;
};

export const fetchAssets = async () => {
    const res = await apiGet('/assets');
    return res.data;
};

export const blockIp = async (ip, reason) => {
    const res = await apiPost('/response/block-ip', { ip_address: ip, reason });
    return res.data;
};

export const unblockIp = async (ip, reason) => {
    const res = await apiPost('/response/unblock-ip', { ip_address: ip, reason });
    return res.data;
};

export const fetchBlocklist = async () => {
    const res = await apiGet('/response/blocklist');
    return res.data;
};

export const fetchResponsePlaybooks = async () => {
    const res = await apiGet('/response/playbooks');
    return res.data;
};

export const createResponsePlaybook = async (data) => {
    const res = await apiPost('/response/playbooks', data);
    return res.data;
};

export const deleteResponsePlaybook = async (id) => {
    const res = await apiDelete(`/response/playbooks/${id}`);
    return res.data;
};

export const fetchResponseHistory = async () => {
    const res = await apiGet('/response/history');
    return res.data;
};

export const lookupThreatIntelIP = async (ip) => {
    const res = await apiGet(`/threat-intel/ip/${ip}`);
    return res.data;
};

export const lookupThreatIntelHash = async (hash) => {
    const res = await apiGet(`/threat-intel/hash/${hash}`);
    return res.data;
};

// Agent API
export const fetchAgents = async () => {
    const res = await apiGet('/agents');
    return res.data;
};

export const fetchAgent = async (agentId) => {
    const res = await apiGet(`/agents/${agentId}`);
    return res.data;
};

export const removeAgent = async (agentId) => {
    const res = await apiDelete(`/agents/${agentId}`);
    return res.data;
};

export const sendAgentCommand = async (agentId, command, args = {}) => {
    const res = await apiPost(`/agents/${agentId}/command`, { command, args });
    return res.data;
};

// FIM API
export const fetchFimEvents = async () => {
    const res = await apiGet('/fim');
    return res.data;
};

export const fetchFimSummary = async () => {
    const res = await apiGet('/fim/summary');
    return res.data;
};

// Vulnerability API
export const fetchVulnerabilities = async () => {
    const res = await apiGet('/vulnerabilities');
    return res.data;
};

export const fetchVulnSummary = async () => {
    const res = await apiGet('/vulnerabilities/summary');
    return res.data;
};

// SCA API
export const fetchSCAResults = async () => {
    const res = await apiGet('/sca');
    return res.data;
};

export const fetchSCASummary = async () => {
    const res = await apiGet('/sca/summary');
    return res.data;
};

// Compliance API
export const fetchComplianceState = async () => {
    const res = await apiGet('/compliance');
    return res.data;
};

// Hunting API
export const fetchHuntPlaybooks = async () => {
    const res = await apiGet('/hunting/playbooks');
    return res.data;
};

export const executeHuntQuery = async (query_string, index = "siem-*") => {
    const res = await apiPost('/hunting/execute', { query_string, index });
    return res.data;
};

// Health & Audit API
export const fetchBackendHealth = async () => {
    const res = await apiGet('/diagnostics');
    return res.data;
};

export const fetchAuditLogs = async () => {
    const res = await apiGet('/audit');
    return res.data;
};

// Reporting API
export const generateReport = async () => {
    const res = await axios.get(`${BASE_URL}/reporting/generate`, { responseType: 'blob' });
    return res.data;
};
