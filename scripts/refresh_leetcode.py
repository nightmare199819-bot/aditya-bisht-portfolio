#!/usr/bin/env python3
"""Refresh public LeetCode profile data. No login cookies or credentials are used."""
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "leetcode.json"
USERNAME = os.environ.get("LEETCODE_USERNAME", "aditya__bisht")
QUERY = """query portfolioProfile($username: String!) {
  matchedUser(username: $username) {
    username
    submitStats: submitStatsGlobal {
      acSubmissionNum { difficulty count }
    }
  }
  recentAcSubmissionList(username: $username, limit: 5) {
    id title titleSlug timestamp
  }
}"""


def main():
    body = json.dumps({"query": QUERY, "variables": {"username": USERNAME}}).encode()
    request = urllib.request.Request(
        "https://leetcode.com/graphql/",
        data=body,
        headers={
            "Content-Type": "application/json",
            "Referer": f"https://leetcode.com/u/{USERNAME}/",
            "User-Agent": "portfolio-public-stats/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            result = json.loads(response.read().decode("utf-8"))
        if result.get("errors"):
            raise RuntimeError("LeetCode returned GraphQL errors")
        user = (result.get("data") or {}).get("matchedUser")
        if not user:
            raise RuntimeError(f"Public profile not found for {USERNAME}")

        counts = {
            row["difficulty"]: int(row["count"])
            for row in user["submitStats"]["acSubmissionNum"]
        }
        recent = [
            {
                "title": item.get("title", "Accepted submission"),
                "titleSlug": item.get("titleSlug", ""),
                "date": datetime.fromtimestamp(
                    int(item["timestamp"]), timezone.utc
                ).isoformat(),
                "url": "https://leetcode.com/problems/" + item.get("titleSlug", ""),
                "status": "Accepted",
            }
            for item in result["data"].get("recentAcSubmissionList", [])
        ]
        data = {
            "source": "live",
            "updatedAt": datetime.now(timezone.utc).isoformat(),
            "profile": USERNAME,
            "stats": {
                "totalSolved": counts.get(
                    "All", sum(counts.get(level, 0) for level in ("Easy", "Medium", "Hard"))
                ),
                "easySolved": counts.get("Easy", 0),
                "mediumSolved": counts.get("Medium", 0),
                "hardSolved": counts.get("Hard", 0),
            },
            "recent": recent,
        }
        OUTPUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print("Updated public LeetCode stats.")
    except (urllib.error.URLError, TimeoutError, ValueError, KeyError, RuntimeError) as error:
        print(f"Refresh failed; keeping existing data: {error}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

