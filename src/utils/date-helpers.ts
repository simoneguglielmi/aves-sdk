// Date validation and creation utilities
import {
  DateString,
  DateTimeString,
  TimeString,
} from '../types/api-interfaces';

/**
 * Creates a DateString with validation
 * @param date - Date string in YYYY-MM-DD format
 * @returns DateString or throws error if invalid
 */
export const createDateString = (date: string): DateString => {
  // Basic validation for YYYY-MM-DD format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date format. Expected YYYY-MM-DD, got: ${date}`);
  }

  // Additional validation - check if it's a valid date
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date value: ${date}`);
  }

  return date as DateString;
};

/**
 * Creates a DateTimeString with validation
 * @param dateTime - DateTime string in ISO 8601 format
 * @returns DateTimeString or throws error if invalid
 */
export const createDateTimeString = (dateTime: string): DateTimeString => {
  // Basic validation for ISO 8601 format
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(dateTime)) {
    throw new Error(
      `Invalid datetime format. Expected ISO 8601, got: ${dateTime}`
    );
  }

  // Additional validation - check if it's a valid datetime
  const dateObj = new Date(dateTime);
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid datetime value: ${dateTime}`);
  }

  return dateTime as DateTimeString;
};

/**
 * Creates a TimeString with validation
 * @param time - Time string in HH:MM:SS format
 * @returns TimeString or throws error if invalid
 */
export const createTimeString = (time: string): TimeString => {
  // Basic validation for HH:MM:SS format
  if (!/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    throw new Error(`Invalid time format. Expected HH:MM:SS, got: ${time}`);
  }

  // Additional validation - check if it's a valid time
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

  return time as TimeString;
};

/**
 * Helper to get current date as DateString
 * @returns Current date in YYYY-MM-DD format
 */
export const getCurrentDateString = (): DateString => {
  return createDateString(new Date().toISOString().split('T')[0]);
};

/**
 * Helper to get current datetime as DateTimeString
 * @returns Current datetime in ISO 8601 format
 */
export const getCurrentDateTimeString = (): DateTimeString => {
  return createDateTimeString(new Date().toISOString());
};

/**
 * Validates if a string is a valid DateString without creating it
 * @param date - String to validate
 * @returns boolean
 */
export const isValidDateString = (date: string): date is DateString => {
  try {
    createDateString(date);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates if a string is a valid DateTimeString without creating it
 * @param dateTime - String to validate
 * @returns boolean
 */
export const isValidDateTimeString = (
  dateTime: string
): dateTime is DateTimeString => {
  try {
    createDateTimeString(dateTime);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates if a string is a valid TimeString without creating it
 * @param time - String to validate
 * @returns boolean
 */
export const isValidTimeString = (time: string): time is TimeString => {
  try {
    createTimeString(time);
    return true;
  } catch {
    return false;
  }
};
