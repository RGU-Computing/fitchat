import GoogleFit, { Scopes } from 'react-native-google-fit'


export function authorize() {
  const options = {
    scopes: [
      Scopes.FITNESS_ACTIVITY_READ,
      Scopes.FITNESS_LOCATION_READ,
      Scopes.FITNESS_BODY_READ
    ]
  }

  /*GoogleFit.authorize(options)
    .then(() => callback())
    .catch(() => console.warn("AUTH_ERROR"))*/
    return new Promise((resolve, reject) => {
      GoogleFit.authorize(options)
        .then(() => resolve())
        .catch(() => reject())
    })
}

export function getPeriodStepCount(start, end) {
  const opt = { startDate: start, endDate: end }
  return new Promise((resolve, reject) => {
    GoogleFit.getDailyStepCountSamples(opt, (err, res) => {
      if(err) {
        reject(err)
      } else {
        resolve(res.filter(obj => obj.source === "com.google.android.gms:estimated_steps")[0].steps)
      }
    })
  })
}

export function getPeriodDistance(start, end) {
  const opt = { startDate: start, endDate: end }
  return new Promise((resolve, reject) => {
    GoogleFit.getDailyDistanceSamples(opt, (err, res) => {
      if(err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

export function getPeriodCalorie(start, end) {
  const opt = { startDate: start, endDate: end, basalCalculation: false }
  return new Promise((resolve, reject) => {
    GoogleFit.getDailyCalorieSamples(opt, (err, res) => {
      if(err) {
        reject(err)
      } else {
        resolve(res[0].calorie)
      }
    })
  })
}

export function getWeight() {
  const opt = {
    unit: "kg",
    startDate: "2017-01-01T00:00:17.971Z",
    endDate: new Date().toISOString(),
    ascending: false
  };
  return new Promise((resolve,reject) => {
    GoogleFit.getWeightSamples(opt, (err, res) => {
      if(err) {
        reject(err)
      } else {
        resolve(res[0] ? res.pop().value : null)
      }
    });
  })
}

export function getHeight() {
  const opt = {
    startDate: "2017-01-01T00:00:17.971Z",
    endDate: new Date().toISOString()
  };
  return new Promise((resolve,reject) => {
    GoogleFit.getHeightSamples(opt, (err, res) => {
      if(err) {
        reject(err)
      } else {
        resolve(res[0] ? res.pop().value : null)
      }
    });
  })
}
