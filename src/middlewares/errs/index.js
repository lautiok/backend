import EErrors from "../../service/errs/enum.js";


export const errorHandler = (err, req, res, next) => {
    switch (err.code) {
        case EErrors.INVALID_TYPES_ERROR:
            res.status(400).json({status: 'error', error: err.name, message: err.message});
            break;
        default:
            res.status(500).json({status: 'error', error: 'error no definido'});
    }
}


