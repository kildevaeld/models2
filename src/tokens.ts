
export enum Token {
    Package = 1, Record, Property, Import, ImportType, PrimitiveType,
    OptionalType, RepeatedType, MapType, Annotation
}

export enum Modifier {
    Optional, Repeated, Annotation
}

export enum Type {
    String = 1, Date,
    Int8, Int16, Int32, Int64, Double, Float, Uint8, Uint16, Uint32, Uint64,
    Boolean, Int, Uint, Bytes
}
