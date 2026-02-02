import { fixMessagesGridPatterns } from "../../utils/formValidator";

export function formatFixSendingTime(fixTime) {
  if (!fixTime) return "";
  const match = fixTime.match(fixMessagesGridPatterns?.sendingTimePattern);
  if (!match) return fixTime;
  const [_, year, month, day, hour, minute, second, ms = "0"] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    Number(ms),
  );
  if (isNaN(date.getTime())) return fixTime;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
