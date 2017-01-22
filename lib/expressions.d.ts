import { Token, Type } from './tokens';
export interface Position {
    offsert: number;
    line: number;
    column: number;
}
export interface ExpressionPosition {
    start: Position;
    end: Position;
}
export declare abstract class Expression {
    readonly abstract nodeType: Token;
    toJSON(): {};
    static createPackage(position: ExpressionPosition, args: any[]): PackageExpression;
    static createImport(position: ExpressionPosition, args: any[]): ImportExpression;
    static createRecord(position: ExpressionPosition, args: any[]): RecordExpression;
    static createProperty(position: ExpressionPosition, args: any[]): PropertyExpression;
    static createType(position: ExpressionPosition, args: any[]): TypeExpression;
    static createRecordType(position: ExpressionPosition, args: any[]): RecordTypeExpression;
    static createOptionalType(position: ExpressionPosition, args: any[]): OptionalTypeExpression;
    static createImportType(position: ExpressionPosition, args: any[]): ImportTypeExpression;
    static createRepeatedType(position: ExpressionPosition, args: any[]): RepeatedTypeExpression;
    static createMapType(position: ExpressionPosition, args: any[]): MapTypeExpression;
    static createAnnotation(position: ExpressionPosition, args: any[]): AnnotationExpression;
    static createService(position: ExpressionPosition, args: any[]): ServiceExpression;
    static createMethod(position: ExpressionPosition, args: any[]): MethodExpression;
}
export declare class PackageExpression extends Expression {
    position: ExpressionPosition;
    name: string;
    children: Expression[];
    nodeType: Token;
    imports: ImportedPackageExpression[];
    constructor(position: ExpressionPosition, name: string, children: Expression[]);
}
export declare class ImportedPackageExpression extends PackageExpression {
    fileName: string;
}
export declare class ImportExpression extends Expression {
    position: ExpressionPosition;
    path: string;
    nodeType: Token;
    constructor(position: ExpressionPosition, path: string);
}
export declare abstract class AnnotatedExpression extends Expression {
    annotations: AnnotationExpression[];
    abstract nodeType: Token;
    constructor(annotations: AnnotationExpression[]);
    get(name: string): string;
}
export declare class RecordExpression extends AnnotatedExpression {
    position: ExpressionPosition;
    name: string;
    properties: PropertyExpression[];
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string, annotations: AnnotationExpression[], properties: PropertyExpression[]);
}
export declare class PropertyExpression extends AnnotatedExpression {
    position: ExpressionPosition;
    name: string;
    type: Expression;
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string, annotations: AnnotationExpression[], type: Expression);
}
export declare class TypeExpression extends Expression {
    position: ExpressionPosition;
    type: Type;
    nodeType: Token;
    constructor(position: ExpressionPosition, type: Type);
}
export declare class RecordTypeExpression extends Expression {
    position: ExpressionPosition;
    name: string;
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string);
}
export declare class OptionalTypeExpression extends Expression {
    position: ExpressionPosition;
    type: Expression;
    nodeType: Token;
    constructor(position: ExpressionPosition, type: Expression);
}
export declare class ImportTypeExpression extends Expression {
    position: ExpressionPosition;
    packageName: string;
    name: string;
    nodeType: Token;
    constructor(position: ExpressionPosition, packageName: string, name: string);
}
export declare class RepeatedTypeExpression extends Expression {
    position: ExpressionPosition;
    type: Expression;
    nodeType: Token;
    constructor(position: ExpressionPosition, type: Expression);
}
export declare class MapTypeExpression extends Expression {
    position: ExpressionPosition;
    key: Expression;
    value: Expression;
    nodeType: Token;
    constructor(position: ExpressionPosition, key: Expression, value: Expression);
}
export declare class AnnotationExpression extends Expression {
    position: ExpressionPosition;
    name: string;
    args: any;
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string, args: any);
}
export declare class MethodExpression extends AnnotatedExpression {
    position: ExpressionPosition;
    name: string;
    parameter: Expression;
    returns: Expression;
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string, annotations: AnnotationExpression[], parameter: Expression, returns: Expression);
}
export declare class ServiceExpression extends AnnotatedExpression {
    position: ExpressionPosition;
    name: string;
    annotations: AnnotationExpression[];
    methods: MethodExpression[];
    nodeType: Token;
    constructor(position: ExpressionPosition, name: string, annotations: AnnotationExpression[], methods: MethodExpression[]);
}
export declare function createExpression(type: Token, position: ExpressionPosition, ...args: any[]): Expression;
