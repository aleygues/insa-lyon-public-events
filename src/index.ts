import express from "express";
import { getEvents } from "./scrap";

const app = express();

// Cache configuration
const CACHE_TTL = 20 * 60 * 1000; // 20 minutes in ms
const CACHE_REFRESH_THRESHOLD = 15 * 60 * 1000; // 15 minutes in ms

// Cache state
interface CacheEntry {
  data: any;
  timestamp: number;
  updatePromise: Promise<any> | null;
}

let cache: CacheEntry | null = null;

// Get events with caching and background refresh
async function getCachedEvents(): Promise<any> {
  const now = Date.now();

  // If no cache or cache is expired (older than TTL), fetch fresh data
  if (!cache || now - cache.timestamp >= CACHE_TTL) {
    const data = await getEvents();
    cache = {
      data,
      timestamp: now,
      updatePromise: null
    };
    return data;
  }

  // Cache is stale (older than refresh threshold) - return cached data and trigger background refresh
  if (now - cache.timestamp >= CACHE_REFRESH_THRESHOLD) {
    // If there's no ongoing update, start one in the background
    if (!cache.updatePromise) {
      const updatePromise = getEvents()
        .then((data) => {
          cache = {
            data,
            timestamp: Date.now(),
            updatePromise: null
          };
        })
        .catch((error) => {
          console.error("Background cache refresh failed:", error);
          // Clear the promise so we can retry on next request
          if (cache) {
            cache.updatePromise = null;
          }
        });

      cache.updatePromise = updatePromise;
    }

    // Return the current cached data
    return cache.data;
  }

  // Cache is fresh, return it
  return cache.data;
}

// Get exclusion words from environment variable (comma-separated)
const excludeWordsEnv = process.env.EXCLUDE_WORDS || "";
const excludeWords = excludeWordsEnv
  .split(",")
  .map((w) => w.trim().toLowerCase())
  .filter((w) => w.length > 0);

// Filter events based on exclusion words
function filterEvents(events: any[], excludeWords: string[]): any[] {
  if (excludeWords.length === 0) {
    return events;
  }
  return events.filter((event) => {
    const labelLower = event.label.toLowerCase();
    return !excludeWords.some((word) => labelLower.includes(word));
  });
}

app.get("/", async (req, res) => {
  try {
    const data = await getCachedEvents();
    // Filter out excluded events
    data.events = filterEvents(data.events, excludeWords);
    res.set("Content-Type", "application/json");
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.get("/:username", async (req, res) => {
  try {
    const data = await getCachedEvents();
    // Filter out excluded events
    data.events = filterEvents(data.events, excludeWords);
    res.set("Content-Type", "application/json");
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
