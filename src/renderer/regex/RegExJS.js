const s = {};

s.match = (regex, str, callback, workerJs) => {
  let matches = [];
  let error = null;
  let match = null;
  let index = null;

  if (!regex) {
    callback(error, matches);
    return;
  }

  if (typeof Worker !== 'undefined' && workerJs) {
    if (s.worker) {
      clearTimeout(s.id);
      s.worker.terminate();
    }

    s.worker = new Worker(workerJs);

    s.worker.onmessage = (evt) => {
      // When the worker says its loaded start a timer. (For IE 10);
      if (evt.data == 'onload') {
        s.id = setTimeout(() => {
          callback('timeout', matches);
          s.worker.terminate();
        }, 250);
      } else {
        matches = evt.data.matches;
        error = evt.data.error;
        clearTimeout(s.id);
        callback(error, matches);
      }
    };
    s.worker.postMessage({ regex, str });
  } else {
    while (!error) {
      match = regex.exec(str);
      if (!match) {
        break;
      }
      if (regex.global && index === regex.lastIndex) {
        error = 'infinite';
        break;
      }
      match.num = matches.length;
      match.end = (index = match.index + match[0].length) - 1;
      match.input = null;
      matches.push(match);
      if (!regex.global) {
        break;
      } // or it will become infinite.
    }
    callback(error, matches);
  }
};

export default s;
