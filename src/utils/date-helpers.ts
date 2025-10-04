/**
 * Creates a date string with validation using native Date
 * @param date - Date string in YYYY-MM-DD format or Date object
 * @returns string in YYYY-MM-DD format or throws error if invalid
 */
export const createDateString = (date: string | Date): string => {
  let dateObj: Date;

  if (typeof date === 'string') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error(`Invalid date format. Expected YYYY-MM-DD, got: ${date}`);
    }

    try {
      // Parse ISO date string (YYYY-MM-DD)
      dateObj = new Date(date + 'T00:00:00.000Z');
    } catch {
      throw new Error(`Invalid date string: ${date}`);
    }
  } else {
    dateObj = date;
  }

  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date value: ${date}`);
  }

  // Format to YYYY-MM-DD
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Creates a datetime string with validation using native Date
 * @param dateTime - DateTime string in ISO 8601 format or Date object
 * @returns string in ISO 8601 format or throws error if invalid
 */
export const createDateTimeString = (dateTime: string | Date): string => {
  let dateObj: Date;

  if (typeof dateTime === 'string') {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(dateTime)) {
      throw new Error(
        `Invalid datetime format. Expected ISO 8601, got: ${dateTime}`
      );
    }

    try {
      dateObj = new Date(dateTime);
    } catch {
      throw new Error(`Invalid datetime string: ${dateTime}`);
    }
  } else {
    dateObj = dateTime;
  }

  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid datetime value: ${dateTime}`);
  }

  // Return ISO string with milliseconds and Z
  return dateObj.toISOString();
};

/**
 * Creates a time string with validation
 * @param time - Time string in HH:MM:SS format
 * @returns string in HH:MM:SS format or throws error if invalid
 */
export const createTimeString = (time: string): string => {
  if (!/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    throw new Error(`Invalid time format. Expected HH:MM:SS, got: ${time}`);
  }

  const [hours, minutes, seconds] = time.split(':').map(Number);
  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    throw new Error(`Invalid time value: ${time}`);
  }

  return time;
};
