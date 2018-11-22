import firebase from 'firebase/app';
import 'firebase/database';

const config = {
  apiKey: "AIzaSyAB6PiaLu_fuNit09MTA-3l-Vtql0mawWo",
  authDomain: "tcc-energy-monitor.firebaseapp.com",
  databaseURL: "https://tcc-energy-monitor.firebaseio.com",
  projectId: "tcc-energy-monitor",
  storageBucket: "tcc-energy-monitor.appspot.com",
  messagingSenderId: "52839860893"
};

firebase.initializeApp(config);

const firebaseDataBase = firebase.database();

export {
  firebase,
  firebaseDataBase
};