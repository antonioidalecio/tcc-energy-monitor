const meses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

const diasDaSemana = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

const horasDoDia = [
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00'
];

function getMonthAsString(month) {
  return meses[month];
}

function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

function padWithZeros(number, numDigits = 0) {
  let numberAsString = String(number);

  let length = numberAsString.length;

  for (let i = 0; i < numDigits - length; i++)
    numberAsString = '0' + numberAsString;

  return numberAsString;
}

export {
  getMonthAsString,
  deepCopy,
  meses,
  diasDaSemana,
  horasDoDia,
  padWithZeros
};
