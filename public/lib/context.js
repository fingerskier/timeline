let prefix = 'context'


const validator = {
  apply: function(target, thisArg, argumentsList) {
    return thisArg[target].apply(this, argumentList);
  },
  
  set: (obj, prop, value) => {
    localStorage.setItem(`${prefix}.${prop}`, JSON.stringify(value))
    
    return true
  },


  get: (obj, prop) => {
    if ((typeof obj[prop] === 'object') && (obj[prop] !== null)) {
      return new Proxy(obj[prop], validator)
    } else {
      return JSON.parse(localStorage.getItem(`${prefix}.${prop}`))
    }
  },
}


const context = new Proxy({}, validator)


function _default(key, val) {
  if (!context[key]) context[key] = val
}


export {context, _default}