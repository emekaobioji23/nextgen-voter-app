/*
the QueryMethod constructor receives a model.method() result and a request.query paramter list
of format sort=username,email,createdDate&...
it can sort(), limit, paginate and filter the model.method() result because all 
model.mehtod() results support all those 
*/
const Econsole = require("../utils/econsole-log");
class QueryMethod {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    sort() {
        const myconsole = new Econsole("query.js", "QueryMethod", "sort()");
        myconsole.log("entry","this.queryString.sort=", this.queryString.sort);
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            console.log("sortBy=", sortBy);
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort("-createdAt");
        }
        myconsole.log("exit");
        return this;
    }

    limit() {
        const myconsole = new Econsole("query.js", "QueryMethod", "limit()");
        myconsole.log("entry","this.queryString.fields=", this.queryString.fields);
        if (this.queryString.fields) {
            const requestedFields = this.queryString.fields.split(",").join(" ");
            console.log("requestedFields=", requestedFields);
            this.query = this.query.select(requestedFields);
        } else {
            this.query = this.query.select("-__v");
        }
        myconsole.log("exit");
        return this;
    }

    paginate() {
        const myconsole = new Econsole("query.js", "QueryMethod", "paginate()");
        myconsole.log("entry","this.queryString.page=", this.queryString.page);
        console.log("this.queryString.limit=", this.queryString.limit);
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        myconsole.log("exit");
        return this;
    }

    filter() {
        const myconsole = new Econsole("query.js", "QueryMethod", "filter()");
        myconsole.log("entry","this.queryString", { ...this.queryString });
        const queryObj = { ...this.queryString };
        console.log("queryObj", queryObj);
        const exclude = ["page", "limit", "fields", "sort"];
        exclude.forEach((element) => delete queryObj[element]);
        let queryStr = JSON.stringify(queryObj);
        console.log("queryStr", queryStr);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        console.log("queryStr", queryStr);
        myconsole.log("exit");
        return this;
    }
}

module.exports = QueryMethod;
