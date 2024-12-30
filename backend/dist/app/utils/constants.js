"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppConstants {
}
AppConstants.Logging = {
    levels: {
        info: 'info',
        error: 'error',
        warning: 'warning'
    },
    outputs: {
        error: 'errors.log',
        combined: 'combined.log'
    }
};
AppConstants.Environments = {
    development: 'development',
    staging: 'staging',
    production: 'production'
};
exports.default = AppConstants;
//# sourceMappingURL=constants.js.map