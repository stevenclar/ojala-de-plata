//#region credit experience
export const creditExperience = {
  ident: 'credit-experience',
  name: 'Experiencia Crediticia',
  weight: 8,
};

export const withCreditExperience = {
  ident: 'with-credit-experience',
  name: 'Con experiencia',
  score: 5,
};

export const cellphoneSavingsAccountsCreditExperience = {
  ident: 'cellphone-and/or-savings-accounts-credit-experience',
  name: 'Solo celulares y/o Cuenta de ahorro',
  score: 4,
};

export const noCreditExperience = {
  ident: 'no-credit-experience',
  name: 'Sin experiencia',
  score: 3,
};

export const coSignerCreditExperience = {
  ident: 'co-signer-credit-experience',
  name: 'Solo Como codeudor',
  score: 3,
};

export const reportedCreditExperience = {
  ident: 'reported-credit-experience',
  name: 'Reportado',
  score: 0,
};
//#endregion

//#region acierta
export const aciertaPlus = {
  ident: 'acierta-plus',
  name: 'Acierta +',
  weight: 43,
};

export const more750 = {
  ident: 'more-750',
  name: '> 750',
  score: 5,
};

export const between650and749 = {
  ident: 'between-650-and-749',
  name: 'Entre 650 y 749',
  score: 4,
};

export const between500and649 = {
  ident: 'between-500-and-649',
  name: 'Entre 500 y 649',
  score: 3,
};

export const type047 = {
  ident: 'type-0-4-7',
  name: 'Tipo 0, 4 y 7',
  score: 3,
};

export const less500 = {
  ident: 'less-500',
  name: '< 500',
  score: 1,
};

export const type13 = {
  ident: 'type-1-3',
  name: 'Tipo 1 y 3',
  score: 3,
};
//#endregion

//#region qualification
export const qualification = {
  ident: 'qualification',
  name: 'Calificación',
  weight: 15.5,
};

export const qualificationAB = {
  ident: 'qualification-A-B',
  name: 'Calificaciones A, B',
  score: 5,
};

export const differentQualificationAB = {
  ident: 'different-qualification-A-B',
  name: 'Calificaciones diferentes a A, B',
  score: 1,
};

export const noQualification = {
  ident: 'no-qualification',
  name: 'Sin calificar',
  score: 3,
};
//#endregion

//#region credit defaults
export const creditDefaults = {
  ident: 'credit-defaults',
  name: 'Moras',
  weight: 15.5,
};

export const noCreditDefaults = {
  ident: 'no-credit-defaults',
  name: 'Sin Moras',
  score: 5,
};

export const withHistoricalCreditDefaults = {
  ident: 'with-historical-credit-defaults',
  name: 'Moras Historicas',
  score: 2,
};

export const withCreditDefaults = {
  ident: 'with-credit-defaults',
  name: 'Moras actuales',
  score: 0,
};
//#endregion

//#region borrowing capacity
export const borrowingCapacity = {
  ident: 'borrowing-capacity',
  name: 'Capacidad de pago',
  weight: 18,
};

export const withBorrowingCapacity = {
  ident: 'with-borrowing-capacity',
  name: 'Con capacidad',
  score: 5,
};

export const noBorrowingCapacity = {
  ident: 'no-borrowing-capacity',
  name: 'Sin capacidad',
  score: 0,
};
//#endregion

export const policyResponses = [
  {
    ident: 'pre-approved',
    name: 'Pre aprobado',
    minScore: 4.5,
  },
  {
    ident: 'studing',
    name: 'Estudio',
    minScore: 3.5,
    maxScore: 4.49,
  },
  {
    ident: 'refused',
    name: 'Rechazado',
    maxScore: 3.49,
  },
];
