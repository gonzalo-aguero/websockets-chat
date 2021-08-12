/**
 * Get the formatted date in the following format: day-month-year at hours:minutes (for example: "03-07-2021 at 09:04")
 * @returns Formatted date.
 */
function useDate(){
    const date = new Date();
    const separator = '-';
    const day = date.getDay();
    const month = date.getMonth();
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    let dateString = (day < 10 ? "0" + day : day) +separator+ (month < 10 ? "0" + month : month) +separator+year;
    dateString += " "+ (hour < 10 ? "0" + hour : hour) +":"+ (minute < 10 ? "0" + minute : minute);
    return dateString;
}
module.exports.useDate = useDate;