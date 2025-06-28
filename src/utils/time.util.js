/**
 * Time utility functions for handling 12-hour format with AM/PM
 */

/**
 * Convert 12-hour format (e.g., "2:30 PM") to 24-hour format (e.g., "14:30")
 * @param {string} time12 - Time in 12-hour format (e.g., "2:30 PM", "11:45 AM")
 * @returns {string} Time in 24-hour format (e.g., "14:30", "11:45")
 */
const convert12To24Hour = (time12) => {
  if (!time12) return null;
  
  // Remove extra spaces and convert to uppercase
  const cleanTime = time12.trim().toUpperCase();
  
  // Check if it's already in 24-hour format
  if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(cleanTime)) {
    return cleanTime;
  }
  
  // Parse 12-hour format
  const match = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) {
    throw new Error('Invalid time format. Use format like "2:30 PM" or "14:30"');
  }
  
  let [_, hours, minutes, period] = match;
  hours = parseInt(hours);
  minutes = parseInt(minutes);
  
  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Convert 24-hour format (e.g., "14:30") to 12-hour format (e.g., "2:30 PM")
 * @param {string} time24 - Time in 24-hour format (e.g., "14:30", "11:45")
 * @returns {string} Time in 12-hour format (e.g., "2:30 PM", "11:45 AM")
 */
const convert24To12Hour = (time24) => {
  if (!time24) return null;
  
  // Check if it's already in 12-hour format
  if (/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.test(time24.trim())) {
    return time24.trim();
  }
  
  // Parse 24-hour format
  const match = time24.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (!match) {
    throw new Error('Invalid time format. Use format like "14:30" or "2:30 PM"');
  }
  
  let [_, hours, minutes] = match;
  hours = parseInt(hours);
  minutes = parseInt(minutes);
  
  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Convert time to minutes for comparison
 * @param {string} time - Time in any format (12-hour or 24-hour)
 * @returns {number} Minutes since midnight
 */
const convertTimeToMinutes = (time) => {
  const time24 = convert12To24Hour(time);
  const [hours, minutes] = time24.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Add minutes to a time
 * @param {string} time - Time in any format (12-hour or 24-hour)
 * @param {number} minutesToAdd - Minutes to add
 * @returns {string} New time in the same format as input
 */
const addMinutesToTime = (time, minutesToAdd) => {
  const time24 = convert12To24Hour(time);
  let [hours, minutes] = time24.split(':').map(Number);
  
  minutes += minutesToAdd;
  hours += Math.floor(minutes / 60);
  minutes = minutes % 60;
  hours = hours % 24;
  
  const newTime24 = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  // Return in the same format as input
  if (/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.test(time.trim())) {
    return convert24To12Hour(newTime24);
  }
  return newTime24;
};

/**
 * Check if a time is within a range
 * @param {string} time - Time to check
 * @param {string} startTime - Start time of range
 * @param {string} endTime - End time of range
 * @returns {boolean} True if time is within range
 */
const isTimeWithinRange = (time, startTime, endTime) => {
  const timeInMinutes = convertTimeToMinutes(time);
  const startInMinutes = convertTimeToMinutes(startTime);
  const endInMinutes = convertTimeToMinutes(endTime);

  return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
};

/**
 * Validate time format (supports both 12-hour and 24-hour)
 * @param {string} time - Time to validate
 * @returns {boolean} True if valid
 */
const isValidTimeFormat = (time) => {
  if (!time) return false;
  
  const cleanTime = time.trim();
  
  // Check 24-hour format
  if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(cleanTime)) {
    return true;
  }
  
  // Check 12-hour format
  if (/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.test(cleanTime)) {
    const match = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    
    return hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59;
  }
  
  return false;
};

/**
 * Get time slots between start and end time
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @param {number} intervalMinutes - Interval in minutes (default: 60)
 * @returns {string[]} Array of time slots
 */
const getTimeSlots = (startTime, endTime, intervalMinutes = 60) => {
  const slots = [];
  let currentTime = startTime;
  
  while (convertTimeToMinutes(currentTime) < convertTimeToMinutes(endTime)) {
    slots.push(currentTime);
    currentTime = addMinutesToTime(currentTime, intervalMinutes);
  }
  
  return slots;
};

module.exports = {
  convert12To24Hour,
  convert24To12Hour,
  convertTimeToMinutes,
  addMinutesToTime,
  isTimeWithinRange,
  isValidTimeFormat,
  getTimeSlots
}; 