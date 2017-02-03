
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

    toJSON(full: boolean = false) {
        if (full === true) return this;
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

    static createRecordType(position: ExpressionPosition, args: any[]) {
        return new RecordTypeExpression(position, args[0]);
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

    static createService(position: ExpressionPosition, args: any[]) {
        return new ServiceExpression(position, args[0], args[1], args[2]);
    }

    static createMethod(position: ExpressionPosition, args: any[]) {
        return new MethodExpression(position, args[0], args[1], args[2], args[3]);
    }

    static createAnonymousRecord(position: ExpressionPosition, args: any[]) {
        return new AnonymousRecordExpression(position, args[0]);
    }

    static createEnumType(position: ExpressionPosition, args: any[]) {
        return new EnumTypeExpression(position, args[0], args[1]);
    }

    static createEnumMember(position: ExpressionPosition, args: any[]) {
        return new EnumMemberExpression(position, args[0], args[1]);
    }
}

export class PackageExpression extends Expression {
    nodeType = Token.Package;
    imports: ImportedPackageExpression[];
    constructor(public position: ExpressionPosition, public name: string, public children: Expression[]) {
        super();
    }

}

export class ImportedPackageExpression extends PackageExpression {
    fileName: string;
}

export class ImportExpression extends Expression {
    nodeType = Token.Import;

    constructor(public position: ExpressionPosition, public path: string) {
        super();
    }
}

export abstract class AnnotatedExpression extends Expression {
    abstract nodeType: Token;
    constructor(public annotations: AnnotationExpression[]) {
        super();
    }

    public get(name: string): string
    public get<T>(name: string): T {
        let found = this.annotations.find(m => m.name === name)
        return found ? found.args : null;
    }
}

export class RecordExpression extends AnnotatedExpression {
    nodeType = Token.Record;
    constructor(public position: ExpressionPosition, public name: string, annotations: AnnotationExpression[], public properties: PropertyExpression[]) {
        super(annotations);

    }
}

export class PropertyExpression extends AnnotatedExpression {
    nodeType = Token.Property;
    constructor(public position: ExpressionPosition, public name: string, annotations: AnnotationExpression[], public type: Expression) {
        super(annotations);
    }

}

export class TypeExpression extends Expression {
    nodeType = Token.PrimitiveType;
    constructor(public position: ExpressionPosition, public type: Type) {
        super();
    }
}

export class RecordTypeExpression extends Expression {
    nodeType = Token.RecordType;
    constructor(public position: ExpressionPosition, public name: string) {
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

export class MethodExpression extends AnnotatedExpression {
    nodeType = Token.Method;
    constructor(public position: ExpressionPosition, public name: string, annotations: AnnotationExpression[], public parameter: Expression, public returns: Expression) {
        super(annotations);
    }
}

export class ServiceExpression extends AnnotatedExpression {
    nodeType = Token.Service;
    constructor(public position: ExpressionPosition, public name: string, public annotations: AnnotationExpression[], public methods: MethodExpression[]) {
        super(annotations);
    }
}

export class AnonymousRecordExpression extends Expression {
    nodeType = Token.AnonymousRecord;
    constructor(public position: ExpressionPosition, public properties: PropertyExpression[]) {
        super();
    }
}

export class EnumTypeExpression extends Expression {
    nodeType = Token.EnumType;
    constructor(public position: ExpressionPosition, public name: string, public members: EnumMemberExpression[]) {
        super();
    }
}

export class EnumMemberExpression extends Expression {
    nodeType = Token.EnumMember;
    constructor(public position: ExpressionPosition, public name: string, public value: number) {
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
        case Token.RecordType: return Expression.createRecordType(position, args);
        case Token.OptionalType: return Expression.createOptionalType(position, args);
        case Token.ImportType: return Expression.createImportType(position, args);
        case Token.RepeatedType: return Expression.createRepeatedType(position, args);
        case Token.MapType: return Expression.createMapType(position, args);
        case Token.Annotation: return Expression.createAnnotation(position, args);

        case Token.EnumType: return Expression.createEnumType(position, args);
        case Token.EnumMember: return Expression.createEnumMember(position, args);

        case Token.Service: return Expression.createService(position, args);
        case Token.Method: return Expression.createMethod(position, args);
        case Token.AnonymousRecord: return Expression.createAnonymousRecord(position, args);
    }
}
