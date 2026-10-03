
const API_BASE = "http://127.0.0.1:8001";
let severityChart = null;
let categoryChart = null;
let trendChart = null;

let allRecords = [];
let currentRecords = [];
let displayedLimit = 50;
let searchQuery = "";
let selectedSeverity = "";

const $ = (id) => document.getElementById(id);

async function apiGet(path) {
    const response = await fetch(`${API_BASE}${path}`);

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
}

function setConnection(connected) {
    const status = $("connectionStatus");
    status.textContent = connected ? "Connected" : "Disconnected";
    status.style.color = connected ? "#12e3bd" : "#ff526c";
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString();
}

function severityClass(severity) {
    return String(severity || "low").toLowerCase();
}

function makeCell(row, value, className = "") {
    const cell = document.createElement("td");
    cell.textContent = value ?? "";

    if (className) {
        cell.className = className;
    }

    row.appendChild(cell);
    return cell;
}

function addSeverityBadge(cell, severity) {
    const badge = document.createElement("span");
    badge.className = `severity-badge ${severityClass(severity)}`;
    badge.textContent = severity || "Unknown";
    cell.appendChild(badge);
}

function renderSeverityChart(counts) {
    const labels = ["Critical", "High", "Medium", "Low"];
    const values = labels.map((label) => counts[label] || 0);

    if (severityChart) {
        severityChart.destroy();
    }

    severityChart = new Chart($("severityChart"), {
        type: "radar",
        data: {
            labels,
            datasets: [{
                label: "Synthetic records",
                data: values,
                borderColor: "#00d5ff",
                backgroundColor: "rgba(0, 213, 255, 0.16)",
                pointBackgroundColor: [
                    "#ff526c", "#ff8a42", "#ffd34f", "#12e3bd"
                ],
                pointRadius: 4,
                borderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        color: "#8ea8c5",
                        backdropColor: "transparent",
                        maxTicksLimit: 5,
                    },
                    grid: { color: "#1b3c5c" },
                    angleLines: { color: "#1b3c5c" },
                    pointLabels: {
                        color: "#c9def2",
                        font: { size: 10 },
                    },
                },
            },
            plugins: {
                legend: { display: false },
            },
        },
    });
}

function renderCategoryChart(counts) {
    const labels = Object.keys(counts);
    const values = Object.values(counts);

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart($("categoryChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Records",
                data: values,
                backgroundColor: [
                    "#398bff", "#00c5ef", "#4c8cff",
                    "#12d9bd", "#8a79ff", "#3c9eea"
                ],
                borderRadius: 4,
                maxBarThickness: 35,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#071326",
                    borderColor: "#1b4a7c",
                    borderWidth: 1,
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: "#a6bfd9",
                        maxRotation: 35,
                        minRotation: 0,
                        font: { size: 9 },
                    },
                    grid: { display: false },
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#8ea8c5" },
                    grid: { color: "#173451" },
                },
            },
        },
    });
}

function renderTrendChart(categoryCounts) {
    // Illustrative trend only; the dataset has no hourly event history.
    const labels = [
        "00:00", "02:00", "04:00", "06:00", "08:00",
        "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"
    ];

    const total = Object.values(categoryCounts)
        .reduce((sum, value) => sum + Number(value), 0);

    const data = labels.map((_, index) =>
        Math.round((total / labels.length) * (0.65 + ((index * 7) % 8) / 10))
    );

    if (trendChart) {
        trendChart.destroy();
    }

    trendChart = new Chart($("trendChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Illustrative count",
                data,
                borderColor: "#ff654d",
                backgroundColor: "rgba(255, 101, 77, 0.13)",
                fill: true,
                tension: 0.35,
                pointRadius: 3,
                pointBackgroundColor: "#ff654d",
                borderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
            },
            scales: {
                x: {
                    ticks: { color: "#8ea8c5", maxTicksLimit: 6 },
                    grid: { color: "#173451" },
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#8ea8c5", maxTicksLimit: 5 },
                    grid: { color: "#173451" },
                },
            },
        },
    });
}

function renderConfidence(records) {
    if (!records.length) {
        $("confidenceValue").textContent = "—";
        return;
    }

    const average = Math.round(
        records.reduce(
            (sum, record) => sum + Number(record.confidence || 0), 0
        ) / records.length
    );

    const high = records.filter((r) => Number(r.confidence) >= 75).length;
    const medium = records.filter((r) =>
        Number(r.confidence) >= 50 && Number(r.confidence) < 75
    ).length;
    const low = records.length - high - medium;

    $("confidenceValue").textContent = `${average}%`;
    $("confidenceRing").style.background =
        `conic-gradient(#12e3bd 0% ${average}%, #24456a ${average}% 100%)`;

    $("confidenceHigh").textContent =
        `${Math.round(high / records.length * 100)}%`;
    $("confidenceMedium").textContent =
        `${Math.round(medium / records.length * 100)}%`;
    $("confidenceLow").textContent =
        `${Math.round(low / records.length * 100)}%`;
}

function renderSeverityRings(counts, total) {
    const config = [
        { key: "Critical", id: "Critical", color: "#ff526c" },
        { key: "High", id: "High", color: "#ff8a42" },
        { key: "Medium", id: "Medium", color: "#ffd34f" },
        { key: "Low", id: "Low", color: "#12e3bd" },
    ];

    config.forEach(({ key, id, color }) => {
        const count = counts[key] || 0;
        const percentage = total ? (count / total) * 100 : 0;

        $(`count${id}`).textContent = formatNumber(count);
        $(`percent${id}`).textContent = `${percentage.toFixed(1)}%`;

        $(`ring${id}`).style.background =
            `conic-gradient(${color} 0% ${percentage}%, #203750 ${percentage}% 100%)`;
    });
}

function renderRecentAlerts(alerts) {
    const body = $("recentAlertsBody");
    body.replaceChildren();

    if (!alerts.length) {
        const row = document.createElement("tr");
        makeCell(row, "No matching alerts", "");
        const cell = document.createElement("td");
        cell.colSpan = 3;
        cell.textContent = "";
        row.appendChild(cell);
        body.appendChild(row);
        return;
    }

    alerts.forEach((alert) => {
        const row = document.createElement("tr");

        makeCell(row, `#${alert.id}`);

        const severityCell = document.createElement("td");
        addSeverityBadge(severityCell, alert.severity);
        row.appendChild(severityCell);

        makeCell(row, alert.threat_type);
        makeCell(row, alert.risk_score, "risk-cell");

        body.appendChild(row);
    });
}

function renderRecords(records) {
    const body = $("recordsBody");
    body.replaceChildren();

    const shown = records.slice(0, displayedLimit);

    $("recordCount").textContent =
        `${records.length.toLocaleString()} MATCHING`;

    $("tableMessage").textContent =
        `Showing ${shown.length} of ${records.length} matching records`;

    $("loadMoreBtn").hidden = shown.length >= records.length;

    if (!shown.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 10;
        cell.textContent = "No matching records found.";
        row.appendChild(cell);
        body.appendChild(row);
        return;
    }

    shown.forEach((record) => {
        const row = document.createElement("tr");

        makeCell(row, `#${record.id}`);
        makeCell(
            row,
            record.timestamp
                ? new Date(record.timestamp).toLocaleString()
                : "—"
        );
        makeCell(row, record.threat_type);
        makeCell(row, record.indicator);

        const severityCell = document.createElement("td");
        addSeverityBadge(severityCell, record.severity);
        row.appendChild(severityCell);

        const risk = Number(record.risk_score || 0);
        let riskClass = "risk-low";
        if (risk >= 75) riskClass = "risk-high";
        else if (risk >= 50) riskClass = "risk-medium";

        makeCell(row, risk, `risk-cell ${riskClass}`);
        makeCell(row, record.status);
        makeCell(row, record.source);
        makeCell(row, record.mitre_tactic);
        makeCell(row, record.mitre_technique_id);

        body.appendChild(row);
    });
}

function applyFilters() {
    const query = searchQuery.toLowerCase();

    currentRecords = allRecords.filter((record) => {
        const matchesSeverity = !selectedSeverity ||
            record.severity.toLowerCase() === selectedSeverity.toLowerCase();

        const searchable = [
            record.id,
            record.timestamp,
            record.threat_type,
            record.indicator,
            record.indicator_type,
            record.severity,
            record.status,
            record.source,
            record.description,
            record.mitre_tactic,
            record.mitre_technique_id,
        ].join(" ").toLowerCase();

        return matchesSeverity && searchable.includes(query);
    });

    displayedLimit = Number($("limitSelect").value);
    renderRecords(currentRecords);
}

async function loadDashboard() {
    $("refreshBtn").disabled = true;
    $("refreshBtn").textContent = "…";

    try {
        const [stats, alertData, threatData] = await Promise.all([
            apiGet("/stats"),
            apiGet("/alerts?limit=5"),
            apiGet("/threats?limit=200"),
        ]);

        $("totalRecords").textContent = formatNumber(stats.total_records);
        $("highRisk").textContent = formatNumber(stats.high_risk_count);
        $("averageRisk").textContent = Number(stats.average_risk_score).toFixed(2);
        $("categoryCount").textContent =
            Object.keys(stats.threat_type_counts).length;

        $("alertCount").textContent = formatNumber(stats.high_risk_count);

        allRecords = threatData.results || [];

        $("openInvestigations").textContent = formatNumber(
            (stats.status_counts?.New || 0) +
            (stats.status_counts?.Investigating || 0)
        );

        renderSeverityChart(stats.severity_counts || {});
        renderCategoryChart(stats.threat_type_counts || {});
        renderTrendChart(stats.threat_type_counts || {});
        renderConfidence(allRecords);
        renderSeverityRings(
            stats.severity_counts || {},
            stats.total_records || 0
        );
        renderRecentAlerts(alertData.alerts || []);

        applyFilters();
        setConnection(true);
    } catch (error) {
        console.error("Dashboard API error:", error);
        setConnection(false);

        $("tableMessage").textContent =
            "Unable to connect. Make sure FastAPI is running on port 8000.";

        $("recordsBody").replaceChildren();
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 10;
        cell.textContent =
            "API connection failed. Start the backend and click Refresh.";
        row.appendChild(cell);
        $("recordsBody").appendChild(row);
    } finally {
        $("refreshBtn").disabled = false;
        $("refreshBtn").textContent = "↻";
    }
}

$("searchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    searchQuery = $("searchInput").value.trim();
    displayedLimit = Number($("limitSelect").value);
    applyFilters();
});

$("clearBtn").addEventListener("click", () => {
    $("searchInput").value = "";
    $("severityFilter").value = "";
    searchQuery = "";
    selectedSeverity = "";
    displayedLimit = Number($("limitSelect").value);
    applyFilters();
});

$("severityFilter").addEventListener("change", (event) => {
    selectedSeverity = event.target.value;
    applyFilters();
});

$("limitSelect").addEventListener("change", () => {
    displayedLimit = Number($("limitSelect").value);
    renderRecords(currentRecords);
});

$("loadMoreBtn").addEventListener("click", () => {
    displayedLimit += Number($("limitSelect").value);
    renderRecords(currentRecords);
});

$("refreshBtn").addEventListener("click", loadDashboard);

loadDashboard();