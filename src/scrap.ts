import axios from "axios";
import * as cheerio from "cheerio";
import { parse } from "date-fns";

// Define the Event interface
interface Event {
    label: string;
    startDateTime: string;
    endDateTime: string;
    location: string;
}

// Define the output interface
interface Output {
    unreadMails: number;
    events: Event[];
}

// Fetch the HTML content of the page
const url = "https://www.insa-lyon.fr/fr/agenda";

async function fetchHTML(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching the URL: ${error}`);
    throw error;
  }
}

// French month abbreviations to English mapping
const frenchMonths: Record<string, string> = {
  "jan": "Jan",
  "fév": "Feb",
  "mar": "Mar",
  "avr": "Apr",
  "mai": "May",
  "juin": "Jun",
  "juil": "Jul",
  "août": "Aug",
  "sep": "Sep",
  "oct": "Oct",
  "nov": "Nov",
  "déc": "Dec"
};

// Parse the HTML content using Cheerio
async function parseHTML(html: string): Promise<Output> {
  const $ = cheerio.load(html);
  const events: Event[] = [];

  // Extract events from the calendar
  $("div.event").each((index, element) => {
    const day = $(element).find(".jour").text().trim().replace(/\s+/g, " ").trim();
    let month = $(element).find(".mois").text().trim().replace(/\s+/g, " ").trim();
    let label = $(element).find("h4 a").text().trim().replace(/\s+/g, " ").trim();
    
    if (day && month && label) {
      // Map French month to English for date-fns parsing
      month = frenchMonths[month.toLowerCase()] || month;
      
      // Create a date string for parsing
      const year = new Date().getFullYear();
      const dateStr = `${day} ${month} ${year}`;
      
      // Parse the date
      const date = parse(dateStr, "dd MMM yyyy", new Date());
      
      // Create start and end datetime strings
      const startDateTime = date.toISOString();
      const endDateTime = new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString(); // Add 2 hours
      
      // Add the event to the array
      events.push({
        label: label,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        location: "INSA Lyon"
      });
    }
  });

  // Return the output object
  return {
    unreadMails: 0,
    events: events
  };
}

// Main function to execute the script
export async function getEvents() {
  try {
    const html = await fetchHTML(url);
    const output = await parseHTML(html);
    return output;
  } catch (error) {
    console.error(`An error occurred: ${error}`);
    throw error;
  }
}