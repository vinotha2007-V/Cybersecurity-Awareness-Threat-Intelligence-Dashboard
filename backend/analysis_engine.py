
import csv
from collections import Counter
from pathlib import Path


DATA_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "threat_records.csv"
)


def load_records():
    """Load the synthetic threat records from CSV."""
    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_FILE}"
        )

    with DATA_FILE.open("r", encoding="utf-8", newline="") as file:
        return list(csv.DictReader(file))


def get_statistics(records=None):
    """Calculate dashboard statistics."""
    if records is None:
        records = load_records()

    total = len(records)

    severity_counts = Counter(
        record["severity"] for record in records
    )
    type_counts = Counter(
        record["threat_type"] for record in records
    )
    status_counts = Counter(
        record["status"] for record in records
    )

    risk_scores = [
        int(record["risk_score"]) for record in records
    ]

    average_risk = (
        round(sum(risk_scores) / total, 2)
        if total else 0
    )

    high_risk_alerts = [
        record for record in records
        if int(record["risk_score"]) >= 75
    ]

    return {
        "total_records": total,
        "severity_counts": dict(severity_counts),
        "threat_type_counts": dict(type_counts),
        "status_counts": dict(status_counts),
        "average_risk_score": average_risk,
        "high_risk_count": len(high_risk_alerts),
    }


def search_records(records=None, query=""):
    """Search indicator, type, severity, status, or description."""
    if records is None:
        records = load_records()

    query = query.strip().lower()

    if not query:
        return records

    searchable_fields = (
        "indicator",
        "indicator_type",
        "threat_type",
        "severity",
        "status",
        "description",
        "mitre_tactic",
        "mitre_technique_id",
    )

    return [
        record for record in records
        if any(
            query in record.get(field, "").lower()
            for field in searchable_fields
        )
    ]


def get_high_risk_alerts(records=None, limit=10):
    """Return records with a risk score of 75 or higher."""
    if records is None:
        records = load_records()

    alerts = [
        record for record in records
        if int(record["risk_score"]) >= 75
    ]

    return sorted(
        alerts,
        key=lambda record: int(record["risk_score"]),
        reverse=True,
    )[:limit]


if __name__ == "__main__":
    records = load_records()
    stats = get_statistics(records)

    print("\n===== THREAT INTELLIGENCE SUMMARY =====")
    print(f"Total records: {stats['total_records']}")
    print(f"Average risk score: {stats['average_risk_score']}")
    print(f"High-risk alerts: {stats['high_risk_count']}")

    print("\nSeverity breakdown:")
    for severity, count in sorted(stats["severity_counts"].items()):
        print(f"  {severity}: {count}")

    print("\nThreat category breakdown:")
    for threat_type, count in sorted(
        stats["threat_type_counts"].items()
    ):
        print(f"  {threat_type}: {count}")

    print("\nTop 5 high-risk synthetic alerts:")
    for alert in get_high_risk_alerts(records, limit=5):
        print(
            f"  ID {alert['id']} | "
            f"{alert['threat_type']} | "
            f"Risk: {alert['risk_score']} | "
            f"Severity: {alert['severity']}"
        )