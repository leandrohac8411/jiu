// Datas sempre como texto local "YYYY-MM-DD".
// As contas usam Date.UTC só sobre ano/mês/dia, então o fuso do aparelho não muda nada.

const dois = n => String(n).padStart(2, "0");

export function hojeISO(d = new Date()) {
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

export function deISO(iso) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return { ano, mes, dia };
}

const utc = iso => { const { ano, mes, dia } = deISO(iso); return Date.UTC(ano, mes - 1, dia); };
const paraISO = ms => { const d = new Date(ms); return `${d.getUTCFullYear()}-${dois(d.getUTCMonth() + 1)}-${dois(d.getUTCDate())}`; };
const DIA = 86400000;

export function diaSemana(iso) {
  return new Date(utc(iso)).getUTCDay();
}

export function somarDias(iso, n) {
  return paraISO(utc(iso) + n * DIA);
}

export function segundaDaSemana(iso) {
  const voltar = (diaSemana(iso) + 6) % 7; // segunda = 0, domingo = 6
  return somarDias(iso, -voltar);
}

export function diasEntre(isoA, isoB) {
  return Math.round((utc(isoB) - utc(isoA)) / DIA);
}

export function diasNoMes(ano, mes) {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
}

export function dataValida(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const { ano, mes, dia } = deISO(iso);
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= diasNoMes(ano, mes);
}
