import moment from "moment";

export const formatDateWithDashes = (dateInput: string) => {
  const dateArr = dateInput.split("-");
  const month = Number(dateArr[1]) < 10 ? "0" + Number(dateArr[1]) : dateArr[1];
  const day = Number(dateArr[2]) < 10 ? "0" + Number(dateArr[2]) : dateArr[2];
  return dateArr[0] + "-" + month + "-" + day;
};

export const formatWithMoment = (dateInput: string) => {
  return moment(dateInput).format("YYYY-MM-DD");
};
