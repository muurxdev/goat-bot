function validateNumber(input, min = 0, max = Infinity) {
    const num = parseInt(input)
    if (isNaN(num) || num < min || num > max) {
        return null
    }
    return num
}

function validateString(input, maxLength = 100, allowedChars = null) {
    if (!input || typeof input !== 'string' || input.length > maxLength) return null
    if (allowedChars && !new RegExp(`^[${allowedChars}]+$`).test(input)) return null
    return input
}

function validateMathExpression(expr) {
    if (!expr || typeof expr !== 'string') return null
    if (!/^[0-9+\-*/().^%\s]+$/.test(expr)) return null
    return expr
}

function validateUrl(url) {
    try {
        new URL(url)
        return url
    } catch {
        return null
    }
}

module.exports = {
    validateNumber,
    validateString,
    validateMathExpression,
    validateUrl
}

