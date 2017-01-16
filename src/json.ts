
import { Item, BaseVisitor } from './visitor';

export class JsonVisitor extends BaseVisitor {

    /*visit(item: Item): any {
        switch (item[0]) {
            case Token.Package: return this.visitPackage(item);
            case Token.Record: return this.visitRecord(item);
            case Token.Property: return this.visitProperty(item);
            case Token.Annotation: return this.visitAnnotation(item);
        }
    }*/

    visitPackage(item: Item): any {
        console.log('visit package %s', item[1]);
        return {
            package: item[1],
            children: this.visit(item[2])
        }
    }
    visitRecord(item: Item): any {
        console.log('visit record %s', item[1]);
        return {
            type: 'model',
            props: this.visit(item[2])
        }
    }
    visitProperty(item: Item): any {
        console.log('visit property %s', item[1]);
        return {
            type: 'property',
            propertyType: item[2].type,
            name: item[1]
        }
    }
    visitAnnotation(item: Item): any {
        console.log('visit annotation', item[1]);
        return this.visit(item[2]);
    }

}