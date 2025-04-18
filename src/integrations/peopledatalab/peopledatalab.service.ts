import * as PDLJS from 'peopledatalabs';
import { Injectable } from '@nestjs/common';
import {
  BulkPersonEnrichmentRequest,
  BulkPersonEnrichmentResponseItem,
} from 'peopledatalabs/dist/types/bulk-types';
import { PersonEnrichmentResponse } from 'peopledatalabs/dist/types/enrichment-types';
import { ServerConfig } from 'server-config/index';
import { ERROR_RESPONSE } from 'src/common/const';
import { ServerException } from 'src/exceptions';

@Injectable()
export class PeopleDataLabService extends PDLJS.default {
  constructor() {
    super({ apiKey: ServerConfig.get().PEOPLE_DATA_LAB_API_KEY });
  }

  async bulkPersonEnrichment(
    requests: BulkPersonEnrichmentRequest[],
  ): Promise<BulkPersonEnrichmentResponseItem[]> {
    const bulk = await this.person.bulk.enrichment({ requests }).catch((error) => {
      throw new ServerException({
        ...ERROR_RESPONSE.INTEGRATION_SERVICE_ERROR,
        details: { error },
      });
    });

    return bulk.items;
  }
}
