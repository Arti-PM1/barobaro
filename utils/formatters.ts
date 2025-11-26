export const formatDate = (timestamp?: number | string) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  });
};
