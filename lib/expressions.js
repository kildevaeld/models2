"use strict";
const tokens_1 = require("./tokens");
const _ = require("lodash");
class Expression {
    toJSON() {
        return _.omit(this, 'position');
    }
    static createPackage(position, args) {
        return new PackageExpression(position, args[0], args[1]);
    }
    static createImport(position, args) {
        return new ImportExpression(position, args[0]);
    }
    static createRecord(position, args) {
        return new RecordExpression(position, args[0], args[1], args[2]);
    }
    static createProperty(position, args) {
        return new PropertyExpression(position, args[0], args[1], args[2]);
    }
    static createType(position, args) {
        return new TypeExpression(position, args[0]);
    }
    static createOptionalType(position, args) {
        return new OptionalTypeExpression(position, args[0]);
    }
    static createImportType(position, args) {
        return new ImportTypeExpression(position, args[0], args[1]);
    }
    static createRepeatedType(position, args) {
        return new RepeatedTypeExpression(position, args[0]);
    }
    static createMapType(position, args) {
        return new MapTypeExpression(position, args[0], args[1]);
    }
    static createAnnotation(position, args) {
        return new AnnotationExpression(position, args[0], args[1]);
    }
}
exports.Expression = Expression;
class PackageExpression extends Expression {
    constructor(position, name, children) {
        super();
        this.position = position;
        this.name = name;
        this.children = children;
        this.nodeType = tokens_1.Token.Package;
    }
}
exports.PackageExpression = PackageExpression;
class ImportExpression extends Expression {
    constructor(position, path) {
        super();
        this.position = position;
        this.path = path;
        this.nodeType = tokens_1.Token.Import;
    }
}
exports.ImportExpression = ImportExpression;
class RecordExpression extends Expression {
    constructor(position, name, annotations, properties) {
        super();
        this.position = position;
        this.name = name;
        this.annotations = annotations;
        this.properties = properties;
        this.nodeType = tokens_1.Token.Record;
    }
}
exports.RecordExpression = RecordExpression;
class PropertyExpression extends Expression {
    constructor(position, name, annotations, type) {
        super();
        this.position = position;
        this.name = name;
        this.annotations = annotations;
        this.type = type;
        this.nodeType = tokens_1.Token.Property;
    }
}
exports.PropertyExpression = PropertyExpression;
class TypeExpression extends Expression {
    constructor(position, type) {
        super();
        this.position = position;
        this.type = type;
        this.nodeType = tokens_1.Token.PrimitiveType;
    }
}
exports.TypeExpression = TypeExpression;
class OptionalTypeExpression extends Expression {
    constructor(position, type) {
        super();
        this.position = position;
        this.type = type;
        this.nodeType = tokens_1.Token.OptionalType;
    }
}
exports.OptionalTypeExpression = OptionalTypeExpression;
class ImportTypeExpression extends Expression {
    constructor(position, packageName, name) {
        super();
        this.position = position;
        this.packageName = packageName;
        this.name = name;
        this.nodeType = tokens_1.Token.ImportType;
    }
}
exports.ImportTypeExpression = ImportTypeExpression;
class RepeatedTypeExpression extends Expression {
    constructor(position, type) {
        super();
        this.position = position;
        this.type = type;
        this.nodeType = tokens_1.Token.RepeatedType;
    }
}
exports.RepeatedTypeExpression = RepeatedTypeExpression;
class MapTypeExpression extends Expression {
    constructor(position, key, value) {
        super();
        this.position = position;
        this.key = key;
        this.value = value;
        this.nodeType = tokens_1.Token.MapType;
    }
}
exports.MapTypeExpression = MapTypeExpression;
class AnnotationExpression extends Expression {
    constructor(position, name, args) {
        super();
        this.position = position;
        this.name = name;
        this.args = args;
        this.nodeType = tokens_1.Token.Annotation;
    }
}
exports.AnnotationExpression = AnnotationExpression;
function createExpression(type, position, ...args) {
    switch (type) {
        case tokens_1.Token.Package: return Expression.createPackage(position, args);
        case tokens_1.Token.Import: return Expression.createImport(position, args);
        case tokens_1.Token.Record: return Expression.createRecord(position, args);
        case tokens_1.Token.Property: return Expression.createProperty(position, args);
        case tokens_1.Token.PrimitiveType: return Expression.createType(position, args);
        case tokens_1.Token.OptionalType: return Expression.createOptionalType(position, args);
        case tokens_1.Token.ImportType: return Expression.createImportType(position, args);
        case tokens_1.Token.RepeatedType: return Expression.createRepeatedType(position, args);
        case tokens_1.Token.MapType: return Expression.createMapType(position, args);
        case tokens_1.Token.Annotation: return Expression.createAnnotation(position, args);
    }
}
exports.createExpression = createExpression;
