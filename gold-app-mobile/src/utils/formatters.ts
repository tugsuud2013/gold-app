export const formatMNT = (amount: number) => `₮${Math.round(amount).toLocaleString()}`;

export const formatGrams = (grams: number) => `${grams} гр`;

export const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

export const formatDateTime = (date: string | Date) => {
  const d = new Date(date);
  return `${formatDate(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const formatPhone = (phone: string) => (phone.length >= 8 ? `${phone.slice(0, 4)}-XXXX` : phone);

export const maskRegister = (register: string) =>
  register.length >= 8 ? `${register.slice(0, 2)}****${register.slice(-2)}` : register;

export const getTimeAgo = (date: string | Date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'саяхан';
  if (min < 60) return `${min} минутын өмнө`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} цагийн өмнө`;
  const day = Math.floor(hour / 24);
  return `${day} өдрийн өмнө`;
};
