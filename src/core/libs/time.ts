import * as moment from 'moment-timezone';
import { MomentInput as TimeInput } from 'moment';
import { ServerConfig } from 'src/core/config';

// no need to moment.tz.setDefault because it is already set in the server environment
const timezone = ServerConfig.get().TZ;
moment.tz.setDefault(timezone);

// @ts-ignore
moment.defaultFormat = 'YYYY-MM-DD HH:mm:ss';

export { moment as Time, TimeInput };
