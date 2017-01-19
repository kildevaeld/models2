
import { Token, Type } from './tokens'
import * as _ from 'lodash';

export interface Position {
    offsert: number;
    line: number;
    column: number;
}

export interface ExpressionPosition {
    start: Position;
    end: Position
}

export abstract class Expression {
    abstract readonly nodeType: Token

    toJSON() {
        return _.omit(this, 'position')
    }

    static createPackage(position: ExpressionPosition, args: any[]) {
        return new PackageExpression(position, args[0], args[1]);
    }

    static createImport(position: ExpressionPosition, args: any[]) {
        return new ImportExpression(position, args[0]);
    }

    static createRecord(position: ExpressionPosition, args: any[]) {
        return new RecordExpression(position, args[0], args[1], args[2]);
    }

    static createProperty(position: ExpressionPosition, args: any[]) {

        return new PropertyExpression(position, args[0], args[1], args[2]);
    }

    static createType(position: ExpressionPosition, args: any[]) {
        return new TypeExpression(position, args[0]);
    }

    static createOptionalType(position: ExpressionPosition, args: any[]) {

        return new OptionalTypeExpression(position, args[0]);
    }

    static createImportType(position: ExpressionPosition, args: any[]) {
        return new ImportTypeExpression(position, args[0], args[1]);
    }

    static createRepeatedType(position: ExpressionPosition, args: any[]) {
        return new RepeatedTypeExpression(position, args[0]);
    }

    static createMapType(position: ExpressionPosition, args: any[]) {
        return new MapTypeExpression(position, args[0], args[1]);
    }

    static createAnnotation(position: ExpressionPosition, args: any[]) {
        return new AnnotationExpression(position, args[0], args[1]);
    }
}

export class PackageExpression extends Expression {
    nodeType = Token.Package;
    imports: PackageExpression[];
    constructor(public position: ExpressionPosition, public name: string, public children: Expression[]) {
        super();
    }

}

export class ImportExpression extends Expression {
    nodeType = Token.Import;

    constructor(public position: ExpressionPosition, public path: string) {
        super();
    }
}

export class RecordExpression extends Expression {
    nodeType = Token.Record;
    constructor(public position: ExpressionPosition, public name: string, public annotations: AnnotationExpression[], public properties: PropertyExpression[]) {
        super();

    }
}

export class PropertyExpression extends Expression {
    nodeType = Token.Property;
    constructor(public position: ExpressionPosition, public name: string, public annotations: AnnotationExpression[], public type: Expression) {
        super();
    }

}

export class TypeExpression extends Expression {
    nodeType = Token.PrimitiveType;
    constructor(public position: ExpressionPosition, public type: Type) {
        super();
    }
}

export class OptionalTypeExpression extends Expression {
    nodeType = Token.OptionalType;
    constructor(public position: ExpressionPosition, public type: Expression) {
        super();
    }
}

export class ImportTypeExpression extends Expression {
    nodeType = Token.ImportType;
    constructor(public position: ExpressionPosition, public packageName: string, public name: string) {
        super();
    }
}

export class RepeatedTypeExpression extends Expression {
    nodeType = Token.RepeatedType;
    constructor(public position: ExpressionPosition, public type: Expression) {
        super();
    }
}

export class MapTypeExpression extends Expression {
    nodeType = Token.MapType;
    constructor(public position: ExpressionPosition, public key: Expression, public value: Expression) {
        super();
    }
}

export class AnnotationExpression extends Expression {
    nodeType = Token.Annotation;
    constructor(public position: ExpressionPosition, public name: string, public args: any) {
        super();
    }
}

export function createExpression(type: Token, position: ExpressionPosition, ...args): Expression {
    switch (type) {
        case Token.Package: return Expression.createPackage(position, args)
        case Token.Import: return Expression.createImport(position, args);
        case Token.Record: return Expression.createRecord(position, args);
        case Token.Property: return Expression.createProperty(position, args);
        case Token.PrimitiveType: return Expression.createType(position, args);
        case Token.OptionalType: return Expression.createOptionalType(position, args);
        case Token.ImportType: return Expression.createImportType(position, args);
        case Token.RepeatedType: return Expression.createRepeatedType(position, args);
        case Token.MapType: return Expression.createMapType(position, args);
        case Token.Annotation: return Expression.createAnnotation(position, args);
    }
}
