import { Injectable } from '@nestjs/common';
import { differenceInYears } from 'date-fns';
import {
  aciertaPlus,
  between500and649,
  between650and749,
  borrowingCapacity,
  cellphoneSavingsAccountsCreditExperience,
  coSignerCreditExperience,
  creditDefaults,
  creditExperience,
  differentQualificationAB,
  less500,
  more750,
  noBorrowingCapacity,
  noCreditDefaults,
  noCreditExperience,
  noQualification,
  policyResponses,
  qualification,
  qualificationAB,
  type047,
  type13,
  withBorrowingCapacity,
  withCreditDefaults,
  withCreditExperience,
  withHistoricalCreditDefaults,
} from './constants';
import { DecisionEngineDto } from './request.dto';
import { ReviewService } from './review.service';

@Injectable()
export class AppService {
  constructor(private reviewService: ReviewService) {}

  async decisionEngine(decisionEngineDto: DecisionEngineDto) {
    const creditHistory = await this.reviewService.getCreditHistory(
      decisionEngineDto.firstLastname,
      decisionEngineDto.identification,
    );
    const responses = [
      this.creditExperience(creditHistory),
      this.aciertaPlus(creditHistory),
      this.qualification(creditHistory),
      this.creditDefault(creditHistory),
      this.indebtednessCapacity(
        creditHistory,
        decisionEngineDto.requestAmount,
        decisionEngineDto.interestRate,
        decisionEngineDto.term,
        decisionEngineDto.income,
      ),
    ];
    let score = responses.reduce((valorAnterior, valorActual) => {
      return valorAnterior + valorActual.value;
    }, 0);
    score = parseFloat(score.toFixed(1));
    const policyResponse = policyResponses.find(
      (pr) =>
        (pr.minScore ? pr.minScore <= score : true) &&
        (pr.maxScore ? pr.maxScore >= score : true),
    );
    const projections = this.getProjections(
      creditHistory,
      decisionEngineDto.income,
      decisionEngineDto.interestRate,
    );
    return {
      indent: policyResponse.ident,
      name: policyResponse.name,
      responses,
      projections,
      score,
    };
  }

  private getProjections(creditHistory, income, interestRate) {
    const paymentFees = this.reviewService.getPaymentFees(creditHistory);
    const incomeCreditHistory = parseFloat(
      this.reviewService.getPersonalizedAnswer(
        creditHistory,
        'QUANTO3_MEDIO',
      )[0],
    );
    const amountAvailable = this.getAmountAvalaible(
      income,
      paymentFees,
      incomeCreditHistory,
      {},
    );
    return [6, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120].map((term) => ({
      amount: this.getMaxAmount(amountAvailable, interestRate, term),
      term,
    }));
  }

  private creditExperience(creditHistory) {
    let characteristic;
    const acierta = this.reviewService.getPersonalizedAnswer(
      creditHistory,
      'ACIERTA_MAS',
    )[0];
    switch (acierta) {
      case '0':
        characteristic = noCreditExperience;
        break;
      case '4':
        characteristic = coSignerCreditExperience;
        break;
      case '7':
        characteristic = cellphoneSavingsAccountsCreditExperience;
        break;
      default:
        if (creditHistory?.Informes?.Informe?.InfoAgregada) {
          let infoAgregada = creditHistory.Informes.Informe.InfoAgregada;
          let principales = infoAgregada.Resumen.Principales;
          let antiguedadDesde = principales.antiguedadDesde
            ? new Date(principales.antiguedadDesde)
            : new Date();
          let yearsDiff = differenceInYears(new Date(), antiguedadDesde);
          characteristic =
            yearsDiff > 1 ? withCreditExperience : noCreditExperience;
        } else {
          characteristic = noCreditExperience;
        }
        break;
    }
    return {
      type: 'Experiencia crediticia',
      response: characteristic,
      value: (characteristic.score * creditExperience.weight) / 100,
      origin: 'Datacredito',
    };
  }

  private aciertaPlus(creditHistory) {
    let characteristic;
    let acierta = this.reviewService.getPersonalizedAnswer(
      creditHistory,
      'ACIERTA_MAS',
    )[0];
    acierta = acierta ? parseInt(acierta) : 0;
    if ([0, 4, 7].includes(acierta)) {
      characteristic = type047;
    } else if ([1, 3].includes(acierta)) {
      characteristic = type13;
    } else if (acierta >= 750) {
      characteristic = more750;
    } else if (acierta >= 650 && acierta < 750) {
      characteristic = between650and749;
    } else if (acierta >= 500 && acierta < 650) {
      characteristic = between500and649;
    } else if (acierta < 500) {
      characteristic = less500;
    }
    return {
      type: 'Acierta +',
      response: characteristic,
      value: (characteristic.score * aciertaPlus.weight) / 100,
      notes: [
        {
          name: 'Score',
          description: acierta,
        },
      ],
      origin: 'Datacredito',
    };
  }

  private qualification(creditHistory) {
    let characteristic;
    let infoAgregada = creditHistory.Informes.Informe.InfoAgregada;
    let trimestres = infoAgregada
      ? infoAgregada.EvolucionDeuda.Trimestre
        ? infoAgregada.EvolucionDeuda.Trimestre
        : []
      : [];
    let creditHistoryQualification =
      trimestres.length > 0 ? trimestres[0].calificacion : '-';
    if (creditHistoryQualification == '-') {
      characteristic = noQualification;
    } else if (['AA', 'A', 'B'].includes(creditHistoryQualification)) {
      characteristic = qualificationAB;
    } else {
      characteristic = differentQualificationAB;
    }
    return {
      type: 'Calificación',
      response: characteristic,
      value: (characteristic.score * qualification.weight) / 100,
      notes: [
        {
          name: 'Calificación',
          description: creditHistoryQualification,
        },
      ],
      origin: 'Datacredito',
    };
  }

  private creditDefault(creditHistory) {
    let characteristic;
    let creditDefaultToday = 0;
    let creditDefaultHistoric = 0;
    if (creditHistory?.Informes?.Informe?.InfoAgregada) {
      const infoAgregada = creditHistory.Informes.Informe.InfoAgregada;
      if (infoAgregada?.Resumen?.Principales) {
        const principales = infoAgregada.Resumen.Principales;
        creditDefaultToday = principales.creditosActualesNegativos;
        creditDefaultHistoric = principales.histNegUlt12Meses;
      }
    }
    if (creditDefaultToday) {
      characteristic = withCreditDefaults;
    } else if (creditDefaultHistoric) {
      characteristic = withHistoricalCreditDefaults;
    } else {
      characteristic = noCreditDefaults;
    }
    return {
      type: 'Moras',
      response: characteristic,
      origin: 'Datacredito',
      value: (characteristic.score * creditDefaults.weight) / 100,
      notes: [
        { name: 'Moras Historicas', description: creditDefaultHistoric },
        {
          name: 'Moras Actuales',
          description: creditDefaultToday,
        },
      ],
    };
  }

  private indebtednessCapacity(
    creditHistory,
    requestAmount,
    interestRate,
    term,
    income,
  ) {
    const paymentFees = this.reviewService.getPaymentFees(creditHistory);
    const incomeCreditHistory = parseFloat(
      this.reviewService.getPersonalizedAnswer(
        creditHistory,
        'QUANTO3_MEDIO',
      )[0],
    );
    const decisionEngineResponse: any = {
      type: 'Capacidad',
      notes: [
        {
          name: 'Cuotas financieras',
          description: paymentFees,
        },
        {
          name: 'Quanto Medio',
          description: incomeCreditHistory,
        },
      ],
    };
    const amountAvailable = this.getAmountAvalaible(
      income,
      paymentFees,
      incomeCreditHistory,
      decisionEngineResponse,
    );
    const cfs = this.getCfs(requestAmount, interestRate, term);
    const characteristic =
      cfs >= amountAvailable ? withBorrowingCapacity : noBorrowingCapacity;
    decisionEngineResponse.response = characteristic;
    decisionEngineResponse.value =
      (characteristic.score * borrowingCapacity.weight) / 100;
    return decisionEngineResponse;
  }

  private getCfs(amount, interestPorcent, term) {
    const interest = interestPorcent / 100;
    const cfs = amount / term + amount * interest;
    return cfs;
  }

  private getMaxAmount(cfs, interestPorcent, term) {
    const interest = interestPorcent / 100;
    const maxAmount = (cfs * term) / (term * interest + 1);
    return Math.floor(maxAmount);
  }

  private getAmountAvalaible(
    formIncome,
    paymentFees,
    incomeCreditHistory,
    decisionEngineResponse,
  ) {
    let amountAvailable = 0;
    let income = formIncome;
    const porcentAvailable = 0.85;
    if (formIncome > incomeCreditHistory) {
      income = incomeCreditHistory;
      decisionEngineResponse.origin = 'Datacredito';
    } else {
      income = formIncome;
      decisionEngineResponse.origin = 'Formulario';
    }
    amountAvailable = (income - income * 0.3 - paymentFees) * porcentAvailable;
    return amountAvailable;
  }
}
