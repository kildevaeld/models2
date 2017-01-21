"use strict";
const _ = require("lodash");
var NodeType;
(function (NodeType) {
    NodeType[NodeType["Argument"] = 1] = "Argument";
    NodeType[NodeType["PrimitiveType"] = 2] = "PrimitiveType";
    NodeType[NodeType["ArrayType"] = 3] = "ArrayType";
    NodeType[NodeType["ObjectType"] = 4] = "ObjectType";
    NodeType[NodeType["TypedObjectType"] = 5] = "TypedObjectType";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
var PrimitiveType;
(function (PrimitiveType) {
    PrimitiveType[PrimitiveType["String"] = 1] = "String";
    PrimitiveType[PrimitiveType["Number"] = 2] = "Number";
    PrimitiveType[PrimitiveType["Boolean"] = 3] = "Boolean";
})(PrimitiveType = exports.PrimitiveType || (exports.PrimitiveType = {}));
class Expression {
    toJSON() {
        return _.omit(this, 'location');
    }
    static createArgument(location, args) {
        return new ArgumentExpression(location, args[0]);
    }
    static createPrimitive(location, args) {
        return new PrimitiveTypeExpression(location, args[0]);
    }
    static createArray(location, args) {
        return new ArrayTypeExpression(location, args);
    }
    static createObject(location, args) {
        return new ObjectTypeExpression(location, args[0]);
    }
    static createTypedObject(location, args) {
        return new TypedObjectTypeExpression(location, args[0]);
    }
}
exports.Expression = Expression;
class ArgumentExpression extends Expression {
    constructor(location, types) {
        super();
        this.location = location;
        this.types = types;
        this.nodeType = NodeType.Argument;
    }
}
exports.ArgumentExpression = ArgumentExpression;
class PrimitiveTypeExpression extends Expression {
    constructor(location, type) {
        super();
        this.location = location;
        this.type = type;
        this.nodeType = NodeType.PrimitiveType;
    }
}
exports.PrimitiveTypeExpression = PrimitiveTypeExpression;
class ArrayTypeExpression extends Expression {
    constructor(location, types) {
        super();
        this.location = location;
        this.types = types;
        this.nodeType = NodeType.ArrayType;
    }
}
exports.ArrayTypeExpression = ArrayTypeExpression;
class ObjectTypeExpression extends Expression {
    constructor(location, types) {
        super();
        this.location = location;
        this.types = types;
        this.nodeType = NodeType.ObjectType;
    }
}
exports.ObjectTypeExpression = ObjectTypeExpression;
class TypedObjectTypeExpression extends Expression {
    constructor(location, properties) {
        super();
        this.location = location;
        this.properties = properties;
        this.nodeType = NodeType.TypedObjectType;
    }
}
exports.TypedObjectTypeExpression = TypedObjectTypeExpression;
function createExpression(type, location, ...args) {
    switch (type) {
        case NodeType.Argument: return Expression.createArgument(location, args);
        case NodeType.PrimitiveType: return Expression.createPrimitive(location, args);
        case NodeType.ObjectType: return Expression.createObject(location, args);
        case NodeType.TypedObjectType: return Expression.createTypedObject(location, args);
        case NodeType.ArrayType: return Expression.createArray(location, args);
    }
}
exports.createExpression = createExpression;
