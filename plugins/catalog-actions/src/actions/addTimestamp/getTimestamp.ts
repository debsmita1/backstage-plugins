export const getTimestamp = () => {
  const dateObj = new Date(Date.now());

  const time =
    dateObj.getHours() > 12
      ? `${dateObj.getHours() - 12}:${
          dateObj.getMinutes() < 10
            ? '0' + dateObj.getMinutes()
            : dateObj.getMinutes()
        }:${
          dateObj.getSeconds() < 10
            ? '0' + dateObj.getSeconds()
            : dateObj.getSeconds()
        } PM`
      : `${dateObj.getHours()}:${
          dateObj.getMinutes() < 10
            ? '0' + dateObj.getMinutes()
            : dateObj.getMinutes()
        }:${
          dateObj.getSeconds() < 10
            ? '0' + dateObj.getSeconds()
            : dateObj.getSeconds()
        } AM`;
  return `${dateObj.toLocaleDateString()}, ${time}`;
};
