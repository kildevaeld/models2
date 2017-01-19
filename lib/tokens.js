"use strict";
var Token;
(function (Token) {
    Token[Token["Package"] = 1] = "Package";
    Token[Token["Record"] = 2] = "Record";
    Token[Token["Property"] = 3] = "Property";
    Token[Token["Import"] = 4] = "Import";
    Token[Token["ImportType"] = 5] = "ImportType";
    Token[Token["PrimitiveType"] = 6] = "PrimitiveType";
    Token[Token["OptionalType"] = 7] = "OptionalType";
    Token[Token["RepeatedType"] = 8] = "RepeatedType";
    Token[Token["MapType"] = 9] = "MapType";
    Token[Token["Annotation"] = 10] = "Annotation";
})(Token = exports.Token || (exports.Token = {}));
var Modifier;
(function (Modifier) {
    Modifier[Modifier["Optional"] = 0] = "Optional";
    Modifier[Modifier["Repeated"] = 1] = "Repeated";
    Modifier[Modifier["Annotation"] = 2] = "Annotation";
})(Modifier = exports.Modifier || (exports.Modifier = {}));
var Type;
(function (Type) {
    Type[Type["String"] = 1] = "String";
    Type[Type["Date"] = 2] = "Date";
    Type[Type["Int8"] = 3] = "Int8";
    Type[Type["Int16"] = 4] = "Int16";
    Type[Type["Int32"] = 5] = "Int32";
    Type[Type["Int64"] = 6] = "Int64";
    Type[Type["Double"] = 7] = "Double";
    Type[Type["Float"] = 8] = "Float";
    Type[Type["Uint8"] = 9] = "Uint8";
    Type[Type["Uint16"] = 10] = "Uint16";
    Type[Type["Uint32"] = 11] = "Uint32";
    Type[Type["Uint64"] = 12] = "Uint64";
    Type[Type["Boolean"] = 13] = "Boolean";
    Type[Type["Int"] = 14] = "Int";
    Type[Type["Uint"] = 15] = "Uint";
    Type[Type["Bytes"] = 16] = "Bytes";
})(Type = exports.Type || (exports.Type = {}));
