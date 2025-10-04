import { format, parseISO, isValid } from 'date-fns';

/**
 * Creates a date string with validation using date-fns
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
      dateObj = parseISO(date);
    } catch {
      throw new Error(`Invalid date string: ${date}`);
    }
  } else {
    dateObj = date;
  }

  if (!isValid(dateObj)) {
    throw new Error(`Invalid date value: ${date}`);
  }

  const formattedDate = format(dateObj, 'yyyy-MM-dd');
  return formattedDate;
};

/**
 * Creates a datetime string with validation using date-fns
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
      dateObj = parseISO(dateTime);
    } catch {
      throw new Error(`Invalid datetime string: ${dateTime}`);
    }
  } else {
    dateObj = dateTime;
  }

  if (!isValid(dateObj)) {
    throw new Error(`Invalid datetime value: ${dateTime}`);
  }

  const formattedDateTime = format(dateObj, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
  return formattedDateTime;
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
