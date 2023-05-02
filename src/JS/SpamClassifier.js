
function count(array, item) {
  return array.filter((currentItem) => currentItem == item).length;
};

function getVocab(D) {
  const V = new Set()
  D.forEach(d => {
    d.test_text.toLowerCase().split(" ").forEach(word => {
      V.add(word)
    })
  })
  return V
}


function train_bayes(D,C) {
  const Ndoc = D.length
  const Nc = {0: 0, 1: 0}
  const V = getVocab(D)
  const bigDoc = {}
  const logLikelihood = {}
  D.forEach(d => {
      Nc[d.class] +=1
  })




  const logPrior = {}
  C.forEach(c => {
    logPrior[c.val] = Math.log(Nc[c.val]/Ndoc)
    bigDoc[c.val] = []
  });


  D.forEach(d => {
    d.test_text.toLowerCase().split(" ").forEach(word => {
      bigDoc[d.class].push(word)
    })
  })



  
  V.forEach(word => {
    // We have to use +1 smoothing since log(0) = undefined
    C.forEach(c => {
    logLikelihood[word] = {...logLikelihood[word],[c.val] : 
      Math.log((count(bigDoc[c.val],word)+1)/(bigDoc[c.val].length+V.size))}
    })
    
  })
  
  
  return {logLikelihood, logPrior, V}

}

function test_bayes(testDoc,logPrior,logLikelihood,C,V) {
  const sum = []
  C.forEach(c => {
    sum[c.val] = logPrior[c.val]
    testDoc.test_text.toLowerCase().split(" ").forEach(word => {
      if(V.has(word)) {
        sum[c.val] += logLikelihood[word][c.val]
      }
    })
  })


  return softmax(sum)
  
}

function softmax(arr) {
  return arr.map(function(value,index) { 
    return Math.exp(value) / arr.map( function(y /*value*/){ return Math.exp(y) } ).reduce( function(a,b){ return a+b })
  })
}


export function run_bayes(training,test) {
  if(training[0] == null) {
    return null
  }
  const classes = [{name: 'positive', val: 1},{name: 'negative', val: 0}]
  
  const { logLikelihood, logPrior, V } = train_bayes(training,classes)
  
  const probability =  test_bayes(test, logPrior, logLikelihood, classes, V)

  Object.keys(logLikelihood).forEach(word => {
    const values = softmax(Object.values(logLikelihood[word]))
    logLikelihood[word]['0'] = values[0]
    logLikelihood[word]['1'] = values[1]
  })

  console.log(probability)

  return {probability,logLikelihood}
  
}



