export function formatPhoneNumber(phoneNumber: string) {
  // console.log("P ", phoneNumber);
  if (!phoneNumber || phoneNumber.length === 0) return "";

  const digitsOnly = phoneNumber.replace(/[^\d+]/g, "");
  const countryCode = digitsOnly.substr(0, 2);

  let formattedPhoneNumber = "";

  const lastDigits = digitsOnly.slice(-10);
  if (lastDigits.length === 0 || lastDigits.length < 10) return "";

  formattedPhoneNumber =
    " (" +
    lastDigits.substr(0, 3) +
    ") " +
    lastDigits.substr(3, 3) +
    "-" +
    lastDigits.substr(6, 4);

  return formattedPhoneNumber;
}

export function fixPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters from the phone number
  const digitsOnly = phoneNumber.replace(/[^\d+]/g, "");

  if (digitsOnly.length === 0 || digitsOnly.length < 10) return "";

  const number = digitsOnly.substring(0, 12);

  if (number.length === 10 && number.substring(0, 2) != "+1") {
    return "+1" + number;
  } else {
    return "+1" + digitsOnly.slice(-10);
  }
}

export function convertToSpreadSheetNumber(str: string) {
  str = str.toUpperCase();
  var base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = 0;

  for (var i = 0; i < str.length; i++) {
    var char = str.charAt(i);
    var power = str.length - i - 1;
    var value = base.indexOf(char) + 1;
    result += value * Math.pow(26, power);
  }

  return result;
}

export function convertToSpreadSheetLetter(number: number) {
  var base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = "";

  while (number > 0) {
    var remainder = (number - 1) % 26;
    result = base.charAt(remainder) + result;
    number = Math.floor((number - 1) / 26);
  }

  return result;
}

export function ezObj(variable: { [key: string]: string[] }) {
  const title = Object.keys(variable)[0];
  const value = Object.values(variable)[0];
  return { title: title as string, value: value as string[] };
}
