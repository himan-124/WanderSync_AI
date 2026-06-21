# Documentation

## Architecture Overview

The system uses a LangGraph multi-agent pipeline:

1. **Intent Extraction**: Identifies destination, dates, and preferences.
2. **Weather/POI Search**: Pulls weather forecasts and fetches real POI data from AMap.
3. **Planner Agent**: Generates the daily itinerary.
4. **Reviewer Agent**: Evaluates the itinerary against rules (no repetition, distance, weather).
5. **Time Check Agent**: Validates spot opening hours.
6. **Meal Agent**: Recommends nearby restaurants.

## Frontend

Built with React 18, Babel Standalone. Uses standard functional components, hooks, and styled with plain CSS. Uses SortableJS for drag-and-drop itinerary editing.

## Backend

FastAPI + LangGraph. Agents interact through state passed between nodes.

## Environment Variables

Check `.env.example` for required API keys.