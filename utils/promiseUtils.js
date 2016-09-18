module.exports.defer = function() {
    return new Deferred();
}

function Deferred() {
    this.hasCanceled_ = false
    this.promise = new Promise(function(resolve, reject) {
        this.resolve = function(val) {
            this.hasCanceled_ ? reject({isCanceled: true}) : resolve(val)
        }
        this.reject = reject
    })

    this.cancel = function() {
        this.hasCanceled_ = true
    }
}
