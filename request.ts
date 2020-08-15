import request = require("request")
function requestCommon(method: Function, opt: any, statusCode: number) {
    return new Promise<string>((resolve, reject) => {
        method(opt, function (error: any, response: any, body: any) {
            if (error)
                return reject(error)

            if (response.statusCode !== statusCode)
                return reject("bad code " + response.statusCode)

            resolve(body)
        })
    })
}

export function getAsync(opt: any, statusCode = 200): Promise<string> {
    return requestCommon(request, opt, statusCode)
}

export function patchAsync(opt: any, statusCode = 200): Promise<string> {
    return requestCommon(request.patch, opt, statusCode)
}

export function postAsync(opt: any, statusCode = 200): Promise<string> {
    return requestCommon(request.post, opt, statusCode)
}
