export function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  
  const units = ['', 'K', 'M', 'B'];
  const k = 1000;
  const magnitude = Math.floor(Math.log(num) / Math.log(k));
  
  const value = num / Math.pow(k, magnitude);
  const formattedValue = value >= 10 ? Math.floor(value) : value.toFixed(1);
  
  return formattedValue + units[magnitude];
} 