/**
 * Нормализует номер телефона, удаляя пробелы и скобки
 * Формат результата: +70000000000
 * @param phone - номер телефона в любом формате
 * @returns нормализованный номер телефона
 */
export function normalizePhone(phone: string): string {
  if (!phone) {
    return phone;
  }
  // Удаляем все пробелы, скобки и дефисы, оставляем только + и цифры
  return phone.replace(/[\s()\-]/g, '');
}
