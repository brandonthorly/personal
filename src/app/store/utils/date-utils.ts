export function addMinutes(dt: Date, minutes: number): Date {
  const newDate = new Date(dt);

  return new Date(newDate.setMinutes(newDate.getMinutes() + minutes));
}
