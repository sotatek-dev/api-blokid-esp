import { Injectable } from '@nestjs/common';
import { default as PDLJS } from 'peopledatalabs';
import {
  PersonEnrichmentParams,
  PersonEnrichmentResponse,
} from 'peopledatalabs/dist/types/enrichment-types';
import { ServerConfig } from 'server-config/index';
import { ERROR_RESPONSE } from 'src/common/const';
import { ServerException } from 'src/exceptions';

@Injectable()
export class PeopleDataLabService extends PDLJS {
  constructor() {
    super({ apiKey: ServerConfig.get().PEOPLE_DATA_LAB_API_KEY });
  }

  async bulkPersonEnrichment(
    params: PersonEnrichmentParams[],
  ): Promise<PersonEnrichmentResponse[]> {
    const metadata = {};

    const requests = params.map((param) => ({
      metadata,
      params: param,
    }));

    const bulk = await this.person.bulk.enrichment({ requests }).catch((error) => {
      throw new ServerException({
        ...ERROR_RESPONSE.INTEGRATION_SERVICE_ERROR,
        details: { error },
      });
    });

    return bulk.items;
  }
}
