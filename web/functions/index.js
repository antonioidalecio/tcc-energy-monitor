const functions = require("firebase-functions");
const admin = require("firebase-admin");
const moment = require("moment");

const ptBr = require("moment/locale/pt-br");

moment.updateLocale('pt-BR', ptBr);

// $ firebase functions:delete myFunction

admin.initializeApp(functions.config().firebase);

const firebaseDataBase = admin.database();

// GMT-04 = -240 minutos / 60 minutos por hora = -4 horas
// GMT-03 = -180 minutos / 60 minutos por hora = -3 horas --> Horário de Verão
const CampoGrandeTimeZone = -180;

exports.updateConsumoAcumulado = functions.database.ref('historico/{pushKey}').onCreate((snapshot, context) => {
  
  const consumoAtual = snapshot.val();

  console.log('v0.1');

  console.log('consumoAtual:', consumoAtual);

  const { timestamp, potencia } = consumoAtual;
  
  const date = moment(timestamp).utcOffset(CampoGrandeTimeZone);

  const dia = date.format('DD');
  const mes = date.format('MM');
  const ano = date.format('YYYY');
  const hora = date.format('HH');

  console.log('Hora Atual (GMT-04):', date.toLocaleString());
  
  const acumuladoHora = firebaseDataBase.ref(`acumulados/${ano}/${mes}/${dia}/${hora}/acumulado`).once('value');
  const acumuladoDia = firebaseDataBase.ref(`acumulados/${ano}/${mes}/${dia}/acumulado`).once('value');
  const acumuladoMes = firebaseDataBase.ref(`acumulados/${ano}/${mes}/acumulado`).once('value');

  return Promise.all([acumuladoHora, acumuladoDia, acumuladoMes])
    .then(resultados => {

      const [consumoAnteriorHora, consumoAnteriorDia, consumoAnteriorMes] = resultados;

      const atualizacoes = {};

      console.log('consumoAnteriorHora:', consumoAnteriorHora.val());
      console.log('consumoAnteriorDia:', consumoAnteriorDia.val());
      console.log('consumoAnteriorMes:', consumoAnteriorMes.val());

      atualizacoes[`${ano}/${mes}/${dia}/${hora}/acumulado`] = consumoAnteriorHora.val() + potencia;
      atualizacoes[`${ano}/${mes}/${dia}/${hora}/updatedBy`] = timestamp;
      atualizacoes[`${ano}/${mes}/${dia}/acumulado`] = consumoAnteriorDia.val() + potencia;
      atualizacoes[`${ano}/${mes}/${dia}/updatedBy`] = timestamp;
      atualizacoes[`${ano}/${mes}/acumulado`] = consumoAnteriorMes.val() + potencia;
      atualizacoes[`${ano}/${mes}/updatedBy`] = timestamp;

      console.log('Atualizacoes:', atualizacoes);

      firebaseDataBase.ref('acumulados').update(atualizacoes);
    
    })
    .catch(error => {
      console.log('Erro em pelo menos uma das requisicoes!:', error);
    });

});