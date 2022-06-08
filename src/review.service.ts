import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ReviewService {
  private readonly keyAppDataCreditoHC =
    '$2a$12$QMiUam/GWO6sgF7/cMvpW.YUWo8gCBk7j4twg8RyWfQ47sd8S4iGq';
  private readonly uniqueCode = process.env.UNIQUE_CODE_SERVICIOSREVIEW;
  private readonly baseUrl = process.env.URL_SERVICIOSREVIEW;
  private readonly keyUser = process.env.KEY_USER_SERVICIOSREVIEW;
  private readonly keyPassword = process.env.KEY_PASSWORD_SERVICIOSREVIEW;

  constructor(private httpService: HttpService) {}

  async getCreditHistory(
    firstLastname: string,
    identification: string,
    idType = 'cc',
  ) {
    try {
      const {
        data: { token },
      } = await this.login();
      const getCreditHistory$ = this.httpService.post(
        `${this.baseUrl}/consumeService`,
        {
          firstLastname,
          identification,
          keyApp: this.keyAppDataCreditoHC,
          uniqueCode: this.uniqueCode,
          idType,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const response = await lastValueFrom(getCreditHistory$);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getPersonalizedAnswer(creditHistory, keyword) {
    if (creditHistory?.Informes?.Informe?.RespuestaPersonalizada) {
      const personalizedAnswer =
        creditHistory.Informes.Informe.RespuestaPersonalizada.Linea ?? [];
      const linea = personalizedAnswer.filter(({ content }) =>
        content.includes(keyword),
      );
      if (linea) {
        const answers = linea.map(({ content }) => {
          const answer = content.split('[').join('').split(']');
          const i = answer.findIndex((content) => content.includes(keyword));
          return answer[i + 1];
        });
        return answers;
      }
    }
    return [];
  }

  getPaymentFees(creditHistory) {
    if (creditHistory?.Informes?.Informe?.InfoAgregada) {
      const infoAgregada = creditHistory.Informes.Informe.InfoAgregada;
      if (infoAgregada?.Totales?.Total) {
        const totals = infoAgregada.Totales.Total;
        const paymentFees = totals.reduce(function (
          valorAnterior,
          valorActual,
        ) {
          if (valorActual.calidadDeudor === 'Principal') {
            return valorAnterior + parseFloat(valorActual.cuota);
          }
          return valorAnterior;
        },
        0.0);
        return paymentFees * 1000;
      }
    }
    return 0;
  }

  private async login() {
    const login$ = this.httpService.post(`${this.baseUrl}/login`, {
      key_user: this.keyUser,
      key_password: this.keyPassword,
    });
    return await lastValueFrom(login$);
  }
}
