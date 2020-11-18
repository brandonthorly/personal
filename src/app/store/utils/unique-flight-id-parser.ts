const ID_DELIMITER = '/';
const PARAM_DELIMITER = '-';

export function flightIdToUrlParam(flightId: string): string {
  return flightId.split(ID_DELIMITER).join(PARAM_DELIMITER);
}

export function urlParamToFlightId(param: string): string {
  return param.split(PARAM_DELIMITER).join(ID_DELIMITER);
}
