
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from backend.analysis_engine import (
    load_records,
    get_statistics,
    search_records,
    get_high_risk_alerts,
)

app = FastAPI(
    title="Cybersecurity Awareness & Threat Intelligence Dashboard",
    description="Defensive cybersecurity education using synthetic threat records.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Cybersecurity Awareness & Threat Intelligence Dashboard API",
        "status": "running",
        "data_type": "synthetic training records",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/stats")
def stats():
    try:
        return get_statistics()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/alerts")
def alerts(limit: int = Query(default=10, ge=1, le=100)):
    try:
        return {
            "count": len(get_high_risk_alerts(limit=limit)),
            "alerts": get_high_risk_alerts(limit=limit),
        }
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/search")
def search(q: str = Query(default="", max_length=100)):
    try:
        results = search_records(query=q)
        return {
            "query": q,
            "count": len(results),
            "results": results[:100],
            "truncated": len(results) > 100,
        }
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/threats")
def threats(
    severity: str | None = None,
    threat_type: str | None = None,
    limit: int = Query(default=50, ge=1, le=200),
):
    try:
        records = load_records()

        if severity:
            records = [
                r for r in records
                if r["severity"].lower() == severity.lower()
            ]

        if threat_type:
            records = [
                r for r in records
                if r["threat_type"].lower() == threat_type.lower()
            ]

        return {
            "count": len(records),
            "results": records[:limit],
        }
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc))