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