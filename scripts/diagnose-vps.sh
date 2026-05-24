#!/usr/bin/env bash
# Collect signals that explain API downtime / periodic crashes.
# Run on the VPS: ./scripts/diagnose-vps.sh

set -euo pipefail

REPORT="${1:-/tmp/mixxl-diagnose-$(date +%Y%m%d-%H%M%S).txt}"

{
  echo "=== Mixxl VPS diagnostic $(date -Is) ==="
  echo

  echo "--- Uptime / load ---"
  uptime
  echo

  echo "--- Memory ---"
  free -h
  echo

  echo "--- Disk ---"
  df -h /
  df -h /var/lib/docker 2>/dev/null || true
  echo

  echo "--- Docker API container ---"
  if docker inspect mixxl-api &>/dev/null; then
    docker inspect mixxl-api --format 'Status={{.State.Status}} RestartCount={{.RestartCount}} Started={{.State.StartedAt}} Finished={{.State.FinishedAt}} OOMKilled={{.State.OOMKilled}} ExitCode={{.State.ExitCode}}'
    echo
    echo "Last 80 log lines:"
    docker compose -f "$(dirname "$0")/../docker-compose.yml" logs --tail=80 api 2>/dev/null || docker logs --tail=80 mixxl-api
  else
    echo "mixxl-api container not found"
  fi
  echo

  echo "--- OOM killer (kernel log) ---"
  journalctl -k --no-pager -n 50 2>/dev/null | grep -iE 'oom|out of memory|killed process' || dmesg -T 2>/dev/null | grep -iE 'oom|out of memory|killed process' | tail -20 || echo "(no OOM lines found or no permission)"
  echo

  echo "--- Recent system errors ---"
  journalctl -p err --since "7 days ago" --no-pager -n 30 2>/dev/null || echo "(journalctl unavailable)"
  echo

  echo "--- Listening on :5000 ---"
  ss -lntp | grep 5000 || echo "(nothing on 5000)"
  echo

  echo "--- Health ---"
  curl -fsS --max-time 5 http://127.0.0.1:5000/api/health && echo || echo "health check FAILED"
  echo

  echo "--- Nginx errors (last 20) ---"
  tail -20 /var/log/nginx/error.log 2>/dev/null || echo "(no nginx error log access)"
  echo

  echo "=== End ==="
} | tee "$REPORT"

echo "Report saved to: $REPORT"
