export const convertedDateTime = (utcSeconds) => {
  var date = new Date(0);
  date.setUTCSeconds(utcSeconds);
  
  var options = { timeZone: "Asia/Kolkata", hour12: true, hour: "numeric", minute: "numeric" };
  var time = date.toLocaleString("en-US", options);
  
  var dateString = date.toLocaleDateString("en-In");
  
  return { date: dateString, time: time };
}

export const truncateString = (str, length) => {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export const displayDateOrTime = (timestampInSeconds) => {
  const messageDate = new Date(timestampInSeconds * 1000); // Convert seconds to milliseconds
  const today = new Date();

  // Check if the message is from today
  const isSameDay =
    messageDate.getDate() === today.getDate() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getFullYear() === today.getFullYear();

  // If the message is from today, show the time, otherwise show the date
  if (isSameDay) {
    return convertedDateTime(timestampInSeconds).time; // Show time in 12-hour format
  } else {
    return convertedDateTime(timestampInSeconds).date; // Show date in dd/mm/yyyy format
  }
};