import winston from 'winston';
import AppConstants from './constants';

function initTransports(){
    const transports: any = [
        new winston.transports.Console()
    ];

    if(process.env.NODE_ENV === AppConstants.Environments.production){
        transports.push(
            new winston.transports.File({
                filename: AppConstants.Logging.outputs.error, 
                level: AppConstants.Logging.levels.error
            })
        );

        transports.push(new winston.transports.File({filename: AppConstants.Logging.outputs.error}));
    }
    return transports;
}

const logger = winston.createLogger({
    level: AppConstants.Logging.levels.info,
    format: winston.format.combine(
        winston.format.simple(),
        winston.format.colorize()
    ),
    transports: initTransports()
});

export default logger;