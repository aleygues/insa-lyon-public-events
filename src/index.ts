import express from "express";
import { getEvents } from "./scrap";

const app = express();

// Get exclusion words from environment variable (comma-separated)
const excludeWordsEnv = process.env.EXCLUDE_WORDS || "";
const excludeWords = excludeWordsEnv.split(",").map(w => w.trim().toLowerCase()).filter(w => w.length > 0);

// Filter events based on exclusion words
function filterEvents(events: any[], excludeWords: string[]): any[] {
  if (excludeWords.length === 0) {
    return events;
  }
  return events.filter(event => {
    const labelLower = event.label.toLowerCase();
    return !excludeWords.some(word => labelLower.includes(word));
  });
}

app.get("/", async (req, res) => {
  try {
    const data = await getEvents();
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
