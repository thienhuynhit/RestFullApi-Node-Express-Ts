"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class apiFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        const queryObj = Object.assign({}, this.queryString);
        const excludedString = ['sort', 'fields', 'page', 'limit'];
        excludedString.forEach((el) => {
            delete queryObj[el];
        });
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt|ne)\b/g, (match) => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            let sortBy = this.queryString.sort;
            sortBy = sortBy.split(',');
            sortBy = sortBy.join(' ');
            this.query = this.query.sort(sortBy);
        }
        else {
            this.query = this.query.sort('-createAt');
        }
        return this;
    }
    limit() {
        if (this.queryString.fields) {
            let fields = this.queryString.fields;
            fields = fields.split(',');
            fields = fields.join(' ');
            this.query = this.query.select(fields);
        }
        else {
            this.query = this.query.select('-__v');
        }
        return this;
    }
    paginate() {
        const page = +this.queryString.page || 1;
        const limit = +this.queryString.limit || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}
exports.default = apiFeatures;
//# sourceMappingURL=apiFeatures.js.map