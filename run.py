"""Start the portal.

usage:
    python run.py
    → http://localhost:8765
"""

import logging
import uvicorn

# Configuration log:INFO Level retains main process information;
# app.planning.helpers of WARNING log(LLM Try again/Time consuming) will be printed directly to the console,
# No additional configuration is required to see structured output failure retries.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
# Enable DEBUG for the planning core modules to log LLM call latency and time_check reasoning.
logging.getLogger("backend.modules.trip.helpers").setLevel(logging.DEBUG)
logging.getLogger("backend.modules.trip.agents").setLevel(logging.DEBUG)

if __name__ == "__main__":
    print("✈️  Travel Planning Assistant is starting...")
    print("   access:http://localhost:8765")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8765, reload=False)
