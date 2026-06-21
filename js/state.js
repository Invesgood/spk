let state = {
  method: 'saw',
  name: '',
  desc: '',
  nC: 4,
  nA: 4,
  criteria: [],
  alternatives: [],
  matrix: []
};

let currentStep = 1;

const METHODS = {
  saw: {
    name: 'SAW',
    full: 'Simple Additive Weighting',
    icon: '📊',
    color: 'yellow',
    desc: 'Metode penjumlahan terbobot. Cepat dan mudah dipahami.',
    tag: 'PEMULA'
  }
};
