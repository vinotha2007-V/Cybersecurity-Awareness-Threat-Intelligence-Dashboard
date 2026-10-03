
import csv
import json
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

random.seed(42)

BASE_DIR = Path(__file__).resolve().parent
CSV_FILE = BASE_DIR / "threat_records.csv"
JSON_FILE = BASE_DIR / "threat_records.json"

THREAT_TYPES = [
    "Phishing",
    "Malware",
    "Suspicious Domain",
    "Brute Force",
    "Data Exposure",
    "Vulnerability",
]

SEVERITIES = ["Critical", "High", "Medium", "Low"]
STATUSES = ["New", "Investigating", "Resolved"]
SOURCES = ["Synthetic Feed A", "Synthetic Feed B", "Training Dataset"]

TECHNIQUES = [
    ("Initial Access", "T1566"),
    ("Execution", "T1059"),
    ("Persistence", "T1098"),
    ("Credential Access", "T1110"),
    ("Discovery", "T1087"),
    ("Exfiltration", "T1041"),
]

DESCRIPTIONS = {
    "Phishing": "Simulated phishing indicator for awareness training.",
    "Malware": "Synthetic malware-related indicator; no payload is included.",
    "Suspicious Domain": "Fictional domain indicator for investigation practice.",
    "Brute Force": "Simulated repeated authentication failure alert.",
    "Data Exposure": "Synthetic data exposure alert for defensive analysis.",
    "Vulnerability": "Sample vulnerability alert for risk-awareness training.",
}

def generate_record(record_id):
    threat_type = random.choice(THREAT_TYPES)
    severity = random.choices(
        SEVERITIES,
        weights=[8, 22, 40, 30],
        k=1,
    )[0]

    technique_name, technique_id = random.choice(TECHNIQUES)
    created_at = datetime.now(timezone.utc) - timedelta(
        minutes=random.randint(0, 60 * 24 * 90)
    )

    # Reserved example IP addresses; these are not real threat observations.
    example_ips = [
        "192.0.2.10",
        "198.51.100.25",
        "203.0.113.50",
    ]

    return {
        "id": record_id,
        "timestamp": created_at.isoformat(),
        "indicator_type": random.choice(["IP", "Domain", "URL", "Hash"]),
        "indicator": random.choice(example_ips)
        if random.choice([True, False])
        else f"sample-indicator-{record_id:04d}.example",
        "threat_type": threat_type,
        "severity": severity,
        "status": random.choice(STATUSES),
        "source": random.choice(SOURCES),
        "description": DESCRIPTIONS[threat_type],
        "mitre_tactic": technique_name,
        "mitre_technique_id": technique_id,
        "confidence": random.randint(50, 100),
        "risk_score": random.randint(10, 100),
        "is_synthetic": True,
    }

def main():
    records = [generate_record(i) for i in range(1, 2001)]

    with CSV_FILE.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=records[0].keys())
        writer.writeheader()
        writer.writerows(records)

    with JSON_FILE.open("w", encoding="utf-8") as file:
        json.dump(records, file, indent=2)

    print("Synthetic dataset generated successfully!")
    print(f"Total records: {len(records)}")
    print(f"CSV file: {CSV_FILE}")
    print(f"JSON file: {JSON_FILE}")
    print("All records are synthetic training examples.")

if __name__ == "__main__":
    main()