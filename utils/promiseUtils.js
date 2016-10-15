module.exports.defer = function() {
    return new Deferred();
}

function Deferred() {
    var self = this;
    this.hasCanceled_ = false
    this.promise = new Promise(function(resolve, reject) {
        self.resolve = function(val) {
            self.hasCanceled_ ? reject({isCanceled: true}) : resolve(val)
        }
        self.reject = reject
    })

    this.cancel = function() {
        this.hasCanceled_ = true
    }
}
