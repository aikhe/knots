import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("slack reminders", { hours: 24 }, internal.reminders.sendSlack);
crons.cron("morning digest", "0 23 * * *", internal.reminders.sendDigest);

export default crons;
