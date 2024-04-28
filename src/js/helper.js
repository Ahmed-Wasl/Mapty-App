import * as config from './config';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

const AJAX = async function (postion) {
  try {
    const fetchPro = fetch(`${config.API_URL}@${postion}`);
    


  } catch (error) {
    
  };
};