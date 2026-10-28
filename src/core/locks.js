const fileLocks = {}

const esperar = async (tempo) => new Promise(resolve => setTimeout(resolve, tempo))

async function acquireLock(key) {
    while (fileLocks[key]) {
        await esperar(10)
    }
    fileLocks[key] = true
}

function releaseLock(key) {
    delete fileLocks[key]
}

module.exports = {
    acquireLock,
    releaseLock,
    fileLocks
}

