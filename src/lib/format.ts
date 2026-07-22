export function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('es-ES')}`;
}

export function daysUntil(iso: string) {
  const target = new Date(iso + 'T00:00:00').getTime();
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

const dayOrder = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function sortByDay<T extends { day: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
}
