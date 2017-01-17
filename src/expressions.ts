
import { Token, Type } from './tokens'


export interface Position {
    offsert: number;
    line: number;
    column: number;
}

export interface ExpressionPosition {
    start: Position;
    end: Position
}

export interface Expression {
    readonly nodeType: Token
}

export class PackageExpression implements Expression {
    nodeType = Token.Package;
    constructor(public name: string, public position: ExpressionPosition, public children: Expression[]) { }
}

export class ImportExpression implements Expression {
    nodeType = Token.Import;
}

export class RecordExpression implements Expression {
    nodeType = Token.Record;
    constructor(public name: string, public position: ExpressionPosition, public children: Expression[]) {

    }
}

export class PropertyExpression implements Expression {
    nodeType = Token.Property;
    constructor(public name: string, public position: ExpressionPosition, public children: Expression[]) {

    }
}

export class TypeExpression implements Expression {
    nodeType = Token.BuildinType;
    constructor(public type: Type) { }
}

export class OptionalTypeExpression implements Expression {
    nodeType = Token.OptionalType;
    constructor(public type: Type) { }
}

export class AnnotationExpression implements Expression {
    nodeType = Token.Annotation;
    constructor(public name: string) { }
}