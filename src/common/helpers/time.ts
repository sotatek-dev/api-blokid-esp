import { Moment, MomentInput } from 'moment';
import { Time, TimeInput } from 'src/core/libs/time';

export function getCurrentDate(): Date {
  return Time().toDate();
}

export function getCurrentTime(): number {
  return Time().toDate().getTime();
}

export function getStartOfYesterday() {
  return Time().add(1, 'day').startOf('day').toDate();
}

export function getEndOfYesterday(): Date {
  return Time().subtract(1, 'day').endOf('day').toDate();
}

export function getStartOfTomorrow() {
  return Time().add(1, 'day').startOf('day').toDate();
}

export function getEndOfTomorrow(): Date {
  return Time().subtract(1, 'day').endOf('day').toDate();
}

export function getStartOfToday() {
  return Time().startOf('day').toDate();
}

export function getEndOfToday(): Date {
  return Time().endOf('day').toDate();
}

export function getStartOfDate(date: TimeInput) {
  return Time(date).startOf('day').toDate();
}

export function getEndOfDate(date: TimeInput): Date {
  return Time(date).endOf('day').toDate();
}

export function utcStartOfToday(): Moment {
  return Time().utcOffset(0).startOf('day');
}

// ****************************** Compare Date ******************************
export function compareDates(baseTime: MomentInput, comparedTime: MomentInput): number {
  return Time(baseTime).diff(comparedTime, 'seconds');
}

export function isDateWithinCurrentDay(date: MomentInput): boolean {
  return Time(date).isBetween(Time().startOf('day'), Time().endOf('day'));
}

export function toSeconds(minutes: number) {
  return minutes * 60;
}
